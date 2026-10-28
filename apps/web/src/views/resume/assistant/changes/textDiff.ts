export interface TextDiffPart {
  text: string; // 连续的文字片段
  changed: boolean; // 是否为删除或新增的文字
}

// 富文本只提取可读文字，保留段落与列表换行，标记不回写源内容。
export const toChangeText = (value: unknown, html = false): string => {
  if (value == null) return "";
  if (typeof value !== "string") return JSON.stringify(value, null, 2) ?? "";
  if (!html) return value;
  const template = document.createElement("template");
  template.innerHTML = value;
  template.content.querySelectorAll("script, style").forEach((node) => node.remove());
  template.content.querySelectorAll("br").forEach((node) => node.replaceWith("\n"));
  template.content.querySelectorAll("li").forEach((node) => node.prepend("• "));
  template.content.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach((node) => node.append("\n"));
  return (template.content.textContent ?? "").replace(/\u00a0/g, " ").trim();
};

// 打开弹窗时计算文字差异；长正文仅比较共同首尾，限制计算量。
export const compareChangeText = (before: string, after: string) => {
  const oldChars = Array.from(before);
  const newChars = Array.from(after);
  const oldParts: TextDiffPart[] = [];
  const newParts: TextDiffPart[] = [];
  const append = (parts: TextDiffPart[], text: string, changed: boolean) => {
    if (!text) return;
    const previous = parts.at(-1);
    if (previous?.changed === changed) previous.text += text;
    else parts.push({ text, changed }); // 文字内容与增删状态
  };
  let start = 0;
  while (start < oldChars.length && start < newChars.length && oldChars[start] === newChars[start]) start++;
  let oldEnd = oldChars.length;
  let newEnd = newChars.length;
  while (oldEnd > start && newEnd > start && oldChars[oldEnd - 1] === newChars[newEnd - 1]) { oldEnd--; newEnd--; }
  const prefix = oldChars.slice(0, start).join("");
  append(oldParts, prefix, false);
  append(newParts, prefix, false);
  const left = oldChars.slice(start, oldEnd);
  const right = newChars.slice(start, newEnd);
  if (!left.length || !right.length || left.length > 10000 || right.length > 10000 || left.length * right.length > 250000) {
    append(oldParts, left.join(""), true);
    append(newParts, right.join(""), true);
  } else {
    const table = Array.from({ length: left.length + 1 }, () => new Uint32Array(right.length + 1));
    for (let i = left.length - 1; i >= 0; i--) {
      for (let j = right.length - 1; j >= 0; j--) {
        table[i][j] = left[i] === right[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < left.length || j < right.length) {
      if (i < left.length && j < right.length && left[i] === right[j]) {
        append(oldParts, left[i++], false);
        append(newParts, right[j++], false);
      } else if (i < left.length && (j === right.length || table[i + 1][j] >= table[i][j + 1])) {
        append(oldParts, left[i++], true);
      } else append(newParts, right[j++], true);
    }
  }
  const suffix = oldChars.slice(oldEnd).join("");
  append(oldParts, suffix, false);
  append(newParts, suffix, false);
  return {
    before: oldParts, // 旧内容及删除标记
    after: newParts, // 新内容及新增标记
  };
};
