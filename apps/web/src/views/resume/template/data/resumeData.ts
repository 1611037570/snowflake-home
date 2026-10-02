import { resumeTemplateList, type ResumeTemplate } from "./list";

export type ResumeTemplateItem = {
  data: Record<string, any>;
  config: Record<string, any>;
  ui: Record<string, any>;
};

// 正文使用懒加载映射，首页读取列表时不加载简历数据。
const resumeModules = Object.fromEntries(
  Object.entries(import.meta.glob("./resumes/**/*.ts", { import: "default" })).map(([path, load]) => [
    path.slice(path.lastIndexOf("/") + 1),
    load,
  ]),
) as Record<
  string,
  () => Promise<ResumeTemplateItem>
>;

export const loadResumeTemplateData = (fileName: string) => {
  // 文件名仍是模板标识，范本可按用途移动到子目录。
  const load = resumeModules[fileName];
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
