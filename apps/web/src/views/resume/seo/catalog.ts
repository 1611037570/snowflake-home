import { resumeTemplateList } from "../template/data/list";

/** 首批公开范本的固定地址与源文件，地址发布后保持稳定。 */
const exampleSources = [
  ["campus-software-engineer", "fe__0__01.ts"],
  ["operations-intern", "op__0-1__01.ts"],
  ["ecommerce-seo-sem", "ecommerce-seo-sem__3-5__01.ts"],
  ["finance-data-analyst", "finance-data-analysis__3-5__01.ts"],
  ["bank-accountant", "bank-accounting__3-5__01.ts"],
  ["game-client-engineer", "gaming-csharp-engineer__3-5__01.ts"],
  ["teacher", "education-training-teacher__3-5__01.ts"],
  ["dotnet-engineer", "manufacturing-dotnet-engineer__3-5__01.ts"],
  ["java-engineer", "energy-java__3-5__01.ts"],
  ["embedded-engineer", "telecommunication-embedded__3-5__01.ts"],
] as const;

export interface PublicExample {
  /** 公开地址中的稳定标识。 */
  slug: string;
  /** 对应现有范本的文件名。 */
  fileName: string;
  /** 范本展示名称。 */
  name: string;
  /** 范本适用场景说明。 */
  description: string;
  /** 范本公开详情地址。 */
  path: string;
}

export interface ExampleSection {
  /** 简历模块的中文名称。 */
  title: string;
  /** 模块内按原顺序展示的公开示例段落。 */
  paragraphs: string[];
}

// 元信息始终取自已有范本清单，不另存岗位描述。
export const publicExamples: PublicExample[] = exampleSources.map(([slug, fileName]) => {
  const source = resumeTemplateList.find((item) => item.fileName === fileName);
  if (!source) throw new Error(`公开范本未登记：${fileName}`);
  return {
    slug, // 公开页面标识。
    fileName, // 正文来源文件。
    name: source.name, // 清单中的范本名称。
    description: source.description, // 清单中的适用说明。
    path: `/resume/example/${slug}`, // 独立详情地址。
  };
});
