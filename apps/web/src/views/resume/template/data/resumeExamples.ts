import { loadResumeTemplates } from "./resumeData";

export type ResumeExampleKind = "education" | "work" | "project" | "advantage";

export type ResumeExample = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  text: string;
  searchText: string;
  industries: string[];
  experiences: string[];
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

export const loadResumeExamples = async (kind: ResumeExampleKind): Promise<ResumeExample[]> => {
  const templates = await loadResumeTemplates();

  // 范本字段在简历业务域统一规整，选择器只消费通用范例结构。
  return templates.flatMap((template) =>
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
          // 搜索词补充范本岗位与标签信息，避免经历正文未重复岗位名称时被漏掉。
          searchText: [
            getTitle(template, kind, record),
            getSubtitle(kind, record),
            text,
            template.position?.join(" "),
            template.tags?.join(" "),
            template.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase(),
          industries: template.industry ?? [],
          experiences: template.workExperience ?? [],
        };
      })
      .filter((example: ResumeExample) => example.title && example.content && example.text),
  );
};
