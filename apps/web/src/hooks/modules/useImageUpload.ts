import { useFileDialog } from "@vueuse/core";
import { ref } from "vue";
import { compressWebp } from "@/utils";

interface UseImageUploadOptions {
  /** 是否启用裁切：头像传 true，图片作品等保持原比例传 false */
  crop?: boolean;
  /** 裁切输出的目标宽度 */
  outputWidth?: number;
  /** 裁切输出的目标高度 */
  outputHeight?: number;
  /** 不裁切时等比缩放的最大宽度，原图更小时不放大 */
  maxWidth?: number;
  /** WebP 压缩质量 (0-1) */
  quality?: number;
  /** 处理完成回调，参数为裸 base64（不含 data URL 前缀） */
  onResult?: (base64: string) => void;
}

/**
 * 图片上传与 base64 获取全流程 hook
 * 使用 vueuse useFileDialog 选择图片，内部完成缩放/裁切与 WebP 压缩
 * 头像与图片作品复用同一套处理，仅通过 crop 开关区分是否裁切
 */
export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    crop = false,
    outputWidth,
    outputHeight,
    maxWidth = 800,
    quality = 0.85,
    onResult,
  } = options;

  // 图片处理中
  const loading = ref(false);
  // 裁切弹窗显隐与预览地址（仅裁切模式使用）
  const cropVisible = ref(false);
  const cropSrc = ref("");

  // vueuse 图片选择：单选图片文件
  const { open, onChange } = useFileDialog({
    accept: "image/*",
    multiple: false,
  });

  // 选中文件后打印大小信息
  const logFileSize = (file: File) => {
    console.log("图片大小-选中", {
      KB: (file.size / 1024).toFixed(1),
    });
  };

  // 读取图片元素尺寸，用于等比缩放计算
  const loadImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  // 压缩为裸 base64（去除固定 data URL 前缀，渲染处统一拼接）
  const toBareBase64 = (src: string) => src.split(",")[1] || "";

  // 关闭裁切弹窗并释放预览资源
  const closeCrop = () => {
    cropVisible.value = false;
    if (cropSrc.value) {
      URL.revokeObjectURL(cropSrc.value);
      cropSrc.value = "";
    }
  };

  // 裁切模式：暂存文件并打开裁切弹窗
  const handleCropFile = (file: File) => {
    closeCrop();
    cropSrc.value = URL.createObjectURL(file);
    cropVisible.value = true;
  };

  // 不裁切：保持原比例等比缩放后压缩为 WebP base64
  const processFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const ratio = Math.min(1, maxWidth / img.naturalWidth);
      const targetWidth = Math.max(1, Math.round(img.naturalWidth * ratio));
      const targetHeight = Math.max(1, Math.round(img.naturalHeight * ratio));
      const { src } = await compressWebp(img, targetWidth, targetHeight, quality);
      onResult?.(toBareBase64(src));
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  // 监听文件选择：按是否裁切走不同流程
  onChange(async (files) => {
    const file = files?.[0];
    if (!file) return;
    logFileSize(file);
    try {
      loading.value = true;
      if (crop) {
        handleCropFile(file);
      } else {
        await processFile(file);
      }
    } catch (err) {
      console.error("图片处理失败:", err);
    } finally {
      loading.value = false;
    }
  });

  // 打开图片选择
  const openPicker = () => open({ accept: "image/*" });

  // 确认裁切：内部取裁切画布并压缩为裸 base64
  const confirmCrop = async (cropper: any) => {
    if (!cropper) return;
    if (!outputWidth || !outputHeight) {
      console.error("裁切模式需要提供 outputWidth 与 outputHeight");
      return;
    }
    try {
      const canvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });
      const { src } = await compressWebp(canvas, outputWidth, outputHeight, quality);
      onResult?.(toBareBase64(src));
    } finally {
      closeCrop();
    }
  };

  return {
    openPicker,
    loading,
    cropVisible,
    cropSrc,
    confirmCrop,
    closeCrop,
  };
}
