export interface ResumeSchoolLogoAppearance {
  width: number; // 校徽展示宽度，单位像素。
  ratio: "1:1" | "3:1"; // 上传确认时选定的裁切比例。
}

// 两种校徽默认保持相同展示高度，横版为校名与校训预留横向空间。
export const SCHOOL_LOGO_PRESET_WIDTHS = {
  "1:1": 70, // 正方形校徽默认展示为七十像素见方。
  "3:1": 210, // 横版校徽默认宽二百一十像素、高七十像素。
};

export const DEFAULT_SCHOOL_LOGO_APPEARANCE: ResumeSchoolLogoAppearance = {
  width: SCHOOL_LOGO_PRESET_WIDTHS["1:1"], // 默认正方形校徽展示宽度。
  ratio: "1:1", // 默认使用正方形裁切。
};

export const SCHOOL_LOGO_WIDTH_LIMITS = {
  min: 40, // 校徽展示宽度下限，单位像素。
  max: 240, // 校徽展示宽度上限，单位像素。
};

// 展示高度始终按已保存的裁切比例计算，调整大小不会拉伸图片。
export const resolveSchoolLogoSize = (logo?: Partial<ResumeSchoolLogoAppearance>) => {
  const defaultWidth = SCHOOL_LOGO_PRESET_WIDTHS[logo?.ratio === "3:1" ? "3:1" : "1:1"];
  const configuredWidth = Number(logo?.width ?? defaultWidth);
  const width = Number.isFinite(configuredWidth)
    ? Math.min(SCHOOL_LOGO_WIDTH_LIMITS.max, Math.max(SCHOOL_LOGO_WIDTH_LIMITS.min, configuredWidth))
    : defaultWidth;
  return {
    width, // 校徽展示宽度，单位像素。
    height: width / (logo?.ratio === "3:1" ? 3 : 1), // 按裁切比例计算的展示高度。
  };
};
