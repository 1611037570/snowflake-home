let cropperModule: Promise<typeof import("cropperjs")["default"]> | undefined;

// 首次打开裁剪时并行加载样式与代码，多个头像字段复用资源加载任务。
export const loadCropper = () => {
  cropperModule ??= Promise.all([
    import("cropperjs"),
    import("cropperjs/dist/cropper.css"),
  ]).then(([module]) => module.default).catch((error) => {
    cropperModule = undefined;
    throw error;
  });
  return cropperModule;
};
