export interface ParsedPdfResume {
  pages: number; // PDF 页数。
  text: string; // 从 PDF 本身提取的完整文字。
  name: string; // 从首页文字独立识别的姓名候选。
  emails: string[]; // 从 PDF 文字识别的邮箱。
  phones: string[]; // 从 PDF 文字识别的电话号码。
  work: string; // 通用工作经历标题之后的文字。
  education: string; // 通用教育经历标题之后的文字。
}

const MAX_PDF_BYTES = 50 * 1024 * 1024;
const MAX_PDF_PAGES = 20;
const emailPattern = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi;
const phonePattern = /(?:\+?\d[\d\s()-]{6,}\d)/g;
const headingPatterns = {
  work: /^(工作经历|工作经验|职业经历|实习经历|work experience|employment|professional experience)$/i, // 通用工作模块标题。
  education: /^(教育经历|教育背景|学历教育|education|academic background)$/i, // 通用教育模块标题。
  other: /^(专业技能|技能|项目经历|个人优势|荣誉证书|作品集|skills|projects|profile|summary|honors|certificates)$/i, // 结束当前模块的其他常见标题。
};
const digits = (value: string) => value.replace(/\D/g, "");

// 检测器只读取 PDF 字节；不接触预览 DOM、主题编号和简历源数据。
export const parsePdfResume = async (file: Blob): Promise<ParsedPdfResume> => {
  if (file.size > MAX_PDF_BYTES) throw new Error("PDF 文件不能超过 50MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!new TextDecoder().decode(bytes.subarray(0, 1024)).includes("%PDF-")) {
    throw new Error("请选择有效的 PDF 文件");
  }
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: true });
  let passwordRequired = false;
  task.onPassword = () => {
    passwordRequired = true;
    void task.destroy().catch(() => {});
  };
  try {
    const pdf = await task.promise;
    if (pdf.numPages > MAX_PDF_PAGES) throw new Error("PDF 最多支持 20 页");
    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let line = "";
      let previousY: number | null = null;
      let previousEndX = 0;
      for (const entry of content.items) {
        if (!("str" in entry) || !entry.str) continue;
        const x = entry.transform[4];
        const y = entry.transform[5];
        if (previousY !== null && Math.abs(y - previousY) > 2) {
          if (line.trim()) lines.push(line.trim());
          line = "";
        } else if (line && x - previousEndX > 2) {
          line += " ";
        }
        line += entry.str;
        previousY = y;
        previousEndX = x + entry.width;
        if (entry.hasEOL) {
          if (line.trim()) lines.push(line.trim());
          line = "";
          previousY = null;
        }
      }
      if (line.trim()) lines.push(line.trim());
      pageTexts.push(lines.join("\n"));
      page.cleanup();
    }
    const text = pageTexts.join("\n");
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const emails = [...new Set(text.match(emailPattern)?.map((value) => value.toLowerCase()) ?? [])];
    const phones = [...new Set((text.match(phonePattern) ?? []).map(digits).filter((value) => value.length >= 7 && value.length <= 15))];
    // 姓名仅由 PDF 首页前几行推断；无法可靠识别时留空，不使用源简历回填。
    const name = (pageTexts[0] || "").split("\n").slice(0, 12).map((value) => value.trim()).find((value) =>
      (/^[\p{Script=Han}·\s]{2,8}$/u.test(value) || /^[A-Za-z][A-Za-z .'-]{3,39}$/.test(value)) &&
      !headingPatterns.work.test(value) && !headingPatterns.education.test(value) && !headingPatterns.other.test(value) &&
      !/^(简历|姓名|resume|curriculum vitae)$/i.test(value)
    ) || "";
    let active: "work" | "education" | "" = "";
    const sections = {
      work: [] as string[], // 工作经历标题下的文字行。
      education: [] as string[], // 教育经历标题下的文字行。
    };
    for (const line of lines) {
      if (headingPatterns.work.test(line)) { active = "work"; continue; }
      if (headingPatterns.education.test(line)) { active = "education"; continue; }
      if (headingPatterns.other.test(line)) { active = ""; continue; }
      if (active) sections[active].push(line);
    }
    return { pages: pdf.numPages, text, name, emails, phones, work: sections.work.join("\n"), education: sections.education.join("\n") };
  } catch (error) {
    if (passwordRequired) throw new Error("暂不支持加密 PDF，请解除密码后重试");
    throw error;
  } finally {
    await task.destroy();
  }
};
