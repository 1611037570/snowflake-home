import { defineAsyncComponent } from "vue";

// 仅在真正展示 Markdown 内容时加载预览容器及其依赖。
const MdPreview = defineAsyncComponent(() => import("./mdPreview.vue"));

export default MdPreview;
