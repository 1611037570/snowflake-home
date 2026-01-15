import { ALL_PAGE_LIST } from '@/constants'
import About from './components/about.vue'
import AppCenter from './components/appCenter.vue'
import Email from './components/email.vue'
import Image from './components/image.vue'
import Launchpad from './components/launchpad.vue'
import Note from './components/note.vue'
import PasswordBox from './components/passwordBox.vue'
import SendResume from './components/sendResume.vue'
import Setting from './components/setting.vue'
import WriteResume from './components/writeResume.vue'

const list = [
  { name: '启动台', component: Launchpad, type: 'system' },
  { name: '图片', component: Image, type: 'page', page: 'image' },
  { name: '写简历', component: WriteResume, type: 'page', page: 'resume' },
  { name: '投简历', component: SendResume, type: 'system' },
  { name: '关于', component: About, type: 'system' },
  { name: '设置', component: Setting, type: 'system' },
  { name: '便签', component: Note, type: 'page', page: 'note' },
  { name: '邮箱', component: Email, type: 'system' },
  { name: '添加', component: AppCenter, type: 'system' },
  { name: '密码箱', component: PasswordBox, type: 'page', page: 'passwordBox' },
]
function hasRoute(page: string) {
  return ALL_PAGE_LIST.includes(page)
}
const showList = list.filter((item: any) => {
  if (item.type == 'system') {
    return true
  }

  // 校验 page 是否在权限白名单中
  return hasRoute(item.page)
})

export default showList
