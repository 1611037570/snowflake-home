/**
 * 基础路由列表
 * 包含项目的基础设施
 */

export const BASE_ROUTES = ['messageBoard', 'icon', 'color', 'components', 'data', 'index']
/**
 * 项目路由列表
 * 包含企业级应用项目路由
 */

import ResumeLogo from '@/views/resumeMain/logo.vue'
import HomeIcon from '../../assets/images/snow.svg'
export const PROJECT_ROUTES = [
  {
    name: 'home',
    icon: HomeIcon,
    iconType: 'img',
  },
  {
    name: 'resumeMain',
    icon: ResumeLogo,
    iconType: 'component',
  },
  {
    name: 'image',
    icon: '',
  },
  {
    name: 'resume',
    hidden: true,
    icon: '',
  },
]
/**
 * 轻量级路由列表
 * 包含简单小游戏和实用工具路由
 */
export const MUSE_ROUTES = [
  '2048',
  'sort',
  'checklist',
  'note',
  'passwordBox',
  'reborn',
  'time',
  'ai',
  'test',
]
/**
 * 基础与项目路由组合列表
 * 包含所有基础路由、项目路由和轻量级路由，用于导航和权限控制
 */
export const ALL_ROUTES = [...BASE_ROUTES, ...PROJECT_ROUTES, ...MUSE_ROUTES]
