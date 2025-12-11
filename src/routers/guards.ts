// 导入语言包加载函数
import { loadPageLang } from '@/locales'

export async function beforeEachGuard(to: any, from: any, next: any) {
  const pageName = to.name

  if (pageName) {
    loadPageLang(pageName)
  }
  next() // 加载完成后放行路由
}
