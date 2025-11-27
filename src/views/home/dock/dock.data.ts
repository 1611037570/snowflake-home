import About from './components/about.vue'
import AppCenter from './components/appCenter.vue'
import Email from './components/email.vue'
import Image from './components/image.vue'
import Launchpad from './components/launchpad.vue'
import Note from './components/note.vue'
import SendResume from './components/sendResume.vue'
import Setting from './components/setting.vue'
import WriteResume from './components/writeResume.vue'

const list = [
  { name: '启动台', component: Launchpad },
  { name: '图片', component: Image },
  { name: '写简历', component: WriteResume },
  { name: '投简历', component: SendResume },
  { name: '关于', component: About },
  { name: '设置', component: Setting },
  { name: '便签', component: Note },
  { name: '邮箱', component: Email },
  { name: '添加', component: AppCenter },
]
export default list
