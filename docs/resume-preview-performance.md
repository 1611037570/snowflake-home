# 简历预览性能基线与优化记录

本文档记录简历预览与编辑链路的性能基线、采集方式与每次优化的复测结果。
基线由 `apps/web/scripts/perf-baseline.cjs` 采集，优化前后必须用同一脚本、同一机器复测。

## 采集方式

```bash
pnpm dev:web                                   # 本地起 dev server（默认 5174）
pnpm --filter @snowflake/web perf:baseline     # 采集并打印 JSON，可追加输出路径
```

脚本用真实 Edge + CDP 跑两条链路：

- **A 模板页**：进入页面到首屏可用（`bootMs`）→ 切到样式分类到卡片渲染完成（`styleRenderMs`）→ 滚动揭示全部样式卡片后的整页规模与主线程增量。
- **B 编辑器打字**：用第一张内容范本进入编辑器，聚焦正文富文本编辑器，连发 24 组按键事件（每组插入 2 个字符），记录主线程增量与测量树 DOM 变更次数。`typedDelta` 用于确认按键真的落进了编辑器，为 0 说明这次采集无效。

主线程增量取 `Performance.getMetrics` 的差值：`Layout`、`RecalcStyle`、`Script`、`Task`（单位毫秒）。

## 初始基线（优化前）

环境：Windows + Edge headless（`--headless=new`，1600×1000，deviceScaleFactor 1），dev server 5174，2026-10-02。

| 指标            | 模板页                                 | 编辑器打字（24 组按键 / 48 字符） |
| --------------- | -------------------------------------- | --------------------------------- |
| 首屏            | `bootMs` 899ms，`styleRenderMs` 2178ms | 进编辑器后 DOM 5401 节点          |
| DOM 规模        | 22144 节点（27 张卡片），测量节点 693  | 5521 节点，测量节点 26            |
| Layout          | 254 次 / 260ms                         | 192 次 / 50ms                     |
| RecalcStyle     | 1013 次 / 250ms                        | 294 次 / 50ms                     |
| Script          | 90ms                                   | 30ms                              |
| Task 合计       | 4970ms                                 | 1140ms（约 **47ms / 组按键**）    |
| 测量树 DOM 变更 | —                                      | 6552 次（约 273 次 / 组按键）     |

## 观察到的热点

1. **打字期间测量树整体重渲染**：26 个测量节点的树，每组按键产生约 273 次 DOM 变更，远超节点数；测量与 Vue 渲染叠加后每组按键约 47ms 主线程时间，是打字卡顿的主要来源。
2. **模板页整页渲染 27 张卡片**：22144 个 DOM 节点、693 个测量节点、约 5s 主线程任务时间；卡片是整页 `ResumePages`（含隐藏测量树），一次性全量挂载。
3. 编辑器 DOM 有 5401 个节点，其中测量树只有 26 个，主要是表单侧面板占用量。

## 打字开销拆分（`--trace` + `--profile`）

```bash
pnpm --filter @snowflake/web perf:baseline -- --trace     # 主线程子阶段
pnpm --filter @snowflake/web perf:baseline -- --profile   # CPU 采样热点
```

24 组按键（每组 2 个字符）的主线程约 1660ms，约 47ms / 组。trace 子阶段：

| 子阶段           | 次数 | 合计   |
| ---------------- | ---- | ------ |
| Layout           | 143  | 84.1ms |
| Layerize         | 114  | 57.8ms |
| Paint            | 512  | 45.8ms |
| UpdateLayoutTree | 242  | 39.1ms |
| PrePaint         | 116  | 30.8ms |
| FunctionCall     | 2732 | 63.9ms |
| TimerFire        | 98   | 21.1ms |
| ParseHTML        | 4182 | 12.8ms |

CPU 采样自身耗时 Top：`traverse` **178.9ms**、`get` 85.9ms、GC 78.8ms、`patchDOMProp` 70.4ms、`update` 64.2ms、`appendChild` 59.9ms、`setStyle` 42ms、`setFullProps` 29.7ms。

结论：打字开销约一半在 JS（每组合计约 24ms），其中 `traverse` 一项约占 7.5ms / 组；另一半在样式重算、布局与绘制（约 11ms / 组）。

## 优化方向（按收益排序）

1. **收窄 `traverse` 的来源**：`stores/modules/resume/index.ts` 用 `watch(() => currentItem.value, …, { deep: true })` 监听整份简历（data + config + ui）来广播内容变更脉冲，每次按键都要深度遍历整个响应式对象。目标是改成显式的「内容已变更」脉冲（在表单写入的唯一入口打标），必须逐条覆盖所有写入路径（表单引擎、布局设置、工具栏、撤销重做、导入）后再切换。
2. **降低测量树的 DOM 变更量**：`patchDOMProp` / `setStyle` / `appendChild` 合计约 7ms / 组，来自测量树每次重新绑定节点样式；先摸清每类变更来源再决定是否拆分渲染范围。
3. **减少布局与绘制次数**：`Layout` 143 次 / 84ms，`Layerize` + `Paint` + `PrePaint` 约 134ms，来自预览页整树重渲染；可考虑复用未变化的页面片段。

## 优化记录

每完成一项优化，在此追加一行：改动、复测数值、结论。

| 轮次 | 改动 | 模板页 Task | 打字 Task | 测量树变更 | 结论 |
| ---- | ---- | ----------- | --------- | ---------- | ---- |
| 基线 | —    | 4970ms      | 1140ms    | 6552       | 见上 |
