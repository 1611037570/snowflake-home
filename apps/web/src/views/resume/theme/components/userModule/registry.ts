import { createAppearanceRegistry } from "../appearanceRegistry";
import UserHeading from "./components/userHeading.vue";
import ModernUser from "./components/modernUser.vue";
import TealRailUser from "./components/tealRailUser.vue";
import TwoColumnUser from "./components/twoColumnUser.vue";
import VioletBiographyUser from "./components/violetBiographyUser.vue";

/**
 * 个人信息内容注册表
 *
 * 内容排布同样按外观编号分发：主题维度表达审美差异，版式维度表达排版差异。
 * 新增主题只需在该主题下放一个内容组件并登记，解析逻辑不再改动。
 */

/** 主题专属内容：外观编号与主题编号同名 */
const userThemeContentRegistry = createAppearanceRegistry({
  default: UserHeading, // 默认：头像与资料按位置设置排列
  modern: ModernUser, // 现代：居中时在姓名下方补主题色短线
  violetBiography: VioletBiographyUser, // 紫色履历：页眉内的分组资料
  tealRail: TealRailUser, // 青线双栏：分组资料与经历列表
});

/** 版式驱动内容：双栏版式把头像与资料改为单列网格 */
const userLayoutContentRegistry = createAppearanceRegistry({
  default: UserHeading, // 单栏及顶部通栏沿用默认排布
  twoColumn: TwoColumnUser, // 双栏：头像置顶、资料单列网格
});

/**
 * 解析个人信息内容组件：主题专属内容优先，其次按版式选择，最后回落默认内容。
 * @param themeId 当前主题编号
 * @param layoutType 当前版式编号（ui.layout.type）
 */
export const resolveUserContent = (themeId: unknown, layoutType: unknown) => {
  const themeContent =
    typeof themeId === "string" ? userThemeContentRegistry.components[themeId] : undefined;
  return themeContent || userLayoutContentRegistry.resolve(layoutType);
};
