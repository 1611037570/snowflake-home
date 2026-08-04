export type MenuProps = {
  list?: any
  model?: 'click' | 'contextmenu'
  // 点击事件是否阻止事件冒泡
  stopPropagation?: boolean
  // 点击事件是否阻止默认事件
  preventDefault?: boolean
  // 菜单创建前回调函数，返回false则不创建菜单
  beforeCreateFn?: () => boolean
  // 菜单位置，默认top-left
  position?: 'tl' | 'tr' | 'bl' | 'br' | null
  // 菜单样式
  style?: any
  // 菜单容器样式
  menuContainerStyle?: any
  // 菜单列表中显示的文本字段名
  nameKey?: string
  // 菜单列表中点击事件回调函数字段名
  fnKey?: string
}

export type MenuEmits = {
  // 菜单创建前事件
  (e: 'onBeforeCreate'): void
  // 菜单挂载完成事件
  (e: 'onMounted'): void
  // 菜单选中事件
  (e: 'onSelected', item: any): object
  // 菜单卸载前事件
  (e: 'onBeforeUnmount'): void
  // 菜单卸载完成事件
  (e: 'onUnmounted'): void
}
