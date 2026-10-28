import { readFileSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import ts from "typescript";
import { publicExamples, type ExampleSection } from "../src/views/resume/seo/catalog";

// 只读取字面量，不执行范本导入的主题、头像或浏览器相关代码。
function readLiteral(node: ts.Expression): unknown {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) return readLiteral(node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.flatMap((property) => {
      if (!ts.isPropertyAssignment(property) || ts.isComputedPropertyName(property.name)) return [];
      return [[property.name.getText().replace(/^["']|["']$/g, ""), readLiteral(property.initializer)]];
    }));
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((entry) =>
    ts.isSpreadElement(entry) ? undefined : readLiteral(entry),
  );
  return undefined;
}

// 富文本仅保留可读段落，实体在输出时重新转义，避免注入可执行标签。
const plainParagraphs = (content: string) => content
  .replace(/<\/(?:p|li|h[1-6])\s*>|<br\s*\/?\s*>/gi, "\n")
  .replace(/<[^>]*>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .split(/\n+/).map((line) => line.trim()).filter(Boolean);

// 与运行时范本加载器保持按文件名定位，目录调整后无需修改公开页面清单。
export function getExampleSourceFiles(root: string): Map<string, string> {
  const directory = resolve(root, "src/views/resume/template/data/resumes");
  const selected = new Set(publicExamples.map((example) => example.fileName));
  const files = new Map<string, string>();
  for (const relative of readdirSync(directory, { recursive: true })) {
    const name = basename(relative);
    if (!selected.has(name)) continue;
    if (files.has(name)) throw new Error(`公开范本存在同名文件：${name}`);
    files.set(name, resolve(directory, relative));
  }
  for (const fileName of selected) {
    if (!files.has(fileName)) throw new Error(`公开范本文件不存在：${fileName}`);
  }
  return files;
}

export function readExampleSections(root: string): Record<string, ExampleSection[]> {
  const files = getExampleSourceFiles(root);
  return Object.fromEntries(publicExamples.map((example) => {
    const path = files.get(example.fileName)!;
    const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
    // 以默认导出的对象为正文来源，避免重命名变量后需要同步修改构建代码。
    const exported = source.statements.find(ts.isExportAssignment)?.expression;
    let data: Record<string, any> | undefined;
    const visit = (node: ts.Node) => {
      if (ts.isVariableDeclaration(node) && node.initializer && exported && ts.isIdentifier(exported)
        && node.name.getText(source) === exported.text) {
        data = (readLiteral(node.initializer) as Record<string, Record<string, any>>)?.data;
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    if (exported && ts.isObjectLiteralExpression(exported)) {
      data = (readLiteral(exported) as Record<string, Record<string, any>>)?.data;
    }
    if (!data) throw new Error(`无法读取公开范本正文：${example.fileName}`);
    // 只提取求职内容模块，不输出姓名、电话、邮箱、头像或用户界面配置。
    const modules = [
      ["skill", "专业技能"],
      ["education", "教育背景"],
      ["work", "工作与实习经历"],
      ["project", "项目经历"],
      ["advantage", "个人优势"],
    ] as const;
    const sections = modules.flatMap(([key, title]) => {
      const module = data?.[key];
      const records = module?.list ?? (module?.data ? [module] : []);
      const paragraphs: string[] = records.flatMap((record: any) => {
        const item = record.data ?? {};
        const heading = [item.name, item.post, item.education, item.startTime, item.endTime]
          .filter((value) => typeof value === "string" && value).join(" · ");
        return [heading, ...plainParagraphs(typeof item.content === "string" ? item.content : "")].filter(Boolean);
      });
      return paragraphs.length ? [{ title, paragraphs }] : [];
    });
    if (!sections.length) throw new Error(`公开范本正文为空：${example.fileName}`);
    return [example.slug, sections];
  }));
}

