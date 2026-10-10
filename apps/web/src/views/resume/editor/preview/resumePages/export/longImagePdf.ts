export interface LongImagePdfRequest {
  /** 无损图片的二进制数据，传输时转移所有权 */
  image: ArrayBuffer;
  /** 画布像素宽度，用于计算纸张比例 */
  width: number;
  /** 画布像素高度，用于计算纸张比例 */
  height: number;
}

export type LongImagePdfResponse = {
  /** 生成的文件数据，传回主线程时转移所有权 */
  buffer: ArrayBuffer;
} | {
  /** 后台生成失败的说明 */
  error: string;
};

interface LongImagePdfJob {
  /** 后台文件生成结果 */
  result: Promise<Blob>;
  /** 将图片数据和尺寸发送到后台 */
  write: (image: ArrayBuffer, width: number, height: number) => void;
  /** 释放后台线程及取消监听 */
  dispose: () => void;
}

// 提前启动后台线程，让封装资源加载与长图渲染并行。
export const createLongImagePdfJob = (signal: AbortSignal): LongImagePdfJob => {
  const worker = new Worker(new URL("./longImagePdf.worker.ts", import.meta.url), { type: "module" });
  let rejectResult: (reason: unknown) => void = () => {};
  const result = new Promise<Blob>((resolve, reject) => {
    rejectResult = reject;
    worker.onmessage = (event: MessageEvent<LongImagePdfResponse>) => {
      if ("error" in event.data) reject(new Error(event.data.error));
      else resolve(new Blob([event.data.buffer], { type: "application/pdf" }));
    };
    worker.onerror = () => reject(new Error("简历后台封装失败"));
    worker.onmessageerror = () => reject(new Error("简历后台数据读取失败"));
  });
  // 启动阶段可能先于画布完成失败，提前接收拒绝，随后由导出入口处理错误。
  void result.catch(() => undefined);
  const dispose = () => {
    signal.removeEventListener("abort", dispose);
    worker.terminate();
    rejectResult(new DOMException("导出已取消", "AbortError"));
  };
  signal.addEventListener("abort", dispose, { once: true });
  if (signal.aborted) dispose();
  return {
    result, // 后台生成的文件
    write: (image, width, height) => worker.postMessage({ image, width, height } satisfies LongImagePdfRequest, [image]), // 转移图片数据
    dispose, // 释放后台任务
  };
};
