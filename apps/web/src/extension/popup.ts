import { createApp } from "vue";
import pinia from "@/stores";
import i18n from "@/locales";
import App from "@/App.vue";
import router from "@/routers";
import "@/styles/index.scss";
import "@/styles/tailwind.css";
import { globalComponentInstaller } from "@/components";
import { $s } from "@/utils/modules/sizeConvert";
import { registerResumeAgentHost } from "@/apis/llm/resumeAgentProvider";

const app = createApp(App);
app.use(globalComponentInstaller);
app.use(i18n);
app.use(pinia);
// Pinia 激活后注册简历 Agent 的模型选择适配器。
registerResumeAgentHost();
app.use(router);
app.config.globalProperties.$s = $s;
app.mount("#app");
