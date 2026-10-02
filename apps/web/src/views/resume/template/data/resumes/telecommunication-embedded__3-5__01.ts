import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 通信行业嵌入式岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "嵌入式",
        name: "苏明远",
        birthday: "1996.05",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2021.07",
        sex: "男",
        city: "上海",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****智能科技有限公司",
            department: "无线终端研发部",
            post: "高级嵌入式软件工程师",
            city: "上海",
            startTime: "2023.07",
            endTime: "至今",
            tags: ["驱动开发", "量产交付"],
            content:
              "<p>负责 5G RedCap 工业网关的嵌入式系统设计，基于 Linux 与 Yocto 构建固件，完成以太网、RS485 与 CAN 总线驱动开发，适配 Modbus、MQTT 与 OPC UA 工业协议并对接边缘计算应用。</p><p>牵头量产版本稳定性攻坚，联合硬件与测试团队完成 EMC 与高低温老化验证，批量故障率由 2.1% 降至 0.4%，支撑 10 万台设备规模交付。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****通信技术有限公司",
            department: "无线模组研发部",
            post: "嵌入式软件工程师",
            city: "上海",
            startTime: "2021.07",
            endTime: "2023.06",
            tags: ["协议栈", "低功耗优化"],
            content:
              "<p>负责 NB-IoT 与 Cat.1 无线通信模组的嵌入式软件开发，基于 RTOS 完成协议栈对接、AT 指令集实现与低功耗模式调优，支撑智能表计与资产追踪终端量产。</p><p>主导模组功耗优化专项，重构休眠唤醒时序并收敛射频收发窗口，终端待机电流由 8μA 降至 3.5μA，电池使用寿命延长约 40%。</p>",
          },
        },
      ],
    },
    project: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "5G RedCap 工业网关固件平台",
            department: "无线终端研发部",
            post: "嵌入式软件负责人",
            city: "上海",
            startTime: "2024.05",
            endTime: "2025.03",
            tags: ["工业网关", "边缘计算"],
            content:
              "<p>牵头网关固件架构设计与协议栈参数调优，完成 URLLC 场景时延压测，空口往返时延稳定在 20ms 以内，满足工业控制数据回传要求。</p><p>搭建 OTA 差分升级通道与安全启动链路，升级成功率 99.8%，单次升级流量下降约 70%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "NB-IoT 智能表计通信模组开发",
            department: "无线模组研发部",
            post: "嵌入式软件工程师",
            city: "上海",
            startTime: "2022.03",
            endTime: "2022.11",
            tags: ["智能表计", "入网调优"],
            content:
              "<p>负责模组侧 PSM 与 eDRX 参数配置及心跳策略调优，配合运营商完成入网、小区重选与弱覆盖场景验证，注册成功率由 92% 提升至 98.5%。</p><p>完成 AT 指令与固件升级接口开发，累计交付 3 家表计客户，模组平均无故障运行时间超过 12 个月。</p>",
          },
        },
      ],
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海**大学",
            college: "通信与信息工程学院",
            education: "本科",
            mode: "全日制",
            post: "通信工程",
            city: "上海",
            startTime: "2017.09",
            endTime: "2021.06",
            content:
              "<p>主修通信原理、数字信号处理、嵌入式系统设计与无线通信技术，熟悉 C 语言与单片机课程实践。</p><p>毕业设计基于 LoRa 模块完成无线传感数据采集与网关上传原型。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>嵌入式开发：</strong>熟练使用 C/C++ 完成 MCU 与 Linux 平台开发，掌握 STM32、GD32、ESP32 等芯片的驱动移植，熟悉 FreeRTOS、RT-Thread 以及 Linux 内核裁剪、设备树配置与 Yocto 构建。</p><p><strong>通信与调试：</strong>熟悉 5G NR/LTE、NB-IoT、Cat.1 与 LoRa 等无线通信协议，掌握 TCP/IP、MQTT、Modbus、CAN 及 UART/SPI/I2C 总线调试，能使用示波器、频谱仪、CMW500 综测仪与 J-Link 定位问题。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>软硬件协同：</strong>具备从原理图评审、驱动调试到系统联调的完整经验，能结合射频指标与功耗测试数据定位跨软硬件问题，减少反复返工。</p><p><strong>量产交付：</strong>熟悉通信终端从样机验证、认证测试到批量生产的全过程，重视固件可维护性与版本可追溯，能在项目节点压力下保障稳定交付。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "公司年度技术攻关奖" } },
        { ui: {}, data: { name: "物联网终端创新实践奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: { name: "GitHub", url: "https://example.com/embedded-stack" },
        },
        {
          ui: {},
          data: { name: "技术博客", url: "https://example.com/embedded-blog" },
        },
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
      { key: "advantage" },
      { key: "honor" },
      { key: "account" },
    ],
  },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: structuredClone(getResumeThemeTemplate("navyGuide").item.ui),
};

export default resumeData;
