// 导入 Vue 应用创建函数
import { createApp, watch } from "vue";
// 导入 Pinia 状态管理（仅实例，不引入业务 store，避免首屏连带加载全部 store）
import pinia from "./stores/pinia";
// 导入 i18n 配置
import i18n from "./locales";
// 导入根组件
import App from "./App.vue";
// 导入路由配置
import router from "./routers";
import { updatePageMetadata } from "./utils/modules/pageMetadata";
// 导入全局样式
import "./styles/index.scss";
// 导入 Tailwind CSS 样式
import "./styles/tailwind.css";
// 导入全局组件安装器
import { globalComponentInstaller } from "./components";
// 导入默认事件加载器
import { loadEvent, loadTheme } from "./utils";
import { registerResumeAgentHost } from "./apis/llm/resumeAgentProvider";
import { registerResumeSchema } from "./views/resume/shared/resumeSchemaProvider";
// 创建 Vue 应用实例
const app = createApp(App);

// 注册 i18n 插件
app.use(i18n);
// 注册 Pinia 状态管理
app.use(pinia);
// 公共简历数据与两个业务智能体分别注册，避免通过一个智能体初始化另一个。
registerResumeSchema();
registerResumeAgentHost();
// 注册路由
app.use(router);
// 仅在当前路由与语言确定后更新页面信息，避免未完成导航覆盖当前页面。
router.isReady().then(() => {
  watch(
    [() => router.currentRoute.value, () => String((i18n.global.locale as any).value ?? i18n.global.locale)] as const,
    ([route, language]) => updatePageMetadata(route, language),
    { immediate: true, flush: "post" },
  );
});
// 加载主题
loadTheme();
// 加载默认事件
loadEvent();

// 注册全局函数 $s、$bus 和 $confirm
import confirm from "./components/business/confirm";
import { $s, eventBus } from "./utils";
app.config.globalProperties.$s = $s;
app.config.globalProperties.$bus = eventBus;
app.config.globalProperties.$confirm = confirm;

// 注册全局组件安装器
app.use(globalComponentInstaller);
// 挂载应用到 DOM
app.mount("#app");
