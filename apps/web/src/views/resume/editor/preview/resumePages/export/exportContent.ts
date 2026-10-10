import { stripEditorPageFrame } from "./pageFrame";

// 本地打印和长图共用内容复制规则，测量探针整棵跳过，主题装饰保留。
export const cloneExportContent = <T extends HTMLElement>(root: T): T => {
  const cloneNode = (node: Node): Node => {
    const clone = node.cloneNode(false);
    for (const child of node.childNodes) {
      if (child instanceof Element && child.matches(".layout-measure-breakpoint")) continue;
      clone.appendChild(cloneNode(child));
    }
    return clone;
  };
  // 分页树没有探针时使用原生深复制，避免给本地打印增加逐节点遍历。
  const clone = stripEditorPageFrame((root.querySelector(".layout-measure-breakpoint") ? cloneNode(root) : root.cloneNode(true)) as T);
  // 编辑交互只属于预览，不进入输出内容。
  clone.querySelectorAll("[data-resume-editor-action]").forEach((action) => action.remove());
  return clone;
};
