// 定义快捷方式数据项接口
export interface ShortcutItem {
  // 名称
  name: string
  // 链接
  url: string
  // 图标类型
  imgType: 'img' | 'icon'
  // 图标值
  imgValue: string
  // 唯一标识
  id: string
  // 拼音
  pinyin: string
  // 是否置顶
  top: boolean
}
