export const MAX_PDF_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_PDF_PAGES = 10;
export const MAX_PDF_REQUEST_BYTES = 16 * 1024 * 1024;

// 浏览器逐页渲染，取消时同时终止 Worker 与当前画布任务。
export const extractPdfImages = async (
  file: File,
  signal: AbortSignal,
  onProgress: (page: number, total: number) => void,
) => {
  if (file.size > MAX_PDF_FILE_BYTES) throw new Error("PDF 文件不能超过 20MB");
  signal.throwIfAborted();
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!new TextDecoder().decode(bytes.subarray(0, 1024)).includes("%PDF-")) {
    throw new Error("请选择有效的 PDF 文件");
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
    if (pdf.numPages > MAX_PDF_PAGES) throw new Error("PDF 最多支持 10 页");
    const images: string[] = [];
    let imageBytes = 0;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      signal.throwIfAborted();
      onProgress(pageNumber, pdf.numPages);
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(2, 1600 / base.width, 3000 / base.height) });
      const canvas = document.createElement("canvas");
      try {
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("浏览器无法渲染 PDF");
        const render = page.render({ canvas, canvasContext: context, viewport });
        const cancelRender = () => render.cancel();
        signal.addEventListener("abort", cancelRender, { once: true });
        try { await render.promise; }
        finally { signal.removeEventListener("abort", cancelRender); }
        signal.throwIfAborted();
        const image = canvas.toDataURL("image/jpeg", 0.82);
        imageBytes += image.length;
        if (imageBytes > MAX_PDF_REQUEST_BYTES) throw new Error("PDF 图片内容过大，请减少页数后重试");
        images.push(image);
      } finally {
        canvas.width = canvas.height = 0;
        page.cleanup();
      }
    }
    return images;
  } catch (error) {
    signal.throwIfAborted();
    if (passwordRequired) throw new Error("暂不支持加密 PDF，请解除密码后重试");
    throw error;
  } finally {
    signal.removeEventListener("abort", abort);
    await task.destroy();
  }
};
