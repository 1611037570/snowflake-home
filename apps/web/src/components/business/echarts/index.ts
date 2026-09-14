import { defineAsyncComponent } from "vue";

// 仅在图表组件真正渲染时加载 ECharts 实现，避免业务页面静态引用时带入首屏。
const Echarts = defineAsyncComponent(() => import("./echarts.vue"));

export default Echarts;
