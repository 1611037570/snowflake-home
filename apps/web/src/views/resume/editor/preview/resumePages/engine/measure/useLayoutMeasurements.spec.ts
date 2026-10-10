import { computed, effectScope, nextTick, ref, unref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useLayoutMeasurements } from "./useLayoutMeasurements";
import { paginateFlow } from "../paginate/paginateFlow";
import type { LayoutNode } from "../types";

const resize = vi.hoisted(() => ({
  targets: undefined as any, // 尺寸观察器当前监听的元素
  notify: undefined as (() => void) | undefined, // 模拟节点尺寸变化通知
}));
vi.mock("@vueuse/core", () => ({
  unrefElement: (element: any) => unref(element), // 读取真实测量宿主
  useResizeObserver: (targets: any, notify: () => void) => {
    resize.targets = targets;
    resize.notify = notify;
    return { stop: vi.fn() /* 停止尺寸观察 */ };
  },
}));

describe("节点尺寸变化重新分页", () => {
  it("栏内装饰尺寸与内容能力变化会作废旧测量", async () => {
    const root = document.createElement("div");
    const decisions = ref({
      regions: { main: { columns: { left: { left: 0 /* 左侧装饰空间 */, right: 0 /* 右侧装饰空间 */ } } } }, // 栏几何声明
      userContent: { renderer: "userHeading" /* 个人信息组件 */, split: "whole" /* 整块展示 */ }, // 内容能力
      topDecoration: "", // 当前独立装饰编号
    });
    const scope = effectScope();
    const engine = scope.run(() => useLayoutMeasurements({
      measureRef: ref(root), // 不改变宿主尺寸
      nodes: computed(() => []), // 不改变节点清单
      watchSource: computed(() => ({ themeDecisions: decisions.value })), // 只改变固定能力
    }))!;
    try {
      await engine.measure();
      expect(engine.measureDone.value).toBe(true);
      decisions.value.regions.main.columns.left.left = 30;
      expect(engine.measureDone.value).toBe(false);
      await engine.measure();
      decisions.value.userContent.renderer = "twoColumnUser";
      expect(engine.measureDone.value).toBe(false);
      await engine.measure();
      decisions.value.topDecoration = "band";
      expect(engine.measureDone.value).toBe(false);
    } finally {
      engine.stop();
      scope.stop();
    }
  });

  it("独立装饰按真实高度测量，异步增高后更新首页占位", async () => {
    const root = document.createElement("div");
    root.innerHTML = '<div data-layout-decoration></div>';
    const decoration = root.firstElementChild as HTMLElement;
    let height = 108;
    vi.spyOn(decoration, "getBoundingClientRect").mockImplementation(() => new DOMRect(0, 0, 794, height));
    const scope = effectScope();
    const engine = scope.run(() => useLayoutMeasurements({
      measureRef: ref(root), // 装饰测量宿主
      nodes: computed(() => []), // 装饰不属于业务节点
      watchSource: computed(() => ({})), // 保持页面配置不变
    }))!;
    try {
      await engine.measure();
      expect(engine.decorationHeight.value).toBe(108);
      expect(unref(resize.targets)).toContain(decoration);
      height = 156;
      resize.notify!();
      await nextTick();
      await engine.measure();
      expect(engine.decorationHeight.value).toBe(156);
      expect(engine.measurements.value.size).toBe(0);
    } finally {
      engine.stop();
      scope.stop();
    }
  });

  it("宿主高度不变时异步内容增高仍触发测量和换页", async () => {
    const root = document.createElement("div");
    root.style.minHeight = "1123px";
    root.innerHTML = '<div data-layout-node-id="first"></div><div data-layout-node-id="second"></div>';
    const elements = Array.from(root.children) as HTMLElement[];
    let secondHeight = 30;
    vi.spyOn(elements[0], "getBoundingClientRect").mockImplementation(() => new DOMRect(0, 0, 300, 60));
    vi.spyOn(elements[1], "getBoundingClientRect").mockImplementation(() => new DOMRect(0, 60, 300, secondHeight));
    const nodes = computed<LayoutNode[]>(() => elements.map((element) => ({
      id: element.dataset.layoutNodeId!, // 节点编号
      sourceModuleKey: "test", // 节点所属模块
      type: "block", // 不可拆分内容块
      payload: null, // 本用例不依赖业务载荷
    })));
    const scope = effectScope();
    const engine = scope.run(() => useLayoutMeasurements({
      measureRef: ref(root), // 高度始终由最小高度撑住的宿主
      nodes, // 异步内容所属节点
      watchSource: computed(() => ({})), // 页面配置保持不变
    }))!;
    try {
      await engine.measure();
      const pages = () => paginateFlow({
        nodes: nodes.value, // 当前排版节点
        measurements: engine.measurements.value, // 最新实测高度
        heights: { firstPageHeight: 100 /* 首页高度 */, laterPageHeight: 100 /* 续页高度 */ },
        gap: 0, // 本用例无模块间距
      });
      expect(pages()).toHaveLength(1);
      const targets = unref(resize.targets);
      expect(Array.isArray(targets) ? targets : [targets]).toContain(elements[1]);
      secondHeight = 50;
      resize.notify!();
      expect(engine.measureDone.value).toBe(false);
      await nextTick();
      await engine.measure();
      expect(pages()).toHaveLength(2);
      expect(pages().flatMap((page) => page.items).map((item) => item.nodeId)).toEqual(["first", "second"]);
    } finally {
      engine.stop();
      scope.stop();
    }
  });
});
