import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useResumeLayout } from "./useResumeLayout";
import { DEFAULT_THEME_DECISIONS, type ThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import type { LayoutNode } from "./types";
import type { MeasuredNode } from "./measure/types";

// 固定节点与测量尺寸，验证真实布局到跨页计划的排序链路。
vi.mock("./adapter/buildLayoutNodes", () => ({
  createLayoutNodeBuilder: () => ({ moduleKeys }: { moduleKeys: string[] /* 原始模块顺序 */ }) =>
    moduleKeys.flatMap((key) => ["title", "block"].map((type): LayoutNode => ({
      id: `${key}-${type}`, // 节点唯一标识
      sourceModuleKey: key, // 节点所属模块
      type: type as LayoutNode["type"], // 标题或正文节点
      payload: null, // 本用例不依赖正文内容
    }))),
}));
vi.mock("./measure/useLayoutMeasurements", () => ({
  useLayoutMeasurements: ({ nodes }: { nodes: { value: LayoutNode[] } /* 待测量节点 */ }) => ({
    measureDone: ref(true), // 测量已完成
    decorationHeight: ref(0), // 本用例没有顶部独立装饰
    measurements: computed(() => new Map(nodes.value.map((node) => [node.id, {
      nodeId: node.id, // 被测量节点标识
      width: 300, // 固定栏宽
      fullHeight: node.type === "title" ? 12 : 600, // 正文高度使多个模块跨页
      breakPoints: [], // 使用不可拆分节点
    } satisfies MeasuredNode]))), // 节点测量结果
  }),
}));
vi.mock("@/stores/modules/resume/config/uiConfig", () => ({
  defaultLeftColumnWidth: 40, // 双栏默认左栏宽度比例
}));

describe("双栏模块顺序同步", () => {
  it.each(["twoColumn", "topUserTwoColumn"])("%s 更新栏内顺序后测量与跨页预览同步", (type) => {
    const ui = ref({
      layout: { // 页面布局配置
        columns: { // 保存的左右栏模块顺序
          left: ["user", "skill", "advantage"], // 左栏模块顺序
          right: ["work", "education"], // 右栏模块顺序
        },
      },
    });
    const engine = useResumeLayout({
      measureRef: ref(null), // 不使用真实测量宿主
      data: computed(() => ({})), // 节点工厂不依赖业务数据
      allModules: computed(() => ["user", "skill", "advantage", "work", "education"].map((key) => ({
        key, // 原始模块标识与顺序
      }))), // 原始表单模块配置
      ui: computed(() => ui.value), // 响应式布局配置
      themeDecisions: computed<ThemeDecisions>(() => ({
        ...DEFAULT_THEME_DECISIONS,
        layoutType: type as ThemeDecisions["layoutType"], // 主题固定版式
      })), // 独立主题外观
      showPageNumber: computed(() => false), // 不显示页码
      fontReadyVersion: ref(0), // 固定字体版本
      renderSignature: computed(() => ""), // 无额外字段测量签名
      isThumb: ref(false), // 使用完整预览
    });
    const pageNodeIds = (columnId: string) => engine.pagePlan.value.pages.flatMap((page) =>
      page.regions.flatMap((region) => region.columns
        .filter((column) => column.columnId === columnId)
        .flatMap((column) => column.fragments.map((fragment) => fragment.sourceNodeId))),
    );
    const measureNodeIds = (columnId: string) => engine.measureGroups.value
      .find((group) => group.id === columnId)?.nodes.map((node) => node.id);
    const expectOrder = (columnId: string, keys: string[]) => {
      const ids = keys.flatMap((key) => [`${key}-title`, `${key}-block`]);
      expect(measureNodeIds(columnId)).toEqual(ids);
      expect(pageNodeIds(columnId)).toEqual(ids);
    };
    expectOrder("right", ["work", "education"]);
    ui.value.layout.columns.right = ["education", "work"];
    ui.value.layout.columns.left = ["user", "advantage", "skill"];
    expectOrder("right", ["education", "work"]);
    expectOrder("left", type === "twoColumn" ? ["user", "advantage", "skill"] : ["advantage", "skill"]);
    expect(engine.pagePlan.value.pages.length).toBeGreaterThan(1);
    // 恢复原顺序并跨栏移动，确保上下与左右操作都传入分页链路。
    ui.value.layout.columns.right = ["work"];
    ui.value.layout.columns.left = ["user", "skill", "advantage", "education"];
    expectOrder("right", ["work"]);
    expectOrder("left", type === "twoColumn" ? ["user", "skill", "advantage", "education"] : ["skill", "advantage", "education"]);
  });
});
