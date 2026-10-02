/**
 * 简历预览性能基线采集
 *
 * 用真实 Edge + CDP 采集两条主链路的开销，作为优化前后的对比口径：
 *   A 模板页：从进入页面到首屏可用（bootMs）、切到样式分类到卡片渲染完成（styleRenderMs），
 *     以及整页 DOM 规模、测量节点数、主线程增量（Layout / RecalcStyle / Script / Task）
 *   B 编辑器打字：打开范本后连续输入正文，记录每次按键的主线程增量与测量树 DOM 变更次数
 *
 * 前置条件：本地 dev server 跑在 5174（pnpm dev:web），Windows 上的 Edge 位于脚本里的默认路径。
 * 用法：pnpm --filter @snowflake/web perf:baseline [输出json路径]
 *
 * 两条已知结论，别再从零试一遍：
 *   1. dev server 的数字不能作为优化依据：Vite dev + Vue DevTools 会放大脚本开销（例如深监听遍历），
 *      生产复测要 pnpm build 后用 preview，并加 --url=http://localhost:4173 --hash。
 *   2. 单轮 taskMs 波动可达 ±30%，必须 --repeat=3 取中位数；落在波动区间内的差异不要当成收益。
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const OUT =
  process.argv[2] && !process.argv[2].startsWith("--") ? path.resolve(process.argv[2]) : null;
/** 是否采集主线程子阶段 trace：pnpm --filter @snowflake/web perf:baseline -- --trace */
const WITH_TRACE = process.argv.includes("--trace");
/** 是否采集打字阶段的 CPU 采样：pnpm --filter @snowflake/web perf:baseline -- --profile */
const WITH_PROFILE = process.argv.includes("--profile");
/** 目标站点：默认本地 dev server，可用 --url=http://localhost:4173 指向生产构建预览 */
const URL_ARG = process.argv.find((arg) => arg.startsWith("--url="));
/** 是否先加载首页再客户端跳转：生产构建资源用相对路径，直接打开嵌套路由会 404 */
const SPA_NAV = process.argv.includes("--spa");
/** 目标站点是否使用 hash 路由：生产构建的路由形如 /#/resume/template */
const HASH_ROUTES = process.argv.includes("--hash");
/** 打字前注入的脚本：用于 A/B 对照（例如隐藏预览，判断渲染开销归属） */
const INJECT_ARG = process.argv.find((arg) => arg.startsWith("--inject="));
const INJECT_FILE_ARG = process.argv.find((arg) => arg.startsWith("--inject-file="));
const INJECT_SCRIPT = INJECT_FILE_ARG
  ? fs.readFileSync(path.resolve(INJECT_FILE_ARG.slice("--inject-file=".length)), "utf8")
  : INJECT_ARG
    ? INJECT_ARG.slice("--inject=".length)
    : "";
/** 打字阶段重复轮数：默认 3 轮取中位数，可用 --repeat=1 只看单轮 */
const REPEAT_ARG = process.argv.find((arg) => arg.startsWith("--repeat="));
const REPEAT = Math.max(1, Number(REPEAT_ARG ? REPEAT_ARG.slice("--repeat=".length) : 3));
/** 打字目标选择器：默认取面板里第一个编辑区，可用 --focus= 指定字段做 A/B */
const FOCUS_ARG = process.argv.find((arg) => arg.startsWith("--focus="));
const FOCUS_SELECTOR = FOCUS_ARG ? FOCUS_ARG.slice("--focus=".length) : "";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DEBUG_PORT = 9351;
const PROFILE_DIR = path.join(os.tmpdir(), `dsh-edge-perf-${Date.now()}`);
const BASE_URL = URL_ARG ? URL_ARG.slice("--url=".length) : "http://localhost:5174";

/** 组装路由地址：hash 路由需要把路径拼到 # 之后 */
const routeUrl = (path) => (HASH_ROUTES ? `${BASE_URL}/#${path}` : `${BASE_URL}${path}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== undefined) {
        const entry = this.pending.get(msg.id);
        if (!entry) return;
        this.pending.delete(msg.id);
        if (msg.error) entry.reject(new Error(JSON.stringify(msg.error)));
        else entry.resolve(msg.result);
        return;
      }
      (this.listeners.get(msg.method) || []).forEach((fn) => fn(msg.params));
    });
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP 超时: ${method}`));
        }
      }, 120000);
    });
  }
}

const waitForDebugger = async () => {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      const version = await response.json();
      if (version.webSocketDebuggerUrl) return version;
    } catch {
      // 还没起来
    }
    await sleep(400);
  }
  throw new Error("Edge 调试端口未就绪");
};

const metricsToMap = (result) =>
  Object.fromEntries((result.metrics || []).map((item) => [item.name, item.value]));

const delta = (before, after, key) => +((after[key] || 0) - (before[key] || 0)).toFixed(2);

/** 取中位数：单次运行波动大时用它作为对照口径 */
const medianOf = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return +value.toFixed(2);
};

/** 汇总 CPU 采样：按「函数 + 位置」累加自身耗时，并给出热点函数的调用栈 */
const summarizeProfile = (profile) => {
  const callFrames = new Map();
  const parentOf = new Map();
  (profile.nodes || []).forEach((node) => {
    const frame = node.callFrame || {};
    const url = String(frame.url || "").replace(/^https?:\/\/[^/]+/, "");
    callFrames.set(
      node.id,
      `${frame.functionName || "(匿名)"} @ ${url}:${(frame.lineNumber ?? 0) + 1}`,
    );
    (node.children || []).forEach((childId) => parentOf.set(childId, node.id));
  });
  const selfTime = new Map();
  const selfTimeById = new Map();
  const samples = profile.samples || [];
  const deltas = profile.timeDeltas || [];
  samples.forEach((nodeId, index) => {
    const key = callFrames.get(nodeId);
    if (!key) return;
    // timeDeltas 单位为微秒
    selfTime.set(key, (selfTime.get(key) || 0) + (deltas[index] || 0));
    selfTimeById.set(nodeId, (selfTimeById.get(nodeId) || 0) + (deltas[index] || 0));
  });
  /** 从热点节点向上回溯调用栈，最多保留四层，用于判断是谁触发的 */
  const stackOf = (nodeId) => {
    const stack = [];
    let current = nodeId;
    for (let depth = 0; depth < 5 && current; depth += 1) {
      const name = callFrames.get(current);
      if (name) stack.push(name.split(" @ ")[0]);
      current = parentOf.get(current);
    }
    return stack.join(" ← ");
  };
  const stacks = [...selfTimeById.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([nodeId, 微秒]) => ({ 自身ms: +(微秒 / 1000).toFixed(1), 调用栈: stackOf(nodeId) }));
  return {
    hotspots: [...selfTime.entries()]
      .map(([函数, 微秒]) => ({ 函数, 自身ms: +(微秒 / 1000).toFixed(1) }))
      .sort((a, b) => b.自身ms - a.自身ms)
      .slice(0, 15),
    stacks,
  };
};
const TRACE_PHASES = [
  // origin: trace 子阶段清单
  "RunTask", // 主线程任务总时长
  "Layout", // 布局
  "UpdateLayoutTree", // 样式重算
  "Paint", // 绘制
  "PrePaint", // 绘制前处理
  "Layerize", // 分层
  "FunctionCall", // 浏览器内部函数调用
  "EvaluateScript", // 脚本求值
  "TimerFire", // 定时器回调
  "ParseHTML", // HTML 解析
];

/** 汇总 trace：按事件名累加 X 阶段耗时，并挑出长任务 */
const summarizeTrace = (events) => {
  const totals = new Map();
  const counts = new Map();
  const tasks = [];
  events.forEach((event) => {
    if (event.ph !== "X" || typeof event.dur !== "number") return;
    totals.set(event.name, (totals.get(event.name) || 0) + event.dur);
    counts.set(event.name, (counts.get(event.name) || 0) + 1);
    if (event.name === "RunTask") tasks.push(event.dur);
  });
  const ms = (name) => +((totals.get(name) || 0) / 1000).toFixed(1);
  tasks.sort((a, b) => b - a);
  return {
    phases: TRACE_PHASES.filter((name) => totals.has(name)).map((name) => ({
      事件: name,
      次数: counts.get(name),
      合计ms: ms(name),
    })),
    runTaskMs: ms("RunTask"),
    runTaskCount: counts.get("RunTask") || 0,
    tasksOver50ms: tasks.filter((value) => value > 50000).length,
    longestTasksMs: tasks.slice(0, 5).map((value) => +(value / 1000).toFixed(1)),
  };
};

const main = async () => {
  const edge = spawn(
    EDGE,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${PROFILE_DIR}`,
      "--window-size=1600,1000",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  edge.on("error", (error) => console.log("Edge 启动错误:", error.message));

  try {
    const version = await waitForDebugger();
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve);
      ws.addEventListener("error", () => reject(new Error("WebSocket 连接失败")));
    });
    const cdp = new CDP(ws);
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const send = (method, params = {}) => cdp.send(method, params, sessionId);
    const evaluate = async (expression, awaitPromise = false) => {
      const result = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise,
      });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "页面脚本异常");
      return result.result?.value;
    };
    const settle = async () => {
      let last = -1;
      for (let i = 0; i < 20; i += 1) {
        const count = await evaluate("document.querySelectorAll('*').length");
        if (count === last) return count;
        last = count;
        await sleep(1200);
      }
      return last;
    };
    const clickByText = (text, scopeText = "") =>
      evaluate(`(() => {
        const buttons = [...document.querySelectorAll('button, a, [role="button"]')].filter(
          (el) => (el.innerText || '').trim() === ${JSON.stringify(text)},
        );
        if (!${JSON.stringify(scopeText)}) {
          if (!buttons[0]) return false;
          buttons[0].click();
          return true;
        }
        const scoped = buttons
          .map((el) => {
            let node = el;
            for (let i = 0; i < 10 && node; i += 1, node = node.parentElement) {
              if ((node.innerText || '').includes(${JSON.stringify(scopeText)})) return { el, card: node };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => (a.card.innerText || '').length - (b.card.innerText || '').length);
        if (!scoped[0]) return false;
        scoped[0].el.click();
        return true;
      })()`);

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Performance.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1600,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 轮询等待条件成立，返回耗时：用于量「到首屏可用」与「到样式卡片渲染完成」
    const waitUntil = async (expression, timeoutMs = 30000) => {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        if (await evaluate(expression)) return Date.now() - startedAt;
        await sleep(100);
      }
      return -1;
    };

    const report = {};

    // ---------- A 模板页冷启动 ----------
    await send("Performance.getMetrics").then((m) => (report.coldStartBefore = metricsToMap(m)));
    const coldStartAt = Date.now();
    if (SPA_NAV) {
      // 生产构建资源是相对路径：先加载首页，再交给前端路由跳转
      await send("Page.navigate", { url: `${BASE_URL}/` });
      await sleep(6000);
      await evaluate(`(() => {
        window.history.pushState({}, '', '/resume/template');
        window.dispatchEvent(new PopStateEvent('popstate'));
      })()`);
      await sleep(3000);
    } else {
      await send("Page.navigate", { url: routeUrl("/resume/template") });
    }
    const bootMs = await waitUntil("document.querySelectorAll('.resume-page-item').length > 0");
    await sleep(2000);
    await clickByText("简历模板");
    const styleRenderMs = await waitUntil(
      "document.querySelectorAll('.resume-page-item').length >= 15",
    );
    // 滚动到底把全部样式卡片揭示出来，作为首屏渲染的最坏口径
    for (let i = 0; i < 8; i += 1) {
      await evaluate(`(() => {
        const scrollers = [...document.querySelectorAll('*')].filter(
          (el) => el.scrollHeight > el.clientHeight + 50 && !['visible', 'hidden'].includes(getComputedStyle(el).overflowY),
        );
        scrollers.forEach((el) => { el.scrollTop = el.scrollHeight; });
      })()`);
      await sleep(1200);
    }
    await settle();
    const coldStartMs = Date.now() - coldStartAt;
    const coldAfter = metricsToMap(await send("Performance.getMetrics"));
    const coldBefore = report.coldStartBefore;
    delete report.coldStartBefore;
    const galleryProbe = await evaluate(`(() => ({
      cards: document.querySelectorAll('.resume-page-item').length,
      nodes: document.querySelectorAll('*').length,
      measureNodes: document.querySelectorAll('.layout-measure-node').length,
    }))()`);
    report.gallery = {
      bootMs,
      styleRenderMs,
      coldStartMs,
      ...galleryProbe,
      layoutCount: delta(coldBefore, coldAfter, "LayoutCount"),
      recalcStyleCount: delta(coldBefore, coldAfter, "RecalcStyleCount"),
      layoutMs: delta(coldBefore, coldAfter, "LayoutDuration") * 1000,
      recalcStyleMs: delta(coldBefore, coldAfter, "RecalcStyleDuration") * 1000,
      scriptMs: delta(coldBefore, coldAfter, "ScriptDuration") * 1000,
      taskMs: delta(coldBefore, coldAfter, "TaskDuration") * 1000,
    };

    // ---------- B 编辑器打字 ----------
    // 用第一张内容范本进入编辑器
    await clickByText("使用模板");
    await sleep(6000);
    const editorNodes = await settle();
    await evaluate(`(() => {
      window.__measureMutations = 0;
      window.__panelMutations = 0;
      const host = document.querySelector('.layout-measure-node')?.closest('.flex.h-auto.flex-col') ||
        document.querySelector('.layout-measure-node')?.closest('div[style*="-100000px"]') ||
        document.querySelector('.layout-measure-node')?.parentElement?.parentElement?.parentElement;
      window.__measureHost = host || null;
      // 面板与测量树分别计数：用于判断打字期间 DOM 变更主要落在哪一侧
      const panel = document.querySelector('.resume-editor-form');
      window.__panelHost = panel || null;
      if (host) {
        const observer = new MutationObserver((records) => {
          window.__measureMutations += records.length;
        });
        observer.observe(host, { childList: true, subtree: true, attributes: true, characterData: true });
      }
      if (panel) {
        const panelObserver = new MutationObserver((records) => {
          window.__panelMutations += records.length;
        });
        panelObserver.observe(panel, { childList: true, subtree: true, attributes: true, characterData: true });
      }
      return Boolean(host || panel);
    })()`);
    const typingBefore = metricsToMap(await send("Performance.getMetrics"));
    if (INJECT_SCRIPT) {
      report.inject = await evaluate(INJECT_SCRIPT);
    }
    const focusInfo = await evaluate(`(() => {
      const selector = ${JSON.stringify(FOCUS_SELECTOR)} ||
        '.resume-editor-form [contenteditable="true"], .resume-editor-form textarea, .resume-editor-form input';
      const input = document.querySelector(selector);
      if (!input) return null;
      input.focus();
      window.__typedTarget = input;
      return {
        tag: input.tagName,
        cls: String(input.className).slice(0, 60),
        contentEditable: input.isContentEditable === true,
        beforeLength: (input.isContentEditable ? input.innerText : input.value || '').length,
      };
    })()`);
    const KEY = "测";
    // --trace：采集打字阶段的主线程子阶段耗时，用于判断该优化脚本还是渲染
    const traceEvents = [];
    if (WITH_TRACE) {
      cdp.on(
        "Tracing.dataCollected",
        (payload) => payload?.value && traceEvents.push(...payload.value),
      );
      await send("Tracing.start", {
        categories:
          "devtools.timeline,blink.user_timing,v8.execute,disabled-by-default-devtools.timeline",
        transferMode: "ReportEvents",
      });
    }
    // --profile：采集打字阶段的 CPU 采样，用于定位热点函数
    if (WITH_PROFILE) {
      await send("Profiler.enable");
      await send("Profiler.setSamplingInterval", { interval: 200 });
      await send("Profiler.start");
    }
    // 多轮重复：单次 taskMs 波动可达 ±30%，取中位数才能支撑优化前后的比较
    const typingRuns = [];
    for (let round = 0; round < REPEAT; round += 1) {
      await evaluate(`(() => {
        window.__measureMutations = 0;
        window.__panelMutations = 0;
        const input = window.__typedTarget;
        if (input) input.focus();
      })()`);
      const roundBefore = metricsToMap(await send("Performance.getMetrics"));
      for (let i = 0; i < 24; i += 1) {
        await send("Input.dispatchKeyEvent", { type: "keyDown", text: KEY, key: KEY });
        await send("Input.dispatchKeyEvent", { type: "char", text: KEY, key: KEY });
        await send("Input.dispatchKeyEvent", { type: "keyUp", key: KEY });
        await sleep(50);
      }
      await sleep(1500);
      const roundAfter = metricsToMap(await send("Performance.getMetrics"));
      const roundProbe = await evaluate(`(() => ({
        measureMutations: window.__measureMutations,
        panelMutations: window.__panelMutations,
      }))()`);
      typingRuns.push({
        taskMs: delta(roundBefore, roundAfter, "TaskDuration") * 1000,
        layoutMs: delta(roundBefore, roundAfter, "LayoutDuration") * 1000,
        layoutCount: delta(roundBefore, roundAfter, "LayoutCount"),
        recalcStyleMs: delta(roundBefore, roundAfter, "RecalcStyleDuration") * 1000,
        scriptMs: delta(roundBefore, roundAfter, "ScriptDuration") * 1000,
        measureMutations: roundProbe.measureMutations,
        panelMutations: roundProbe.panelMutations,
      });
      console.log(
        `第 ${round + 1} 轮：taskMs=${typingRuns[round].taskMs} 测量树变更=${typingRuns[round].measureMutations} 面板变更=${typingRuns[round].panelMutations}`,
      );
    }
    let cpuProfile = null;
    if (WITH_PROFILE) {
      const result = await send("Profiler.stop");
      cpuProfile = result.profile || null;
    }
    if (WITH_TRACE) {
      const done = new Promise((resolve) => cdp.on("Tracing.tracingComplete", resolve));
      await send("Tracing.end");
      await done;
    }
    const typingAfter = metricsToMap(await send("Performance.getMetrics"));
    const typingProbe = await evaluate(`(() => {
      const target = window.__typedTarget;
      return {
        measureMutations: window.__measureMutations,
        panelMutations: window.__panelMutations,
        panelHostFound: Boolean(window.__panelHost),
        hasHost: !!window.__measureHost,
        nodes: document.querySelectorAll('*').length,
        measureNodes: document.querySelectorAll('.layout-measure-node').length,
        afterLength: target ? (target.isContentEditable ? target.innerText : target.value || '').length : null,
      };
    })()`);
    report.typingRuns = typingRuns;
    report.editor = {
      editorNodes,
      focus: focusInfo,
      keys: 24,
      // 输入是否真的落进编辑器：长度增加说明按键生效，基线才可信
      typedDelta:
        focusInfo && typingProbe.afterLength !== null
          ? typingProbe.afterLength - focusInfo.beforeLength
          : null,
      measureHostFound: typingProbe.hasHost,
      measureMutations: medianOf(typingRuns.map((run) => run.measureMutations)),
      panelHostFound: typingProbe.panelHostFound,
      panelMutations: medianOf(typingRuns.map((run) => run.panelMutations)),
      nodes: typingProbe.nodes,
      measureNodes: typingProbe.measureNodes,
      // 以下为多轮中位数，避免单次运行波动误导结论
      runs: typingRuns.length,
      layoutCount: medianOf(typingRuns.map((run) => run.layoutCount)),
      recalcStyleCount: delta(typingBefore, typingAfter, "RecalcStyleCount"),
      layoutMs: medianOf(typingRuns.map((run) => run.layoutMs)),
      recalcStyleMs: medianOf(typingRuns.map((run) => run.recalcStyleMs)),
      scriptMs: medianOf(typingRuns.map((run) => run.scriptMs)),
      taskMs: medianOf(typingRuns.map((run) => run.taskMs)),
      jsListeners: delta(typingBefore, typingAfter, "JSEventListeners"),
    };

    if (WITH_TRACE && traceEvents.length) {
      const summary = summarizeTrace(traceEvents);
      report.trace = summary;
      console.log("\n=== 打字阶段主线程子阶段（trace）===");
      console.table(summary.phases);
      console.log(
        `RunTask ${summary.runTaskCount} 次 / ${summary.runTaskMs} ms；>50ms 任务 ${summary.tasksOver50ms} 个；最长 ${summary.longestTasksMs.join(", ")} ms`,
      );
    }

    if (cpuProfile) {
      const hotspots = summarizeProfile(cpuProfile);
      report.profile = hotspots.hotspots;
      report.profileStacks = hotspots.stacks;
      console.log("\n=== 打字阶段 CPU 热点（自身耗时 Top 15）===");
      console.table(hotspots.hotspots);
      console.log("\n=== 热点调用栈 ===");
      hotspots.stacks.forEach((item) => console.log(`  ${item.自身ms}ms  ${item.调用栈}`));
    }

    console.log(JSON.stringify(report, null, 2));
    if (OUT) fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
    ws.close();
  } finally {
    try {
      edge.kill();
    } catch {
      // 忽略
    }
  }
};

main().catch((error) => {
  console.log("性能采集失败:", error.message);
  process.exitCode = 1;
});
