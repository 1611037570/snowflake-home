import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const localeDir = path.resolve(scriptDir, "../src/locales/lang");
const baseLocale = "zh";
const targetLocales = fs
  .readdirSync(localeDir, { withFileTypes: true })
  .filter((item) => item.isDirectory() && item.name !== baseLocale)
  .map((item) => item.name);

function flattenMessage(message, prefix = "", result = {}) {
  Object.entries(message).forEach(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenMessage(value, currentKey, result);
      return;
    }
    result[currentKey] = value;
  });
  return result;
}

function getMessageKeys(filePath) {
  const message = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return flattenMessage(message);
}

function getPlaceholders(value) {
  return String(value).match(/\{[^}]+\}/g) || [];
}

const issues = [];
const baseDir = path.join(localeDir, baseLocale);
const baseFiles = fs.readdirSync(baseDir).filter((file) => file.endsWith(".json"));

targetLocales.forEach((locale) => {
  const localeDirPath = path.join(localeDir, locale);
  const targetFiles = fs.readdirSync(localeDirPath).filter((file) => file.endsWith(".json"));
  const files = new Set([...baseFiles, ...targetFiles]);

  files.forEach((file) => {
    const baseFile = path.join(baseDir, file);
    const targetFile = path.join(localeDirPath, file);
    if (!fs.existsSync(baseFile) || !fs.existsSync(targetFile)) {
      issues.push(`[${locale}] 缺少语言包文件: ${file}`);
      return;
    }

    const baseMessages = getMessageKeys(baseFile);
    const targetMessages = getMessageKeys(targetFile);
    Object.keys(baseMessages)
      .filter((key) => !(key in targetMessages))
      .forEach((key) => issues.push(`[${locale}/${file}] 缺少 key: ${key}`));
    Object.keys(targetMessages)
      .filter((key) => !(key in baseMessages))
      .forEach((key) => issues.push(`[${locale}/${file}] 多余 key: ${key}`));

    Object.keys(baseMessages)
      .filter((key) => key in targetMessages)
      .forEach((key) => {
        const basePlaceholders = getPlaceholders(baseMessages[key]).sort();
        const targetPlaceholders = getPlaceholders(targetMessages[key]).sort();
        if (basePlaceholders.join("|") !== targetPlaceholders.join("|")) {
          issues.push(`[${locale}/${file}] 占位符不一致: ${key}`);
        }
      });
  });
});

if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else {
  console.log("国际化语言包检查通过");
}
