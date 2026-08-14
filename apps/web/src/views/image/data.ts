// 返回一个空的图片数据对象模板
export const emptyImageData = () => ({
  // 图片宽度
  width: 0,
  // 图片高度
  height: 0,
  // 图片文件大小
  size: 0,
  // 图片格式
  format: "",
  // 图片预览URL
  url: "",
  // 转换后的 Blob 对象
  blob: null,
  // 图片质量
  quality: 1,
});

// 预设大小
export const shapePresetList = [
  {
    name: "64",
    value: 64,
  },
  {
    name: "128",
    value: 128,
  },
  {
    name: "256",
    value: 256,
  },
  {
    name: "512",
    value: 512,
  },
  {
    name: "1024",
    value: 1024,
  },
];

// 百分比预设
export const percentPresetList = [
  {
    name: "25%",
    value: 25,
  },
  {
    name: "50%",
    value: 50,
  },
  {
    name: "75%",
    value: 75,
  },
  {
    name: "100%",
    value: 100,
  },
];
