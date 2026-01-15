/**
 * 基础页面
 * 用于展示项目的图标、主题样式资源
 */
export const PAGE_BASE_LIST = ['messageBoard', 'icon', 'color']
/**
 * 项目页面
 * 用于加载所需要的项目
 */
export const PAGE_PROJECT_LIST = [
  'image',
  'resume',
  'index',
  'home',
  'reborn',
  '2048',
  'sort',
  'checklist',
]
/**
 * 所有页面
 * 包含基础页面和项目页面（路由通过 PAGE_ALL_LIST 配置）
 */
export const PAGE_ALL_LIST = [...PAGE_BASE_LIST, ...PAGE_PROJECT_LIST]
