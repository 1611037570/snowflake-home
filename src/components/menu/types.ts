export type MenuProps = {
  list?: any
  model?: 'click' | 'contextmenu'
  stopPropagation?: boolean
  preventDefault?: boolean
  beforeCreateFn?: () => boolean
  position?: 'tl' | 'tr' | 'bl' | 'br' | null
  style?: any
  menuContainerStyle?: any
  nameKey?: string
  fnKey?: string
}

export type MenuEmits = {
  (e: 'onBeforeCreate'): void
  (e: 'onMounted'): void
  (e: 'onSelected', item: any): object
  (e: 'onBeforeUnmount'): void
  (e: 'onUnmounted'): void
}
