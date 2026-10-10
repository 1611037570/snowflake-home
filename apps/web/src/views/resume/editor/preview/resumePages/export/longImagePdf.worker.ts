import jsPDF from "jspdf";
import { PDF_PAGE_WIDTH } from "../../shared/constants";
import type { LongImagePdfRequest, LongImagePdfResponse } from "./longImagePdf";

// 后台只处理图片字节与文件封装，不访问编辑器和页面节点。
self.onmessage = (event: MessageEvent<LongImagePdfRequest>) => {
  try {
    const { image, width, height } = event.data;
    const pageHeight = (height / width) * PDF_PAGE_WIDTH;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [PDF_PAGE_WIDTH, pageHeight] });
    pdf.addImage(new Uint8Array(image), "PNG", 0, 0, PDF_PAGE_WIDTH, pageHeight, undefined, "FAST");
    const buffer = pdf.output("arraybuffer");
    self.postMessage({ buffer } satisfies LongImagePdfResponse, { transfer: [buffer] });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : "简历文件生成失败" } satisfies LongImagePdfResponse);
  }
};
