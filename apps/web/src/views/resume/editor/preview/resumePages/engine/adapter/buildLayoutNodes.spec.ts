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

    expect(nodes.map((node) => [node.id, node.type])).toEqual([
      ["image.media-0", "media"],
      ["video.media-0", "media"],
    ]);
    expect(nodes.map((node) => (node.payload as { mediaType: string }).mediaType)).toEqual([
      "image",
      "video",
    ]);
  });
});
