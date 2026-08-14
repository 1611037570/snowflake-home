import { getBaseUrl } from "@/utils/modules/url";
export const DEV_ACCOUNT = [
  {
    name: "稀土掘金",
    url: "https://juejin.cn/user/2342386827791687/posts",
    icon: "simple-icons:juejin",
    qrcode: true,
    type: "dev",
  },
  {
    name: "gitHub",
    url: "https://github.com/1611037570",
    icon: "simple-icons:github",
    qrcode: false,
    type: "dev",
  },
  {
    name: "我的简历",
    url: getBaseUrl() + "/resume?id=1611037570",
    icon: "basil:file-user-solid",
    qrcode: false,
    type: "dev",
  },
  {
    name: "我的邮箱",
    url: "mailto:1611037570@qq.com",
    icon: "clarity:email-solid",
    qrcode: false,
    type: "dev",
  },
];
export const SHOOT_ACCOUNT = [
  {
    name: "抖音",
    url: "https://www.douyin.com/user/MS4wLjABAAAA2ZiMi4shkb1NyOFV-2DhkMCEUirye08iiO5tO1gq6a5RHwszFi_OdZ_ssU0B3N-u",
    icon: "logos:tiktok-icon",
    qrcode: true,
    type: "shoot",
  },
  {
    name: "小红书",
    url: "https://www.xiaohongshu.com/user/profile/6772591e00000000180175f9",
    icon: "simple-icons:xiaohongshu",
    qrcode: true,
    type: "shoot",
  },
];
