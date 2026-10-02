import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 汽车行业测试岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "测试",
        name: "蒋维",
        birthday: "1996.05",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2020.07",
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
            department: "智能驾驶测试部",
            post: "测试工程师",
            city: "上海",
            startTime: "2023.03",
            endTime: "至今",
            tags: ["域控制器", "自动化测试"],
            content:
              "<p>负责智能座舱域控制器的功能与性能测试，依据需求规范拆解测试项，使用 CANoe 搭建台架环境并编写 CAPL 自动化脚本，覆盖总线报文、诊断服务与 OTA 升级场景。</p><p>主导 HIL 台架回归用例建设，累计沉淀用例 800 余条，单轮回归耗时由 3 天压缩至 6 小时，版本迭代缺陷逃逸率下降 35%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****汽车电子有限公司",
            department: "整车电子测试科",
            post: "测试工程师",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.02",
            tags: ["总线测试", "实车标定"],
            content:
              "<p>承担车身电子与网关控制器的网络通信测试，执行 CAN/LIN 总线一致性验证、网络管理唤醒休眠测试与 UDS 诊断测试，输出测试报告并跟踪 Bug 闭环。</p><p>参与整车下线电检工位测试方案落地，优化诊断序列与阈值配置，下线误报率下降 40%，单台电检节拍缩短 20 秒。</p>",
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
            name: "智能座舱域控制器 HIL 自动化测试平台",
            department: "智能驾驶测试部",
            post: "测试负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2025.01",
            tags: ["HIL", "持续集成"],
            content:
              "<p>基于 dSPACE 与 CANoe 搭建半实物仿真环境，使用 Python 串联用例管理、脚本执行与报告生成，接入 Jenkins 实现每日夜间自动回归。</p><p>平台上线后累计执行自动化用例 1.2 万次，自动捕获有效缺陷 60 余个，回归测试人力投入减少约 50%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "整车网关 OTA 升级验证",
            department: "整车电子测试科",
            post: "测试工程师",
            city: "上海",
            startTime: "2021.09",
            endTime: "2022.06",
            tags: ["OTA", "诊断测试"],
            content:
              "<p>设计 OTA 升级全流程测试方案，覆盖断点续传、断电恢复、低电量限制与版本回滚等异常场景，并验证刷写前后诊断故障码与配置字一致性。</p><p>累计完成 200 余次实车升级验证，定位升级失败问题 12 项，支撑项目按节点完成首版 OTA 量产发布。</p>",
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
            college: "汽车学院",
            education: "本科",
            mode: "全日制",
            post: "车辆工程",
            city: "上海",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修汽车构造、汽车电子技术、车载总线与嵌入式系统，掌握 CANoe、MATLAB/Simulink 等课程实践工具。</p><p>毕业设计围绕车载 CAN 总线通信测试，搭建台架完成报文周期与错误帧验证。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>测试工具：</strong>熟练使用 CANoe、CANalyzer、Vehicle Spy 与诊断工具链，掌握 CAPL、Python 脚本开发，熟悉 DBC/LDF 数据库解析与 ARXML 文件配置。</p><p><strong>技术栈：</strong>熟悉 CAN/CANFD、LIN、以太网 SOME/IP 等车载总线协议，掌握 UDS 诊断、网络管理与 OTA 刷写流程，了解 ISO 26262 功能安全与 ASPICE 测试流程，能搭建 HIL 台架并接入 Jenkins 持续集成。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>问题定位：</strong>具备从现象到根因的排查能力，能结合总线报文、诊断日志与台架复现快速界定问题边界，推动软硬件团队协同闭环。</p><p><strong>工程沉淀：</strong>习惯将重复验证工作脚本化、平台化，重视用例可维护性与测试数据可追溯，能在项目节点压力下保障交付质量。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "公司年度测试质量标兵" } },
        { ui: {}, data: { name: "智能网联汽车测试技术优秀实践奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/automotive-test" } },
        { ui: {}, data: { name: "技术博客", url: "https://example.com/can-bus-test-blog" } },
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
  ui: structuredClone(getResumeThemeTemplate("squareTimeline").item.ui),
};

export default resumeData;
