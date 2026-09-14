import { defineAsyncComponent } from "vue";

// 仅在打开 Markdown 编辑器时加载编辑器容器及其依赖。
const MdEditor = defineAsyncComponent(() => import("./mdEditor.vue"));

export default MdEditor;
