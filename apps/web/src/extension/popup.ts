import { createApp } from "vue";
import pinia from "@/stores";
import i18n from "@/locales";
import App from "@/App.vue";
import router from "@/routers";
import "@/styles/index.scss";
import "@/styles/tailwind.css";
import { globalComponentInstaller } from "@/components";
import { $s } from "@/utils/modules/sizeConvert";

const app = createApp(App);
app.use(globalComponentInstaller);
app.use(i18n);
app.use(pinia);
app.use(router);
app.config.globalProperties.$s = $s;
app.mount("#app");
