import { defineAsyncComponent } from "vue";
import type { IDomEditor } from "@wangeditor-next/editor";
import i18n from "@/locales";

// 工具栏「展开编辑」按钮的点击回调，按编辑器实例区分：
// 页面里同时存在多个正文字段时，各自打开自己的展开弹窗。
const expandHandlers = new WeakMap<IDomEditor, () => void>();

/**
 * 登记当前编辑器的展开回调，由工具栏上的自定义菜单按钮触发。
 * @param editor 编辑器实例
 * @param handler 点击展开按钮时执行的回调
 */
export const registerExpandHandler = (editor: IDomEditor, handler: () => void) => {
  expandHandlers.set(editor, handler);
};

// 展开图标直接取自编辑器内置的全屏菜单，与工具栏其它图标同一套字形与笔画
const EXPAND_ICON_SVG =
  '<svg viewBox="0 0 1024 1024"><path d="M133.705143 335.433143V133.851429h201.581714a29.622857 29.622857 0 0 0 29.622857-29.549715V68.754286a29.622857 29.622857 0 0 0-29.622857-29.622857H61.732571A22.893714 22.893714 0 0 0 38.765714 62.025143V335.725714c0 16.310857 13.238857 29.622857 29.622857 29.622857h35.547429a29.842286 29.842286 0 0 0 29.696-29.842285zM690.980571 133.851429h201.581715v201.654857c0 16.310857 13.238857 29.549714 29.622857 29.549714h35.547428a29.622857 29.622857 0 0 0 29.549715-29.549714V61.952a22.893714 22.893714 0 0 0-22.820572-22.893714h-273.554285a29.622857 29.622857 0 0 0-29.549715 29.622857v35.547428c0 16.310857 13.238857 29.696 29.622857 29.696zM335.286857 892.781714H133.705143V691.2a29.622857 29.622857 0 0 0-29.622857-29.622857H68.534857a29.622857 29.622857 0 0 0-29.549714 29.622857v273.554286c0 12.653714 10.24 22.893714 22.820571 22.893714h273.554286a29.622857 29.622857 0 0 0 29.696-29.622857v-35.547429a29.769143 29.769143 0 0 0-29.769143-29.696z m557.348572-201.581714v201.581714H690.907429a29.622857 29.622857 0 0 0-29.622858 29.622857v35.547429c0 16.310857 13.238857 29.622857 29.622858 29.622857h273.554285c12.580571 0 22.893714-10.313143 22.893715-22.893714V691.2a29.622857 29.622857 0 0 0-29.622858-29.622857h-35.547428a29.622857 29.622857 0 0 0-29.696 29.622857z"></path></svg>';

// 自定义菜单：结构照内置按钮写，尺寸、悬停、选中态全部复用工具栏既有样式
class ExpandEditorMenu {
  tag = "button"; // 渲染成工具栏里的按钮
  showPanel = false; // 不展开下拉面板
  alwaysEnable = true; // 不依赖编辑区选中内容，随时可点
  iconSvg = EXPAND_ICON_SVG; // 按钮图标
  /** 悬停提示，跟随界面语言 */
  get title() {
    return i18n.global.t("expandEditor");
  }
  getValue() {
    return "";
  }
  isActive() {
    return false;
  }
  isDisabled() {
    return false;
  }
  exec(editor: IDomEditor) {
    expandHandlers.get(editor)?.();
  }
}

let expandMenuRegistered = false;

// 自定义菜单必须在编辑器创建前注册，否则 toolbarKeys 里的键会被直接跳过
const registerExpandMenu = async () => {
  if (expandMenuRegistered) return;
  const { Boot } = await import("@wangeditor-next/editor");
  // 自定义菜单的成员比内置菜单少，注册时放宽类型由工具栏按需读取
  Boot.registerMenu({ key: "expandEditor", factory: () => new ExpandEditorMenu() as any });
  expandMenuRegistered = true;
};

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
    ])
      .then(async ([, module]) => {
        await registerExpandMenu();
        return module;
      })
      .catch((error) => {
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
