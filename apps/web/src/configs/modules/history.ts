import startImg from "@/assets/images/start.jpg";
// import hostV1 from "@/assets/images/version/host-v1.png";
// import hostV2 from "@/assets/images/version/host-v2.png";
import homeV1 from "@/assets/images/version/home-v1.webp";
import homeV2 from "@/assets/images/version/home-v2.webp";
import indexV1 from "@/assets/images/version/index-v1.webp";
import imageV1 from "@/assets/images/version/image-v1.webp";
import resumeBeta from "@/assets/images/version/resume-beta.awebp";
import dayjs from "dayjs";
export const historyList = [
  {
    time: dayjs().format("YYYY-MM-DD"),
    desc: "未完待续",
  },
  {
    time: "2026-09-03",
    desc: "发布轻舟简历V1.0——以此简历 渡万重山",
    url: "/resume",
  },
  {
    time: "2026-08-05",
    desc: "升级全站技术架构 启用 Pnpm MonoRepo 管理方案",
  },
  {
    time: "2025-11-22",
    desc: "升级前端技术栈 至 Vue3 + Vite + TypeScript",
  },
  {
    time: "2024-11-22",
    // time:"2024-03-24"
    desc: "上线简历生成器Beta——快速制作属于自己的简历",
    url: "/resume",
  },
  {
    time: "2024-03-24",
    desc: "上线简历生成器Beta——快速制作属于自己的简历",
    url: "/resume",
    img: resumeBeta,
  },
  {
    time: "2023-11-22",
    desc: "发布图省事V1.0——快速处理图片格式与大小",
    url: "/image",
    img: imageV1,
  },
  {
    time: "2023-04-14",
    desc: "升级为雪花组件库",
  },
  {
    time: "2022-11-22",
    desc: "发布个人主页V1.0——逆转时空的公式就是珍惜现在",
    url: "/index",
    img: indexV1,
  },
  {
    time: "2021-11-22",
    desc: "发布雪花起始页V2.0",
    url: "/home",
    img: homeV2,
  },
  {
    time: "2020-11-22",
    desc: "发布雪花起始页V1.0——如雪纯净的浏览器起点",
    url: "/home",
    img: homeV1,
  },
  {
    time: "2020-9-3",
    img: startImg,
    desc: "梦开始的地方 新的起始页[nannan.work]启用~",
    url: "/home",
  },
  // {
  //   time: "2020-08-04",
  //   desc: "上线第二台虚拟机",
  //   img: hostV2,
  // },
  {
    time: "2016-8-16",
    desc: "前生的最后一个版本~",
  },
  {
    time: "2015-5-10",
    desc: "上线第一个起始页",
    // img: hostV1,
  },
];
