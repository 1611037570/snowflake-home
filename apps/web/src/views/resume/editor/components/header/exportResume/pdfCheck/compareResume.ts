import type { ParsedPdfResume } from "./pdfReader";

export interface PdfFieldResult {
  label: string; // 对照字段的中文名称。
  expected: string; // 当前简历中可见字段的原值。
  actual: string; // PDF 独立解析得到的对应内容。
  status: "matched" | "unclassified" | "missing" | "unknown"; // 匹配、只读到文字、文字缺失或无法判断。
}

const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
const digits = (value: string) => value.replace(/\D/g, "");

// 此层才读取简历源数据；独立的 PDF 解析器不会收到源字段或主题信息。
export const comparePdfResume = (parsed: ParsedPdfResume, resumeItem: any): PdfFieldResult[] => {
  const data = resumeItem?.data || {};
  const results: PdfFieldResult[] = [];
  const add = (label: string, expectedValue: unknown, actual: string, matched: boolean) => {
    const expected = String(expectedValue || "").trim();
    if (!expected) return;
    const readable = label === "电话"
      ? parsed.text.split("\n").some((line) => digits(line).includes(digits(expected)))
      : normalize(parsed.text).includes(normalize(expected));
    results.push({
      label, // 当前对照项的展示名称。
      expected, // 用户填写且可见的字段内容。
      actual, // 独立解析得到的内容。
      status: /\*/.test(expected) ? "unknown" : matched ? "matched" : readable ? "unclassified" : "missing", // 区分解析失败与文字层缺失。
    });
  };
  const user = data.user;
  if (user && user.ui?.hidden !== true) {
    if (user.ui?.name?.hidden !== true) add("姓名", user.data?.name, parsed.name, normalize(parsed.name) === normalize(String(user.data?.name || "")));
    if (user.ui?.phone?.hidden !== true) add("电话", user.data?.phone, parsed.phones.join("、"), parsed.phones.includes(digits(String(user.data?.phone || ""))));
    if (user.ui?.email?.hidden !== true) add("邮箱", user.data?.email, parsed.emails.join("、"), parsed.emails.includes(String(user.data?.email || "").toLowerCase()));
  }
  for (const [key, label, section] of [["work", "工作单位", parsed.work], ["internship", "实习单位", parsed.work], ["education", "学校", parsed.education]] as const) {
    const module = data[key];
    if (!module || module.ui?.hidden === true || !Array.isArray(module.list)) continue;
    for (const entry of module.list) {
      if (entry?.ui?.hidden === true) continue;
      const expected = String(entry?.data?.name || "").trim();
      if (expected) add(label, expected, section, Boolean(section && normalize(section).includes(normalize(expected))));
    }
  }
  return results;
};
