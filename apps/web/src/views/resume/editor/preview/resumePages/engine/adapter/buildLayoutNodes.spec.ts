import { describe, expect, it } from "vitest";
import { buildLayoutNodes, createLayoutNodeBuilder } from "./buildLayoutNodes";
import { resumeThemeRegistry } from "@/domain/resume/theme/styles";
import { createLayoutAdapterRegistry } from "./index";
import type { LayoutNode } from "../types";

describe("通用模块装配", () => {
  it("多个实例交替构建时各自复用节点，内容改变与删除仍及时更新", () => {
    const registry = createLayoutAdapterRegistry();
    registry.register("entry", ({ data }) => [{
      id: "entry.content", // 相同节点编号用于验证实例隔离
      sourceModuleKey: "entry", // 通用模块来源
      type: "block", // 普通内容块
      payload: { value: data.text /* 当前实例文字 */ }, // 独立业务载荷
    }]);
    const buildFirst = createLayoutNodeBuilder(registry);
    const buildSecond = createLayoutNodeBuilder(registry);
    const firstInput = { moduleKeys: ["entry"], data: { text: "甲" /* 第一实例正文 */ } }; // 第一实例输入
    const secondInput = { moduleKeys: ["entry"], data: { text: "乙" /* 第二实例正文 */ } }; // 第二实例输入
    const first = buildFirst(firstInput);
    const second = buildSecond(secondInput);
    expect(buildFirst(firstInput)[1]).toBe(first[1]);
    expect(buildSecond(secondInput)[1]).toBe(second[1]);
    expect(first[1]).not.toBe(second[1]);
    firstInput.data.text = "更新";
    const updated = buildFirst(firstInput);
    expect(updated[1]).not.toBe(first[1]);
    expect(updated[1]?.payload).toEqual({ value: "更新" /* 修改后正文 */ });
    expect(buildSecond(secondInput)[1]).toBe(second[1]);
    expect(buildFirst({ ...firstInput, moduleKeys: [] })).toEqual([]);
    expect(buildFirst(firstInput)[1]).not.toBe(updated[1]);
  });
  it("新注册模块直接获得标题与段间距，不需要维护模块名单", () => {
    const registry = createLayoutAdapterRegistry();
    registry.register("new_module", () => [{
      id: "new_module.content", // 稳定节点编号
      sourceModuleKey: "new_module", // 新业务模块编号
      type: "block", // 通用内容块
      contentKind: "block", // 公共文本内容组件
      payload: { value: "内容" /* 文本内容 */ }, // 内容载荷
    }]);
    const options = {
      moduleKeys: ["new_module"], // 不在内置名单中的模块
      data: {}, // 适配器提供本用例载荷
      ui: { page: { spacing: { paragraph: 12 /* 段间距 */ } } }, // 公共排版配置
      registry, // 自定义适配器注册表
    };
    expect(buildLayoutNodes(options).map((node) => node.type)).toEqual(["title", "spacer", "block"]);
    registry.register("new_module", registry.resolve("new_module")!, {
      title: false, // 显式不生成标题
      paragraphSpacing: false, // 显式不生成段间距
    });
    expect(buildLayoutNodes(options).map((node) => node.type)).toEqual(["block"]);
  });

  it("内容语义变更不会复用旧组件对应的节点", () => {
    const registry = createLayoutAdapterRegistry();
    let kind = "account";
    registry.register("entry", (): LayoutNode[] => [{
      id: "entry.content", // 不变的节点编号
      sourceModuleKey: "entry", // 不变的业务来源
      type: "block", // 不变的算法节点类型
      contentKind: kind, // 可变的内容组件语义
      payload: { item: { name: "内容" /* 条目名称 */ } }, // 不变的业务内容
    }]);
    const options = { moduleKeys: ["entry"], data: {}, registry }; // 同一业务输入与注册表
    const buildNodes = createLayoutNodeBuilder(registry);
    const first = buildNodes(options).find((node) => node.id === "entry.content")!;
    kind = "honor";
    const second = buildNodes(options).find((node) => node.id === "entry.content")!;
    expect(second).not.toBe(first);
    expect(second.contentKind).toBe("honor");
  });
});

describe("buildLayoutNodes media modules", () => {
  it("实习经历使用经历节点并保留岗位与部门信息", () => {
    const nodes = buildLayoutNodes({
      moduleKeys: ["internship"], // 当前预览的实习模块。
      data: { // 当前简历业务数据。
        internship: { // 实习经历模块。
          list: [{ // 实习记录列表。
            data: { // 实习业务字段。
              name: "实习公司", // 公司名称。
              post: "产品实习生", // 实习岗位。
              department: "产品部", // 所在部门。
              content: "<p>参与需求调研。</p>", // 实习正文。
            },
          }],
        },
      },
    });
    const item = nodes.find((node) => node.id === "internship.item-0");
    expect(item?.contentKind).toBe("experienceDetails");
    expect(item?.sourceModuleKey).toBe("internship");
    expect(item?.payload).toMatchObject({ inlineInfo: ["产品实习生", "产品部"] });
    expect(item?.breakPoints?.length).toBeGreaterThan(0);
  });

  it.each(["work", "internship", "project", "education", "account", "honor", "portfolio", "custom_demo"])(
    "%s 模块每个条目前均保留独立段间距",
    (moduleKey) => {
      const nodes = buildLayoutNodes({
        // 模块列表：验证各类列表模块共用的段间距逻辑
        moduleKeys: [moduleKey],
        // 模块数据：连续三个有效条目
        data: {
          [moduleKey]: {
            // 条目列表：名称用于生成有效内容节点
            list: ["首条", "次条", "末条"].map((name) => ({
              // 业务数据：条目显示名称
              data: { name /* 条目名称 */ },
            })),
          },
        },
        // 排版配置：段间距为十二像素
        ui: { page: { spacing: { paragraph: 12 /* 段间距 */ } } },
      });

      // 每个条目前都应有间距节点，第二条及后续条目不能遗漏。
      expect(nodes.map((node) => node.type)).toEqual([
        "title",
        "spacer",
        nodes[2]!.type,
        "spacer",
        nodes[2]!.type,
        "spacer",
        nodes[2]!.type,
      ]);
      const spacers = nodes.filter((node) => node.type === "spacer");
      expect(spacers.map((node) => node.id)).toEqual(
        nodes
          .filter((node) => node.type !== "title" && node.type !== "spacer")
          .map((node) => `${node.id}.paragraph-spacing`),
      );
      expect(spacers.every((node) => node.hideWhenPageLeading)).toBe(true);
      expect(spacers.map((node) => node.payload)).toEqual([
        { height: 12 /* 间距高度 */ },
        { height: 12 /* 间距高度 */ },
        { height: 12 /* 间距高度 */ },
      ]);
    },
  );

  it("creates image and link works through the portfolio adapter", () => {
    const nodes = buildLayoutNodes({
      moduleKeys: ["portfolio"],
      data: {
        portfolio: { list: [
          { data: { img: "/image.png", name: "图片作品" } },
          { data: { url: "https://example.com/work", name: "链接作品" } },
        ] },
      },
    });

    // 作品集统一生成媒体节点，图片和链接条目使用同一种语义。
    expect(nodes.map((node) => [node.id, node.type])).toEqual([
      ["portfolio.title", "title"],
      ["portfolio.media-0", "media"],
      ["portfolio.media-1", "media"],
    ]);
    expect(
      nodes
        .filter((node) => node.type === "media")
        .map((node) => (node.payload as { mediaType: string /* 作品集媒体语义 */ }).mediaType),
    ).toEqual(["portfolio", "portfolio"]);
    expect(
      nodes
        .filter((node) => node.type === "title")
        .map((node) => (node.payload as { moduleKey: string /* 标题所属模块 */ }).moduleKey),
    ).toEqual(["portfolio"]);
  });

});

describe("buildLayoutNodes slogan module", () => {
  it("独立装饰能力不生成业务节点，空标语不会被装饰补出", () => {
    for (const theme of Object.values(resumeThemeRegistry)) {
      if (!theme.decisions?.topDecoration) continue;
      const ui = { theme: { template: theme.id /* 当前主题编号 */ } }; // 仅保存主题选择
      expect(buildLayoutNodes({
        moduleKeys: [], // 空业务模块清单
        data: {}, // 空简历数据
        ui, // 独立装饰不影响业务节点
      })).toEqual([]);
      expect(buildLayoutNodes({
        moduleKeys: ["slogan"], // 显式业务标语模块
        data: { slogan: { data: { title: "" /* 空标题 */, subtitle: "" /* 空副标题 */ } } }, // 没有真实标语
        ui, // 装饰与标语保持分离
      })).toEqual([]);
    }
  });

  it("顶部标语生成单个分组节点，且不带模块标题", () => {
    const nodes = buildLayoutNodes({
      // 模块列表：只声明顶部标语
      moduleKeys: ["slogan"],
      // 模块数据：标题与标语均有内容
      data: { slogan: { data: { title: "个人简历", subtitle: "在追求中发现可能" } } },
    });

    expect(nodes.map((node) => [node.id, node.type, node.sourceModuleKey])).toEqual([
      ["slogan", "group", "slogan"],
    ]);
  });

  it("顶部标语没有内容时不生成节点，也不保留零高标题占位", () => {
    const nodes = buildLayoutNodes({
      moduleKeys: ["slogan"],
      data: { slogan: { data: { title: "", subtitle: "" } } },
    });

    expect(nodes).toEqual([]);
  });
});
