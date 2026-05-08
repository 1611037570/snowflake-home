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
    time: '2025-11-22',
    desc: '使用vue3 + vite + typescript 全面重构。',
  },
  {
    time: '2024-11-22',
    desc: '新增简历生成器，快速制作属于自己的简历。',
  },
  {
    time: '2023-11-22',
    desc: '新增图片处理工具',
  },
  {
    time: '2022-11-22',
    desc: '个人主页上线',
  },
  {
    time: '2021-11-22',
    img: version2,
    desc: '雪花起始页2.0上线',
  },
  {
    time: '2020-11-22',
    img: version1,
    desc: '雪花起始页1.0正式发布',
  },
  {
    time: '2020-9-3',
    img: startImg,
    desc: '梦开始的地方，[nannan.work]站点启用，新的起始页上线~',
  },
  {
    time: '2016-8-16',
    desc: '前生的最后一个版本~',
    img: predecessor,
  },
  {
    time: '2015-5-10',
    desc: '通过虚拟主机搭建第一个起始页',
    img: start,
  },
]
