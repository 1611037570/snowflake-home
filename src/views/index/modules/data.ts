import predecessor from '@/assets/images/predecessor.jpg'
import startImg from '@/assets/images/start.jpg'
import start from '@/assets/images/start.png'
import version1 from '@/assets/images/version1.webp'
import version2 from '@/assets/images/version2.webp'
export const historyList = [
  {
    time: Date.now(),
    desc: '未完待续',
  },
  {
    time: '2025-07-18',
    desc: '新增简历系统，快速制作属于自己的简历。',
  },
  {
    time: '2024-11-22',
    desc: '项目使用vue3 + vite + typescript 重构',
  },
  {
    time: '2023-07-18',
    desc: '上线修图',
  },
  {
    time: '2021-11-22',
    img: version2,
    desc: 'UI苹果化',
  },
  {
    time: '2020-11-22',
    img: version1,
    desc: '雪花起始页1.0正式上线',
  },
  {
    time: '2020-9-3',
    img: startImg,
    desc: '梦开始的地方，[nannan.work]站点启用，新的起始页上线~',
  },
  {
    time: '2016-8-16',
    desc: 'Peak Game最后一个版本，随着网易代理国服，服务器和起始页一并停运~',
    img: predecessor,
  },
  {
    time: '2015-5-10',
    desc: '用虚拟主机搭建的第一个起始页：Peak Game（展示我的世界服务器QA）',
    img: start,
  },
]
