import pica from "pica";

/** 默认 WebP 压缩质量 (0-1) */
const DEFAULT_QUALITY = 0.85;

/** 最终处理结果 */
export interface ProcessedImage {
  src: string;
  width: number;
  height: number;
}

// pica 图片处理实例：WebWorker 高质量缩放，大图更省内存
const picaInstance = pica({
  tileSize: 512,
  idleTimeout: 3000,
});

/**
 * 将图片源缩放并导出为 WebP base64
 * 支持裁切画布或完整图片，按目标尺寸缩放
 * @param source - 图片画布、图片元素或 ImageBitmap
 * @param targetWidth - 目标宽度
 * @param targetHeight - 目标高度
 * @param quality - WebP 压缩质量 (0-1)，默认 0.85
 * @returns 导出结果
 */
export const compressWebp = async (
  source: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
  targetWidth: number,
  targetHeight: number,
  quality: number = DEFAULT_QUALITY,
): Promise<ProcessedImage> => {
  if (quality < 0 || quality > 1) {
    throw new Error("压缩质量参数必须在 0 到 1 之间");
  }
  if (targetWidth <= 0 || targetHeight <= 0) {
    throw new Error("目标尺寸必须大于 0");
  }

  const dst = document.createElement("canvas");
  dst.width = targetWidth;
  dst.height = targetHeight;
  // pica 高质量缩放（lanczos3 滤波 + 适度锐化）
  const canvas = await picaInstance.resize(source, dst, {
    filter: "hamming",
    unsharpAmount: 160,
    unsharpRadius: 0.6,
    unsharpThreshold: 1,
  });

  // 压缩后打印一次（WebP 有损导出，保留透明）
  const src = canvas.toDataURL("image/webp", quality);
  console.log("图片大小-压缩后", {
    字符长度: src.length,
    KB: (src.length / 1024).toFixed(1),
    宽: canvas.width,
    高: canvas.height,
  });

  return { src, width: canvas.width, height: canvas.height };
};
