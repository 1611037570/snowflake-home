import { describe, expect, it, vi } from "vitest";
import DOMPurify from "dompurify";
import { parseRichText, sliceRichText, type ParsedRichText } from "./richTextParser";

// 测试仅取切片内容，生产渲染同时复用块结构。
const sliceRichTextHtml = (parsed: ParsedRichText, start = 0, end?: number) => sliceRichText(parsed, start, end).html;

describe("parseRichText", () => {
  it("安全正文切片直接复用解析结果，渲染块保留格式且不再次清洗", () => {
    const parsed = parseRichText('<p><span style="color: blue; background-color: yellow">甲乙丙丁</span></p>');
    const sanitize = vi.spyOn(DOMPurify, "sanitize");
    try {
      const slice = sliceRichText(parsed, 1, 3);
      expect(sliceRichText(parsed, 1, 3)).toBe(slice);
      expect(slice.blocks[0]?.tag).toBe("p");
      expect(slice.blocks[0]?.html).toContain("乙丙");
      expect(slice.blocks[0]?.html).toContain("background-color: yellow");
      expect(sanitize).not.toHaveBeenCalled();
    } finally {
      sanitize.mockRestore();
    }
  });

  it("顶层纯文本块转义后渲染，不把文字重新当作标签", () => {
    const parsed = parseRichText('&lt;img src=x onerror=alert(1)&gt;');
    const slice = sliceRichText(parsed);
    const container = document.createElement("div");
    container.innerHTML = slice.blocks[0]?.html ?? "";
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe("<img src=x onerror=alert(1)>");
  });
  it("解析缓存超限只淘汰最久未用内容，近期访问结果保持引用", () => {
    const sources = Array.from({ length: 201 }, (_, index) => `<p>解析淘汰${index}</p>`);
    const parsed = sources.slice(0, 200).map(parseRichText);
    expect(parseRichText(sources[0]!)).toBe(parsed[0]);
    parseRichText(sources[200]!);
    expect(parseRichText(sources[0]!)).toBe(parsed[0]);
    expect(parseRichText(sources[1]!)).not.toBe(parsed[1]);
  });

  it("切片缓存超限保留近期切片，位置映射缓存也逐项淘汰", () => {
    const source = parseRichText(`<p>${"切片淘汰".repeat(150)}</p>`);
    for (let index = 0; index < 500; index += 1) sliceRichTextHtml(source, index, index + 1);
    sliceRichTextHtml(source, 0, 1);
    sliceRichTextHtml(source, 500, 501);
    const clone = vi.spyOn(Range.prototype, "cloneContents");
    try {
      sliceRichTextHtml(source, 0, 1);
      expect(clone).not.toHaveBeenCalled();
      sliceRichTextHtml(source, 1, 2);
      expect(clone).toHaveBeenCalledTimes(1);
    } finally {
      clone.mockRestore();
    }

    const sources = Array.from({ length: 201 }, (_, index) => parseRichText(`<p>位置淘汰${index}</p>`));
    sources.slice(0, 200).forEach((html) => sliceRichTextHtml(html, 0, 1));
    // 使用新切片区间绕过结果缓存，验证解析位置映射的访问顺序。
    sliceRichTextHtml(sources[0]!, 0, 2);
    sliceRichTextHtml(sources[200]!, 0, 1);
    const createElement = vi.spyOn(document, "createElement");
    try {
      sliceRichTextHtml(sources[0]!, 0, 3);
      expect(createElement).toHaveBeenCalledTimes(2);
      sliceRichTextHtml(sources[1]!, 0, 2);
      expect(createElement).toHaveBeenCalledTimes(5);
    } finally {
      createElement.mockRestore();
    }
  });
  it.each([
    '<p><span style="color: blue; background-color: yellow">甲乙丙丁</span></p>',
    '<p style="color: blue; background-color: yellow"><a href="https://example.com"><strong><u>甲乙丙丁</u></strong></a></p>',
    '<ol><li><span style="color: blue; background-color: yellow">甲乙丙丁</span></li></ol>',
  ])("段内跨页切片保留文字颜色、背景色和祖先标签：%s", (source) => {
    const parsed = parseRichText(source);
    const fragments = [[0, 2], [2, 4]].map(([start, end]) => {
      const container = document.createElement("div");
      container.innerHTML = sliceRichTextHtml(parsed, start, end);
      return container;
    });
    expect(fragments.map((fragment) => fragment.textContent)).toEqual(["甲乙", "丙丁"]);
    // 同一文字节点内切分也要保留祖先格式，不能只克隆裸文本。
    for (const fragment of fragments) {
      const styled = fragment.querySelector<HTMLElement>("[style]");
      expect(styled?.style.color).toBe("blue");
      expect(styled?.style.backgroundColor).toBe("yellow");
      for (const tag of ["p", "a", "strong", "u", "ol", "li"]) {
        expect(Boolean(fragment.querySelector(tag))).toBe(parsed.html.includes(`<${tag}`));
      }
    }
  });
  it("同一份内容返回同一个解析结果，供上游判断节点是否变化", () => {
    const content = "<p>产品能力</p><p>工具</p>";
    const first = parseRichText(content);

    expect(parseRichText(content)).toBe(first);
    expect(parseRichText(`${content} <p>补充</p>`)).not.toBe(first);
  });

  it("长单段富文本会生成字符级兜底断点", () => {
    const result = parseRichText(`<p>${"长文本".repeat(600)}</p>`);

    expect(result.breakPoints.some((point) => point.type === "char")).toBe(true);
    expect(result.breakPoints.at(-1)?.offset).toBe(result.textLength);
  });

  it("大量段落的断点仍保持唯一且有序", () => {
    const result = parseRichText("<p>段</p>".repeat(500));
    const offsets = result.breakPoints.map((point) => point.offset);

    expect(new Set(offsets).size).toBe(offsets.length);
    expect(offsets).toEqual([...offsets].sort((left, right) => left - right));
  });

  it("续段从下一段文字开始且不复制上一段空壳", () => {
    const parsed = parseRichText("<p>产品能力</p><p><br></p><p>工具</p>");
    const html = sliceRichTextHtml(
      parsed,
      parsed.blocks[0]?.endOffset || 0,
      parsed.textLength,
    );
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(container.textContent).toBe("工具");
    expect(container.querySelector("p br")).not.toBeNull();
  });

  it("完整切片保留正文换行和内部空段落", () => {
    const parsed = parseRichText("<p>第一行<br>第二行</p><p><br></p><p>下一段</p>");
    const html = sliceRichTextHtml(parsed);
    const container = document.createElement("div");
    container.innerHTML = html;
    const firstLine = document.createElement("div");
    firstLine.innerHTML = sliceRichTextHtml(parsed, 0, 4);
    const secondLine = document.createElement("div");
    secondLine.innerHTML = sliceRichTextHtml(parsed, 4, 7);

    expect(parsed.textLength).toBe(11);
    expect(parsed.breakPoints.some((point) => point.offset === 4)).toBe(true);
    expect(firstLine.textContent).toBe("第一行");
    expect(firstLine.querySelector("br")).not.toBeNull();
    expect(secondLine.textContent).toBe("第二行");
    expect(container.querySelector("br")).not.toBeNull();
    expect(container.children).toHaveLength(3);
  });

  it("空段落有独立分页位置，切片后仍保留空行", () => {
    const parsed = parseRichText("<p>甲</p><p><br></p><p><br></p><p>乙</p>");
    const html = sliceRichTextHtml(parsed, 1, 3);
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(parsed.textLength).toBe(4);
    expect(parsed.blocks.map((block) => [block.startOffset, block.endOffset])).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
    expect(container.innerHTML).toBe("<p><br></p><p><br></p>");
  });

  it("切片只复制已清洗内容，不会引入白名单之外的标签", () => {
    // 渲染层对切片结果跳过二次清洗，切片必须保持与清洗结果同等的安全性
    const parsed = parseRichText(
      '<p onclick="alert(1)">甲<script>alert(2)</script></p><p><img src=x onerror=alert(3)>乙</p>',
    );
    const unsliced = document.createElement("div");
    unsliced.innerHTML = parsed.html;
    const sliced = document.createElement("div");
    sliced.innerHTML = sliceRichTextHtml(parsed, 0, parsed.textLength);

    expect(parsed.html).not.toContain("script");
    expect(parsed.html).not.toContain("onclick");
    expect(parsed.html).not.toContain("onerror");
    expect(sliced.querySelector("script")).toBeNull();
    expect(sliced.querySelector("img")).toBeNull();
    expect(sliced.textContent).toBe(unsliced.textContent);
  });

  it("经历正文有连续空行时切到续页仍保留后续段落", () => {
    const html = `<p>完成高中阶段课程</p>${"<p><br></p>".repeat(8)}<p>学习，打下扎实的数理与人文基础。</p><p>积极参与校‘’</p>${"<p><br></p>".repeat(5)}<p>园社团活动，培养沟通</p><p>协</p><p>作与组织能力。322313132312321312</p><p><br></p>`;
    const parsed = parseRichText(html);
    const pageOne = sliceRichTextHtml(parsed, 0, 11);
    const pageTwo = sliceRichTextHtml(parsed, 11, parsed.textLength);

    expect(pageOne).toContain("完成高中阶段课程");
    expect(pageTwo).toContain("学习，打下扎实的数理与人文基础。");
    expect(pageTwo).toContain("作与组织能力。322313132312321312");
  });
});
