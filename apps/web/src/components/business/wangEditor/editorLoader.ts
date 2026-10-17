import { defineAsyncComponent } from "vue";
import type { IDomEditor } from "@wangeditor-next/editor";

type EditorLinkNode = {
  type: "link"; // 链接节点类型。
  url: string; // 链接跳转地址。
  children: Array<{ text: string }>; // 链接显示文字。
};

export type EditorLinkValue = {
  text: string; // 链接显示文字。
  url: string; // 链接跳转地址。
};

let editorModule: Promise<typeof import("@wangeditor-next/editor-for-vue")> | undefined;

// 样式与代码并行加载，正文和工具栏共用同一个加载任务。
const loadEditor = () => {
  if (!editorModule) {
    editorModule = Promise.all([
      import("@wangeditor-next/editor/dist/css/style.css"),
      import("@wangeditor-next/editor-for-vue"),
    ]).then(([, module]) => module).catch((error) => {
      editorModule = undefined;
      throw error;
    });
  }
  return editorModule;
};

export const Editor = defineAsyncComponent(() => loadEditor().then((module) => module.Editor));
export const Toolbar = defineAsyncComponent(() => loadEditor().then((module) => module.Toolbar));

// 使用编辑器原生节点能力插入链接，由外部弹窗负责采集链接文字与地址。
export const insertEditorLink = async (editor: IDomEditor, text: string, url: string) => {
  const { SlateEditor, SlateRange, SlateTransforms } = await import("@wangeditor-next/editor");
  editor.restoreSelection();
  const selection = editor.selection;
  if (!selection) return;

  const linkNode: EditorLinkNode = { type: "link", url, children: [{ text }] };
  if (SlateRange.isCollapsed(selection)) {
    editor.insertText(" ");
    SlateTransforms.insertNodes(editor, linkNode);
    editor.insertText(" ");
  } else if (SlateEditor.string(editor, selection) === text) {
    SlateTransforms.wrapNodes(editor, { type: "link", url, children: [] }, { split: true });
    SlateTransforms.collapse(editor, { edge: "end" });
  } else {
    editor.deleteFragment();
    SlateTransforms.insertNodes(editor, linkNode);
  }
  editor.focus();
};

// 读取光标所在链接，供项目弹窗回填修改内容。
export const getSelectedEditorLink = async (
  editor: IDomEditor,
): Promise<EditorLinkValue | null> => {
  const { DomEditor, SlateNode } = await import("@wangeditor-next/editor");
  editor.restoreSelection();
  const linkNode = DomEditor.getSelectedNodeByType(editor, "link") as EditorLinkNode | null;
  if (!linkNode) return null;
  return { text: SlateNode.string(linkNode), url: linkNode.url };
};

// 更新光标所在链接的文字和地址，修改入口与插入入口共用外部弹窗。
export const updateEditorLink = async (
  editor: IDomEditor,
  text: string,
  url: string,
) => {
  const { SlateEditor, SlateElement, SlateNode, SlateTransforms } = await import(
    "@wangeditor-next/editor"
  );
  editor.restoreSelection();
  const entry = SlateEditor.above(editor, {
    match: (node) => SlateElement.isElement(node) && node.type === "link",
  });
  if (!entry) return;

  const [linkNode, linkPath] = entry;
  SlateTransforms.setNodes(editor, { url }, { at: linkPath });
  if (SlateNode.string(linkNode) !== text) {
    SlateTransforms.select(editor, SlateEditor.range(editor, linkPath));
    editor.insertText(text);
  }
  SlateTransforms.collapse(editor, { edge: "end" });
  editor.focus();
};
