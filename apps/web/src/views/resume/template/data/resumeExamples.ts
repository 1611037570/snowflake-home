import { loadResumeTemplates } from "./resumeData";
import { resumeTemplateList, resumeTemplatePositionOptions } from "./list";

export type ResumeExampleKind = "education" | "work" | "project" | "advantage";

export type ResumeExample = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  text: string;
  industries: string[];
  experiences: string[];
};

export type ResumeExampleResult = {
  examples: ResumeExample[];
  recommendedHot: boolean;
};

const getRecords = (template: any, kind: ResumeExampleKind) => {
  const section = template.item.data[kind];
  if (kind === "advantage") return section?.data ? [section.data] : [];
  return (section?.list ?? []).map((record: any) => record.data ?? {});
};

const getTitle = (template: any, kind: ResumeExampleKind, record: any) => {
  if (kind === "advantage") return template.name;
  if (kind === "project") return record.name || record.post || template.name;
  return record.post || record.name || template.name;
};

const getSubtitle = (kind: ResumeExampleKind, record: any) => {
  if (kind === "education") return String(record.education ?? "").trim();
  if (kind === "project") return String(record.post ?? "").trim();
  return "";
};

const getPlainText = (content: string) => {
  const element = document.createElement("div");
  element.innerHTML = content;
  return element.textContent?.trim() ?? "";
};

const getPositionMatchLength = (position: string, candidate: string) => {
  const positionCharacters = Array.from(position.trim().toLocaleLowerCase());
  const candidateText = candidate.trim().toLocaleLowerCase();

  for (let length = positionCharacters.length; length >= 2; length -= 1) {
    for (let index = 0; index <= positionCharacters.length - length; index += 1) {
      const ngram = positionCharacters.slice(index, index + length).join("");
      if (candidateText.includes(ngram)) return length;
    }
  }

  return 0;
};

const getExamples = (templates: any[], kind: ResumeExampleKind): ResumeExample[] =>
  templates.flatMap((template) =>
    getRecords(template, kind)
      .map((record: any, index: number) => {
        const content = String(record.content ?? "").trim();
        const text = getPlainText(content);
        return {
          id: `${template.fileName}-${kind}-${index}`,
          title: String(getTitle(template, kind, record)).trim(),
          subtitle: getSubtitle(kind, record),
          content,
          text,
          industries: template.industry ?? [],
          experiences: template.workExperience ?? [],
        };
      })
      .filter((example: ResumeExample) => example.title && example.content && example.text),
  );

export const loadResumeExamples = async (
  kind: ResumeExampleKind,
  position: string,
): Promise<ResumeExampleResult> => {
  // 只用模板实际使用的岗位标记及其显示名称进行岗位匹配。
  const usedPositionKeys = new Set(
    resumeTemplateList.flatMap((template) => template.position).filter((key) => key !== "all"),
  );
  const positionNames = resumeTemplatePositionOptions.filter(
    (option) => option.key !== "all" && usedPositionKeys.has(option.key),
  );
  const positionMatchLengths = new Map(
    positionNames
      .map((option) => [option.key, getPositionMatchLength(position, option.value)] as const)
      .filter(([, length]) => length > 0),
  );

  const templates = await loadResumeTemplates();
  const matchedTemplates = templates
    .map((template, index) => ({
      template,
      index,
      matchLength: Math.max(
        0,
        ...template.position
          .filter((key) => key !== "all")
          .map((key) => positionMatchLengths.get(key) ?? 0),
      ),
    }))
    .filter(({ matchLength }) => matchLength > 0)
    .sort((left, right) => right.matchLength - left.matchLength || left.index - right.index);

  // 无岗位命中时按模板索引顺序提供热门兜底范例。
  const matchedExamples = getExamples(
    matchedTemplates.map(({ template }) => template),
    kind,
  );
  if (matchedExamples.length) return { examples: matchedExamples, recommendedHot: false };

  return {
    examples: getExamples(templates, kind).slice(0, 5),
    recommendedHot: true,
  };
};
