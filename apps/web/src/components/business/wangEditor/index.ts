import { defineAsyncComponent } from "vue";

// 编辑器容器也按需加载，只有动态表单实际渲染富文本字段时才请求实现。
const WangEditor = defineAsyncComponent(() => import("./wangEditor.vue"));

export default WangEditor;
