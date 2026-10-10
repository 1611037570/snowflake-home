import { defineAsyncComponent } from "vue";

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
