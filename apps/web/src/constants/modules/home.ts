/**
 * 首页快捷方式列表
 */

// 从types目录导入ShortcutItem接口
import type { ShortcutItem } from "@/types/shortcut";

export const default_data: ShortcutItem = {
  name: "",
  url: "",
  imgType: "img",
  imgValue: "",
  id: "",
  pinyin: "",
  top: false,
};
export const default_list: ShortcutItem[] = [
  {
    name: "腾讯文档",
    url: "https://docs.qq.com/desktop",
    id: "95cfacc7-cf00-4da5-b4e5-54d01443fb18",
    imgType: "img",
    imgValue: "https://docs.gtimg.com/desktop/favicon2.ico",
    pinyin: "tengxunwendang",
    top: false,
  },
  {
    name: "京东",
    url: "https://www.jd.com/",
    imgType: "img",
    imgValue: "https://www.jd.com/favicon.ico",
    id: "e2508355-4f69-44f7-b3e0-cbad644d2d2a",
    pinyin: "jingdong",
    top: false,
  },
  {
    name: "百度贴吧",
    url: "https://tieba.baidu.com/",
    id: "445fb6a9-62c3-482a-9cd0-fb61936d9f20",
    imgType: "img",
    imgValue: "https://tieba.baidu.com/favicon.ico",
    pinyin: "baidutieba",
    top: false,
  },
  {
    name: "哔哩哔哩",
    url: "https://www.bilibili.com/",
    imgType: "img",
    imgValue: "https://www.bilibili.com/favicon.ico",
    id: "42592727-2133-4b33-a5fd-8b3355ec8654",
    pinyin: "bilibili",
    top: false,
  },
  {
    name: "腾讯视频",
    url: "https://v.qq.com/",
    imgType: "img",
    imgValue: "https://v.qq.com/favicon.ico",
    id: "28d6de41-b69d-4f75-bda6-01b7f8ea3a1c",
    pinyin: "tengxunshipin",
    top: true,
  },
  {
    name: "element-plus",
    url: "https://element-plus.org/zh-CN/component/overview.html",
    id: "5e7acbc7-c588-4d0b-bd43-a4593487b09c",
    imgType: "icon",
    imgValue: "logos:element",
    pinyin: "element-plus",
    top: false,
  },
  {
    name: "deepseek",
    url: "https://chat.deepseek.com/",
    pinyin: "deepseek",
    top: false,
  },
];

export const DEFAULT_WEB_SOURCE = ref([
  {
    type: "百度",
    url: "https://www.baidu.com/s?ie=utf-8&word=%s",
    icon: "https://www.baidu.com/favicon.ico",
  },
  {
    type: "必应",
    url: "https://cn.bing.com/useSearchStore?form=QBLH&q=%s",
    icon: "https://cn.bing.com/favicon.ico",
  },
  {
    type: "谷歌",
    url: "https://www.google.com/useSearchStore?q=%s",
    icon: "https://www.google.com/favicon.ico",
  },
  {
    type: "搜狗",
    url: "https://www.sogou.com/web?query=%s",
    icon: "https://www.sogou.com/favicon.ico",
  },
]);
// 应用搜索源
export const DEFAULT_APP_SOURCE = [
  {
    type: "百度翻译",
    url: "https://fanyi.baidu.com/mtpe-individual/transText?query=%s&lang=en2zh#/",
  },
  {
    type: "文心一言",
    url: "https://chat.baidu.com/search?word=%s",
  },

  {
    type: "小红书",
    url: "https://www.xiaohongshu.com/search_result?keyword=%s",
  },
  {
    type: "抖音",
    url: "https://www.douyin.com/search/%s&type=general",
  },
  {
    type: "微博",
    url: "https://s.weibo.com/weibo?q=%s",
  },
  {
    type: "哔哩哔哩",
    url: "https://search.bilibili.com/all?keyword=%s&search_source=1",
  },
  {
    type: "github",
    url: "https://github.com/search?q=%s&type=repositories",
  },
  {
    type: "稀土掘金",
    url: "https://juejin.cn/search?query=%s",
  },
];
