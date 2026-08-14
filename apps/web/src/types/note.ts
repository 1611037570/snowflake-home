// 定义笔记数据项接口
export interface NoteItem {
  // 内容
  value: string
  // 创建时间
  createTime: number
  // 最后修改时间
  endTime: number
  // 唯一标识
  id: string
  // 置顶
  top: boolean
  // 是否开启md模式
  md: boolean
  // 是否开启待办模式
  todo: boolean
  // 是否完成待办
  todoDone: boolean
  // 背景色
  bgColor: string
}
