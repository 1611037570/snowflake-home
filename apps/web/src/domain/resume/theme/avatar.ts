export interface ResumeAvatarAppearance {
  ratio: "theme" | "1:1" | "4:3" | "3:4" | "16:9" | "5:7" | "custom"; // 头像宽高比，theme 表示跟随主题，5:7 用于一寸照预设
  customRatioWidth: number; // 自定义宽高比的宽度份数
  customRatioHeight: number; // 自定义宽高比的高度份数
  shape: "theme" | "square" | "rounded" | "circle" | "custom"; // 头像圆角预设，theme 表示跟随主题，custom 表示使用自定义圆角
  width: number | null; // 用户设置的头像宽度，空值表示跟随主题默认尺寸
  borderRadius: number | null; // 用户设置的头像圆角百分比，空值表示跟随形状或主题
}

export const DEFAULT_PORTRAIT_AVATAR_SIZE = {
  width: 100, // 默认竖版头像宽度，单位像素
  height: 140, // 默认竖版头像高度，单位像素
};

export const DEFAULT_SQUARE_AVATAR_SIZE = {
  width: 100, // 默认正方形头像宽度，单位像素
  height: 100, // 默认正方形头像高度，单位像素
};

export const AVATAR_WIDTH_LIMITS = {
  min: 60, // 用户可设置的最小头像宽度，单位像素
  max: 240, // 用户可设置的最大头像宽度，单位像素
};

export const AVATAR_RADIUS_LIMITS = {
  min: 0, // 用户可设置的最小头像圆角百分比
  max: 50, // 用户可设置的最大头像圆角百分比
};

export const AVATAR_OUTPUT_SCALE = 3; // 上传裁剪输出相对展示尺寸的清晰度倍数

export const DEFAULT_AVATAR_APPEARANCE: ResumeAvatarAppearance = {
  ratio: "theme", // 默认保留主题声明的头像宽高比
  customRatioWidth: 5, // 自定义比例默认宽度份数
  customRatioHeight: 7, // 自定义比例默认高度份数
  shape: "theme", // 默认保留主题声明的头像形状
  width: null, // 默认跟随主题声明的头像尺寸
  borderRadius: null, // 默认跟随头像形状或主题圆角
};

// 将头像比例配置解析为宽高比；主题默认沿用当前一寸照比例用于裁剪与尺寸计算
export const resolveAvatarAspectRatio = (avatar?: Partial<ResumeAvatarAppearance>): number => {
  if (avatar?.shape === "circle") return 1;
  let presetWidth = 5;
  let presetHeight = 7;
  if (avatar?.ratio === "1:1") [presetWidth, presetHeight] = [1, 1];
  if (avatar?.ratio === "4:3") [presetWidth, presetHeight] = [4, 3];
  if (avatar?.ratio === "3:4") [presetWidth, presetHeight] = [3, 4];
  if (avatar?.ratio === "16:9") [presetWidth, presetHeight] = [16, 9];
  if (avatar?.ratio === "custom") {
    presetWidth = Number(avatar.customRatioWidth);
    presetHeight = Number(avatar.customRatioHeight);
  }
  const width = Number.isFinite(presetWidth) && presetWidth > 0 ? presetWidth : 5;
  const height = Number.isFinite(presetHeight) && presetHeight > 0 ? presetHeight : 7;
  return width / height;
};
