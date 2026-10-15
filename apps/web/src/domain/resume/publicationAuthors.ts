// 空值沿用个人姓名识别；单独标记用户主动清除强调的选择。
export const NO_SELF_AUTHOR = "__none__";

// 作者仅按顿号拆分，保留署名中的作者身份标记。
export const splitPublicationAuthors = (value: string) =>
  String(value || "")
    .split(/、+/)
    .map((name) => name.trim())
    .filter(Boolean);

// 井号标注共同一作，星号标注通讯作者。
export const publicationAuthorMarks = (name: string) => name.match(/[#*]+\s*$/)?.[0].trim() || "";
export const isPublicationCorrespondingAuthor = (name: string) => publicationAuthorMarks(name).includes("*");
export const isPublicationCoFirstAuthor = (name: string) => publicationAuthorMarks(name).includes("#");
export const plainPublicationAuthorName = (name: string) => name.replace(/[#*]+\s*$/, "").trim();

// 手动选择与自动识别均按完整姓名匹配。
export const isPublicationSelfAuthor = (name: string, selection: string | undefined, profileName: string) => {
  const plainName = plainPublicationAuthorName(name);
  const selfName = selection === NO_SELF_AUTHOR ? "" : (selection || profileName).trim();
  return Boolean(plainName && selfName) && plainName === selfName;
};
