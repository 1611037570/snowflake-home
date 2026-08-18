import { DEFAULT_LANGUAGE } from "@/configs";
import i18n from "@/locales";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";

// 语言配置对象
const langConfig: any = {
  zh: zhCn,
  en: en,
};

// 当前的语言
export const language = ref(DEFAULT_LANGUAGE);
// 全局监听i18n语言切换
watch(
  () => i18n.global.locale.value,
  (newLocale) => {
    language.value = newLocale;
  },
  { immediate: true },
);
export function getCurrentLocale() {
  const currentLocale: any = ref({});

  return currentLocale;
}

// 根据语言键获取配置，不存在则使用默认语言
export const getElLocale = computed(() => langConfig[language.value || DEFAULT_LANGUAGE]);
