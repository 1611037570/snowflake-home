// 返回一个空的图片数据对象模板
export const emptyImageData = () => ({
  // 图片宽度
  width: 0,
  // 图片高度
  height: 0,
  // 图片文件大小
  size: 0,
  // 图片格式
  format: '',
  // 图片预览URL
  url: '',
  // 转换后的 Blob 对象
  blob: null,
  // 图片质量
  quality: 1,
})
