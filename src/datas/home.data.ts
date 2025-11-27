// 从types目录导入ShortcutItem接口
import type { ShortcutItem } from '@/types/shortcut'

export const default_data: ShortcutItem = {
  name: '',
  url: '',
  imgType: 'img',
  imgValue: '',
  id: '',
  pinyin: '',
  top: false,
}
export const default_list: ShortcutItem[] = [
  {
    name: '腾讯文档',
    url: 'https://docs.qq.com/desktop',
    id: '95cfacc7-cf00-4da5-b4e5-54d01443fb18',
    imgType: 'img',
    imgValue: 'https://docs.gtimg.com/desktop/favicon2.ico',
    pinyin: 'tengxunwendang',
    top: false,
  },
  {
    name: '京东',
    url: 'https://www.jd.com/',
    imgType: 'img',
    imgValue: 'https://www.jd.com/favicon.ico',
    id: 'e2508355-4f69-44f7-b3e0-cbad644d2d2a',
    pinyin: 'jingdong',
    top: false,
  },
  {
    name: '百度贴吧',
    url: 'https://tieba.baidu.com/',
    id: '445fb6a9-62c3-482a-9cd0-fb61936d9f20',
    imgType: 'img',
    imgValue: 'https://tieba.baidu.com/favicon.ico',
    pinyin: 'baidutieba',
    top: false,
  },
  {
    name: '哔哩哔哩',
    url: 'https://www.bilibili.com/',
    imgType: 'img',
    imgValue: 'https://www.bilibili.com/favicon.ico',
    id: '42592727-2133-4b33-a5fd-8b3355ec8654',
    pinyin: 'bilibili',
    top: false,
  },
  {
    name: '腾讯视频',
    url: 'https://v.qq.com/',
    imgType: 'img',
    imgValue: 'https://v.qq.com/favicon.ico',
    id: '28d6de41-b69d-4f75-bda6-01b7f8ea3a1c',
    pinyin: 'tengxunshipin',
    top: false,
  },
  {
    name: 'element-plus',
    url: 'https://element-plus.org/zh-CN/component/overview.html',
    id: '5e7acbc7-c588-4d0b-bd43-a4593487b09c',
    imgType: 'icon',
    imgValue: 'logos:element',
    pinyin: 'element-plus',
    top: false,
  },
]
