/**
 * 图片处理工具函数
 */

// MIME类型到格式映射
const MIME_TO_FMT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

// 文件扩展名到格式映射
const EXT_TO_FMT = { jpg: 'jpg', jpeg: 'jpg', png: 'png', webp: 'webp' }

/**
 * 获取文件格式
 * @param file - 文件对象
 * @returns 文件格式字符串
 */
export const getFormat = (file: File | null): string => {
  if (!file) return ''
  const byMime = MIME_TO_FMT[file.type]
  if (byMime) return byMime
  const name = file.name || ''
  const ext = (name.split('.').pop() || '').toLowerCase()
  return EXT_TO_FMT[ext] || ''
}

/**
 * 格式转换为MIME类型
 * @param fmt - 格式字符串
 * @returns MIME类型字符串
 */
export const toMime = (fmt: string): string =>
  ({ jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' })[fmt] || 'image/webp'

/**
 * 重命名文件扩展名
 * @param name - 原文件名
 * @param fmt - 目标格式
 * @returns 新文件名
 */
export const renameWithExt = (name: string, fmt: string): string => {
  const base = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name
  return `${base}.${fmt}`
}

/**
 * 调整图片大小并转换为Blob
 * @param file - 原文件
 * @param mime - MIME类型
 * @param w - 目标宽度
 * @param h - 目标高度
 * @param q - 质量 (0-1)
 * @returns Promise<Blob>
 */
export const resizeToBlob = (
  file: File,
  mime: string,
  w: number,
  h: number,
  q: number,
): Promise<Blob> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          resolve(blob || file)
        },
        mime,
        q,
      )
    }
    img.src = url
  })

/**
 * 文件大小格式化
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}
