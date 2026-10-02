import { createAppearanceRegistry } from "../appearanceRegistry";
import AcademicAppearance from "./themes/academic.vue";
import BusinessAppearance from "./themes/business.vue";
import ClassicAppearance from "./themes/classic.vue";
import ColorBarAppearance from "./themes/colorBar.vue";
import CreativeAppearance from "./themes/creative.vue";
import CurvedHeaderAppearance from "./themes/curvedHeader.vue";
import NavyGuideAppearance from "./themes/navyGuide.vue";
import DefaultAppearance from "./themes/default.vue";
import FreshAppearance from "./themes/fresh.vue";
import MinimalAppearance from "./themes/minimal.vue";
import InkMagazineAppearance from "./themes/inkMagazine.vue";
import SteadyAppearance from "./themes/steady.vue";
import SandSidebarAppearance from "./themes/sandSidebar.vue";
import RedWhiteSidebarAppearance from "./themes/redWhiteSidebar.vue";
import SongEleganceAppearance from "./themes/songElegance.vue";
import VividAppearance from "./themes/vivid.vue";

/** 个人信息模块外观注册表：外观编号与主题编号同名，未登记的主题走 default */
export const userAppearanceRegistry = createAppearanceRegistry({
  default: DefaultAppearance, // 不绘制任何装饰，未单独设计的主题都落到这里
  minimal: MinimalAppearance, // 内容水平居中
  inkMagazine: InkMagazineAppearance, // 杂志式大字号姓名与黑白页眉
  classic: ClassicAppearance, // 底部留出一段间距
  academic: AcademicAppearance, // 内容居中并叠加双分隔线
  business: BusinessAppearance, // 浅色底托圆角块 + 左侧主题色竖条
  creative: CreativeAppearance, // 浅色底托圆角块 + 右侧主题色竖条
  fresh: FreshAppearance, // 大圆角浅色底托
  vivid: VividAppearance, // 浅色底托 + 主题色描边
  steady: SteadyAppearance, // 左侧主题色细竖条
  colorBar: ColorBarAppearance, // 首屏色块页眉，与正文左侧色条同一基准
  sandSidebar: SandSidebarAppearance, // 米色侧栏主题的方形头像和金棕色姓名
  redWhiteSidebar: RedWhiteSidebarAppearance, // 红白双栏主题的矩形头像与姓名外观
  curvedHeader: CurvedHeaderAppearance, // 圆形头像跨弧线，个人信息位于背景下方
  navyGuide: NavyGuideAppearance, // 方形头像及蓝色偏移衬边
  songElegance: SongEleganceAppearance, // 宋体大字距姓名与页眉双线
});

/** 解析个人信息模块实际使用的外观组件：主题未登记时回退默认外观 */
export const resolveUserAppearance = (themeId: unknown) => userAppearanceRegistry.resolve(themeId);
