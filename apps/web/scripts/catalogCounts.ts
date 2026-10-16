import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import type { CatalogCounts } from "../site.config";

// 从实际清单读取数量，避免 SEO 文案另存一份易过期的数字。
const readArray = (relativePath: string, variableName: string): ts.ArrayLiteralExpression => {
  const path = resolve(process.cwd(), relativePath);
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  let result: ts.ArrayLiteralExpression | undefined;
  const unwrap = (node: ts.Expression): ts.Expression =>
    ts.isAsExpression(node) || ts.isSatisfiesExpression(node) ? unwrap(node.expression) : node;
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === variableName) {
      const value = node.initializer && unwrap(node.initializer);
      const array = value && (ts.isArrayLiteralExpression(value)
        ? value
        : ts.isCallExpression(value) && value.arguments[0] && ts.isArrayLiteralExpression(value.arguments[0])
          ? value.arguments[0]
          : undefined);
      if (array) result = array;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!result) throw new Error(`无法读取目录清单：${variableName}`);
  return result;
};

export const getCatalogCounts = (): CatalogCounts => {
  const examples = readArray("src/views/resume/template/data/list.ts", "resumeTemplateList");
  const themes = readArray("src/domain/resume/theme/styles/index.ts", "themeTemplateList");
  const plainThemes = readArray("src/domain/resume/theme/styles/plainTitleThemes.ts", "plainTitleThemeSpecs");
  const exampleCount = examples.elements.length;
  const templateCount = themes.elements.reduce((count, entry) => {
    if (ts.isSpreadElement(entry) && entry.expression.getText() === "plainTitleThemes") {
      return count + plainThemes.elements.length;
    }
    if (!ts.isIdentifier(entry)) throw new Error("主题清单含无法统计的条目");
    return count + 1;
  }, 0);
  return { exampleCount, templateCount };
};
