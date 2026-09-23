import { describe, expect, it } from "vitest";
import { parseRichText, sliceRichTextHtml } from "./richTextParser";

describe("parseRichText", () => {
  it("长单段富文本会生成字符级兜底断点", () => {
    const result = parseRichText(`<p>${"长文本".repeat(600)}</p>`);

    expect(result.breakPoints.some((point) => point.type === "char")).toBe(true);
    expect(result.breakPoints.at(-1)?.offset).toBe(result.textLength);
  });

  it("续段从下一段文字开始且不复制上一段空壳", () => {
    const parsed = parseRichText("<p>产品能力</p><p><br></p><p>工具</p>");
    const html = sliceRichTextHtml(
      parsed.html,
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
    const html = sliceRichTextHtml(parsed.html);
    const container = document.createElement("div");
    container.innerHTML = html;
    const firstLine = document.createElement("div");
    firstLine.innerHTML = sliceRichTextHtml(parsed.html, 0, 4);
    const secondLine = document.createElement("div");
    secondLine.innerHTML = sliceRichTextHtml(parsed.html, 4, 7);

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
    const html = sliceRichTextHtml(parsed.html, 1, 3);
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

  it("经历正文有连续空行时切到续页仍保留后续段落", () => {
    const html = `<p>完成高中阶段课程</p>${"<p><br></p>".repeat(8)}<p>学习，打下扎实的数理与人文基础。</p><p>积极参与校‘’</p>${"<p><br></p>".repeat(5)}<p>园社团活动，培养沟通</p><p>协</p><p>作与组织能力。322313132312321312</p><p><br></p>`;
    const parsed = parseRichText(html);
    const pageOne = sliceRichTextHtml(parsed.html, 0, 11);
    const pageTwo = sliceRichTextHtml(parsed.html, 11, parsed.textLength);

    expect(pageOne).toContain("完成高中阶段课程");
    expect(pageTwo).toContain("学习，打下扎实的数理与人文基础。");
    expect(pageTwo).toContain("作与组织能力。322313132312321312");
  });
});
