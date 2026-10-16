import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 互联网行业Android岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: {},
      data: {
        position: "Android",
        name: "范一鸣",
        birthday: "1997.02",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
        sex: "男",
        city: "深圳",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "深圳****科技有限公司",
            department: "移动客户端部",
            post: "Android 开发工程师",
            city: "深圳",
            startTime: "2019.07",
            endTime: "2022.05",
            tags: ["组件化改造", "性能优化"],
            content:
              "<p>负责社区类 App 的 Android 端业务开发与组件化改造，将首页、发布、消息等模块拆分为独立组件，编译耗时下降 45%，多团队并行开发冲突明显减少。</p><p>主导启动速度与内存治理，通过懒加载、线程收敛与图片缓存策略将冷启动时间从 2.1 秒降至 1.2 秒，低端机崩溃率下降 60%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "深圳****智能终端有限公司",
            department: "应用研发中心",
            post: "高级 Android 开发工程师",
            city: "深圳",
            startTime: "2022.05",
            endTime: "至今",
            tags: ["跨端框架", "稳定性建设"],
            content:
              "<p>负责智能家居控制 App 的架构设计，基于 Kotlin 与 Jetpack Compose 重构控制与设备发现链路，页面代码量减少 30%，配网成功率提升至 98%。</p><p>搭建客户端稳定性体系，接入崩溃、卡顿与 ANR 监控并推动闭环治理，线上崩溃率从 0.35% 降至 0.06%，应用商店评分由 3.8 提升至 4.6。</p>",
          },
        },
      ],
    },
    project: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "社区 App 组件化与启动治理",
            department: "移动客户端部",
            post: "核心开发",
            city: "深圳",
            startTime: "2020.09",
            endTime: "2021.08",
            tags: ["组件化", "启动优化"],
            content:
              "<p>设计路由与组件通信方案，完成 8 个业务组件的独立编译与按需集成，支撑三个业务团队同时迭代而互不影响。</p><p>梳理启动任务依赖并改为拓扑调度，配合首页预加载与广告页预请求，冷启动进入首页时间缩短约 900 毫秒。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "智能家居设备配网与控制链路重构",
            department: "应用研发中心",
            post: "技术负责人",
            city: "深圳",
            startTime: "2023.04",
            endTime: "2024.06",
            tags: ["Compose", "蓝牙配网"],
            content:
              "<p>重写蓝牙与软 AP 双通道配网流程，增加失败原因透传与一键重试引导，配网平均耗时从 65 秒降至 38 秒，客服相关工单下降 55%。</p><p>使用 Compose 重建设备控制面板，支持多设备批量控制与状态实时回传，页面帧率稳定在 58 帧以上。</p>",
          },
        },
      ],
    },
    education: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "广东工业大学",
            college: "计算机学院",
            education: "本科",
            mode: "全日制",
            post: "软件工程",
            city: "广州",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修移动应用开发、操作系统与数据库原理，熟练掌握 Java 与 Android 应用开发基础。</p><p>毕业设计完成基于蓝牙通信的室内定位原型应用，为后续设备连接类业务积累经验。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"]},
      data: {
        content:
          "<p><strong>客户端开发：</strong>精通 Kotlin 与 Java，熟悉 Jetpack Compose、Coroutines、Flow 与 MVVM 架构，掌握组件化路由、插件化与热修复方案，熟悉 NDK 与 JNI 基础开发。</p><p><strong>性能与工程：</strong>熟练使用 Systrace、Perfetto 与 LeakCanary 定位卡顿与内存泄漏，掌握 Gradle 构建优化、APK 瘦身与混淆配置，具备崩溃治理与灰度发布落地经验。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"]},
      list: [
        { ui: {}, data: { name: "年度客户端质量贡献奖" } },
        { ui: {}, data: { name: "配网体验优化专项表彰" } },
      ],
    },
  },
  config: {
    modules: [
      { key: "user" },
      { key: "work" },
      { key: "project" },
      { key: "education" },
      { key: "skill" },
      { key: "honor" },
    ],
  },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: structuredClone(getResumeThemeTemplate("blueAngleHeader").item.ui),
};

export default resumeData;
