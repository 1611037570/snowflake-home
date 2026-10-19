import { $t } from "@/locales";

export const MAX_PDF_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_PDF_PAGES = 10;
export const MAX_PDF_REQUEST_BYTES = 16 * 1024 * 1024;

// 浏览器逐页渲染，取消时同时终止 Worker 与当前画布任务。
export const extractPdfImages = async (
  file: File,
  signal: AbortSignal,
  onProgress: (page: number, total: number) => void,
) => {
  if (file.size > MAX_PDF_FILE_BYTES) throw new Error($t("resumeImportPdfTooLarge", { size: MAX_PDF_FILE_BYTES / 1024 / 1024 }));
  signal.throwIfAborted();
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!new TextDecoder().decode(bytes.subarray(0, 1024)).includes("%PDF-")) {
    throw new Error($t("resumeImportPdfInvalid"));
  }
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
  ]);
  signal.throwIfAborted();
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({
    // 本地文件二进制内容
    data: bytes,
    // 禁止执行 PDF 字体中的动态代码
    isEvalSupported: false,
    // 未嵌入字体时允许浏览器使用本机字体
    useSystemFonts: true,
  });
  let passwordRequired = false;
  // 不等待未提供的密码交互。
  task.onPassword = () => {
    passwordRequired = true;
    void task.destroy().catch(() => {});
  };
  const abort = () => { void task.destroy().catch(() => {}); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > MAX_PDF_PAGES) throw new Error($t("resumeImportPdfTooManyPages", { pages: MAX_PDF_PAGES }));
    const images: string[] = [];
    let imageBytes = 0;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      signal.throwIfAborted();
      onProgress(pageNumber, pdf.numPages);
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      // 固定 A4 画布，原页面等比缩放并居中，避免裁切或拉伸。
      const viewport = page.getViewport({ scale: Math.min(794 / base.width, 1123 / base.height) });
      const canvas = document.createElement("canvas");
      try {
        canvas.width = 794;
        canvas.height = 1123;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error($t("resumeImportPdfRenderFailed"));
        const render = page.render({
          // 固定尺寸的输出画布
          canvas,
          // 页面绘制上下文
          canvasContext: context,
          // 等比缩放后的页面视口
          viewport,
          // 页面在画布中居中显示
          transform: [1, 0, 0, 1, (canvas.width - viewport.width) / 2, (canvas.height - viewport.height) / 2],
          // 留白区域使用白色背景
          background: "#ffffff",
        });
        const cancelRender = () => render.cancel();
        signal.addEventListener("abort", cancelRender, { once: true });
        try { await render.promise; }
        finally { signal.removeEventListener("abort", cancelRender); }
        signal.throwIfAborted();
        // 固定使用 WebP 与高质量编码，不动态降低尺寸或质量。
        const image = canvas.toDataURL("image/webp", 0.95);
        imageBytes += image.length;
        if (imageBytes > MAX_PDF_REQUEST_BYTES) throw new Error($t("resumeImportPdfImagesTooLarge"));
        images.push(image);
      } finally {
        canvas.width = canvas.height = 0;
        page.cleanup();
      }
    }
    return images;
  } catch (error) {
    signal.throwIfAborted();
    if (passwordRequired) throw new Error($t("resumeImportPdfEncrypted"));
    throw error;
  } finally {
    signal.removeEventListener("abort", abort);
    await task.destroy();
  }
};
