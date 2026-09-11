import { describe, expect, it } from "vitest";
import { resolveDataPath } from "./pathContext";

describe("resolveDataPath", () => {
  it("没有容器上下文时保留字段路径", () => {
    const source = ["user", "data", "name"];

    expect(resolveDataPath(source)).toEqual(source);
    expect(resolveDataPath(source)).not.toBe(source);
  });

  it("将数组容器路径与字段相对路径合成真实路径", () => {
    expect(
      resolveDataPath(["profile", "name"], {
        basePath: ["education", "data"],
        index: 2,
      }),
    ).toEqual(["education", "data", 2, "profile", "name"]);
  });
});
