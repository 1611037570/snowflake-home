import { describe, expect, it } from "vitest";
import { buildLayoutNodes } from "./buildLayoutNodes";

describe("buildLayoutNodes media modules", () => {
  it.each(["work", "project", "education", "account", "honor", "image", "video", "custom_demo"])(
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

  it("creates image and video nodes through the registered module adapters", () => {
    const nodes = buildLayoutNodes({
      moduleKeys: ["image", "video"],
      data: {
        image: { list: [{ data: { img: "/image.png", name: "作品" } }] },
        video: { list: [{ data: { url: "https://example.com/video", name: "视频" } }] },
      },
    });

    // 标题作为独立节点排在每个模块最前
    expect(nodes.map((node) => [node.id, node.type])).toEqual([
      ["image.title", "title"],
      ["image.media-0", "media"],
      ["video.title", "title"],
      ["video.media-0", "media"],
    ]);
    expect(
      nodes
        .filter((node) => node.type === "media")
        .map((node) => (node.payload as { mediaType: string }).mediaType),
    ).toEqual(["image", "video"]);
    expect(
      nodes
        .filter((node) => node.type === "title")
        .map((node) => (node.payload as { moduleKey: string }).moduleKey),
    ).toEqual(["image", "video"]);
  });
});

describe("buildLayoutNodes slogan module", () => {
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
