import type { Component } from "vue";
import Fa6SolidSnowflakeIcon from "@iconify-vue/fa6-solid/snowflake";
import FamiconsChevronBackIcon from "@iconify-vue/famicons/chevron-back";
import IconamoonSettingsFillIcon from "@iconify-vue/iconamoon/settings-fill";
import IonLanguageIcon from "@iconify-vue/ion/language";
import RiMoonClearFillIcon from "@iconify-vue/ri/moon-clear-fill";
import SolarHeartBoldIcon from "@iconify-vue/solar/heart-bold";
import TwemojiSunIcon from "@iconify-vue/twemoji/sun";

// 维护基础组件默认使用的本地图标，避免通用区域依赖在线加载
export const LOCAL_ICON_LIST: Record<string, Component> = {
  "fa6-solid:snowflake": Fa6SolidSnowflakeIcon,
  "famicons:chevron-back": FamiconsChevronBackIcon,
  "iconamoon:settings-fill": IconamoonSettingsFillIcon,
  "ion:language": IonLanguageIcon,
  "ri:moon-clear-fill": RiMoonClearFillIcon,
  "solar:heart-bold": SolarHeartBoldIcon,
  "twemoji:sun": TwemojiSunIcon,
};
