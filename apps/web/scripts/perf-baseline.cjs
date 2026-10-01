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
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const OUT = process.argv[2] ? path.resolve(process.argv[2]) : null;
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DEBUG_PORT = 9351;
const PROFILE_DIR = path.join(os.tmpdir(), `dsh-edge-perf-${Date.now()}`);
const BASE_URL = "http://localhost:5174";

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
    await send("Page.navigate", { url: `${BASE_URL}/resume/template` });
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
      const host = document.querySelector('.layout-measure-node')?.closest('.flex.h-auto.flex-col') ||
        document.querySelector('.layout-measure-node')?.closest('div[style*="-100000px"]') ||
        document.querySelector('.layout-measure-node')?.parentElement?.parentElement?.parentElement;
      window.__measureHost = host || null;
      if (!host) return false;
      const observer = new MutationObserver((records) => {
        window.__measureMutations += records.length;
      });
      observer.observe(host, { childList: true, subtree: true, attributes: true, characterData: true });
      window.__measureObserver = observer;
      return true;
    })()`);
    const typingBefore = metricsToMap(await send("Performance.getMetrics"));
    const focusInfo = await evaluate(`(() => {
      const input = document.querySelector('.resume-editor-form [contenteditable="true"], .resume-editor-form textarea, .resume-editor-form input');
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
    for (let i = 0; i < 24; i += 1) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", text: KEY, key: KEY });
      await send("Input.dispatchKeyEvent", { type: "char", text: KEY, key: KEY });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: KEY });
      await sleep(50);
    }
    await sleep(1500);
    const typingAfter = metricsToMap(await send("Performance.getMetrics"));
    const typingProbe = await evaluate(`(() => {
      const target = window.__typedTarget;
      return {
        measureMutations: window.__measureMutations,
        hasHost: !!window.__measureHost,
        nodes: document.querySelectorAll('*').length,
        measureNodes: document.querySelectorAll('.layout-measure-node').length,
        afterLength: target ? (target.isContentEditable ? target.innerText : target.value || '').length : null,
      };
    })()`);
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
      measureMutations: typingProbe.measureMutations,
      nodes: typingProbe.nodes,
      measureNodes: typingProbe.measureNodes,
      layoutCount: delta(typingBefore, typingAfter, "LayoutCount"),
      recalcStyleCount: delta(typingBefore, typingAfter, "RecalcStyleCount"),
      layoutMs: delta(typingBefore, typingAfter, "LayoutDuration") * 1000,
      recalcStyleMs: delta(typingBefore, typingAfter, "RecalcStyleDuration") * 1000,
      scriptMs: delta(typingBefore, typingAfter, "ScriptDuration") * 1000,
      taskMs: delta(typingBefore, typingAfter, "TaskDuration") * 1000,
      jsListeners: delta(typingBefore, typingAfter, "JSEventListeners"),
    };

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
