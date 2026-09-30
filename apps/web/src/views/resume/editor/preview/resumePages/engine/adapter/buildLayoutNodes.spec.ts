import { describe, expect, it } from "vitest";
import { buildLayoutNodes } from "./buildLayoutNodes";

describe("buildLayoutNodes media modules", () => {
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
