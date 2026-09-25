import { resumeTemplateList, type ResumeTemplate } from "./list";

export type ResumeTemplateItem = {
  data: Record<string, any>;
  config: Record<string, any>;
  ui: Record<string, any>;
};

// 正文使用懒加载映射，首页读取列表时不加载简历数据。
const resumeModules = import.meta.glob("./resumes/*.ts", { import: "default" }) as Record<
  string,
  () => Promise<ResumeTemplateItem>
>;

export const loadResumeTemplateData = (fileName: string) => {
  const load = resumeModules[`./resumes/${fileName}`];
  if (!load) throw new Error(`未找到简历范本：${fileName}`);
  return load();
};

export const loadResumeTemplates = async (list: ResumeTemplate[] = resumeTemplateList) =>
  Promise.all(
    list.map(async (template) => ({
      ...template,
      item: await loadResumeTemplateData(template.fileName),
    })),
  );
