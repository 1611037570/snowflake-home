export {
  getResumeThemeTemplate,
  resolveThemePageAppearance,
  resumeThemeRegistry,
  themeTemplateList,
} from "@/domain/resume/theme/styles";
export { resolveThemeSettingRestrictions } from "./settingCapabilities";
export { compactResumeUi, compactResumeItem, resolveResumeUi } from "@/domain/resume/theme/resumeUi";
export { resolveThemeDecisions, DEFAULT_THEME_DECISIONS, type ThemeDecisions } from "@/domain/resume/theme/themeDecisions";
export type {
  ResumeThemeDefinition,
  ResumeThemeTemplate,
  ThemePageAppearance,
  ThemeTemplateConfig,
} from "@/domain/resume/theme/styles/createThemeTemplate";
export { isPageLayoutTemplateId, pageLayoutRegistry, type PageLayoutTemplateId } from "@/domain/resume/theme/layouts";
