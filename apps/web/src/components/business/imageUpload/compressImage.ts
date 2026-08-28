/** 默认 JPEG 压缩质量 (0-1) */
const DEFAULT_QUALITY = 0.92;

/** 合法图片扩展名 */
const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png"] as const;
/** 合法 MIME 类型 */
const VALID_MIME_TYPES = ["image/jpeg", "image/png"];
/** 文件大小上限（10MB） */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** 最终处理结果 */
export interface ProcessedImage {
  src: string;
  width: number;
  height: number;
}

/** 原始图片信息（原始宽高） */
interface RawImage {
  image: HTMLImageElement;
  originalWidth: number;
  originalHeight: number;
}

/** 缩放后的图片信息 */
interface ResizedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
}

/**
 * 将图片文件转换为经过等比压缩的 base64 图片
 * 压缩目标为传入的目标宽高，原图小于目标尺寸时保持原图大小（只缩小不放大）
 * @param file - 待处理的图片文件（Blob/File）
 * @param targetWidth - 压缩目标宽度（px）
 * @param targetHeight - 压缩目标高度（px）
 * @param quality - JPEG 压缩质量 (0-1)，默认 0.92
 * @returns 压缩后的图片信息
 * @throws 文件无效、参数错误或处理失败时抛出异常
 */
export const compressImage = async (
  file: Blob,
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

  validateFile(file);
  const raw = await transformImage(file);
  const resized = calcResizedDimensions(raw, targetWidth, targetHeight);
  return toBase64(resized, quality);
};

/**
 * 验证文件合法性
 * @throws 文件大小超限或格式不支持时抛出错误
 */
const validateFile = (file: Blob): void => {
  if (file.size === 0) {
    throw new Error("文件为空");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("文件大小超过 10MB 限制");
  }

  // MIME 类型校验
  if (file.type && !VALID_MIME_TYPES.includes(file.type as (typeof VALID_MIME_TYPES)[number])) {
    throw new Error("仅支持 JPEG 或 PNG 格式");
  }

  // 扩展名校验（仅 File 对象）
  if (file instanceof File) {
    const name = file.name.toLowerCase();
    const isValidExt = VALID_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!isValidExt) {
      throw new Error("仅支持 .jpg, .jpeg, .png 格式");
    }
  }
};

/**
 * 将文件读取为 Image 对象（使用 ObjectURL，性能更好）
 */
const transformImage = (file: Blob): Promise<RawImage> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // 图片加载完成后立即释放 ObjectURL
      URL.revokeObjectURL(url);
      resolve({
        image: img,
        originalWidth: img.width,
        originalHeight: img.height,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片解码失败"));
    };
    img.src = url;
  });
};

/**
 * 计算等比缩放后的尺寸（只缩小，不放大，保持宽高比）
 */
const calcResizedDimensions = (
  raw: RawImage,
  targetWidth: number,
  targetHeight: number,
): ResizedImage => {
  const { image, originalWidth: width, originalHeight: height } = raw;
  const ratio = Math.min(targetWidth / width, targetHeight / height, 1);
  return {
    image,
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

/**
 * 将图片绘制到 Canvas 并导出为 base64（同步操作）
 * 注意：若图片跨域且未设置 crossOrigin，会抛出 SecurityError
 */
const toBase64 = ({ image, width, height }: ResizedImage, quality: number): ProcessedImage => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法获取 Canvas 上下文");
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  try {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return { src: dataUrl, width, height };
  } catch (err) {
    // 捕获跨域等异常
    throw new Error("图片导出失败：" + (err as Error).message);
  } finally {
    // 释放 Canvas 资源
    canvas.width = 0;
    canvas.height = 0;
  }
};
