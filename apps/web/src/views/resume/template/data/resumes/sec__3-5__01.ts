import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 互联网行业网络安全岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: {},
      data: {
        position: "网络安全",
        name: "秦九安",
        birthday: "1996.04",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.08",
        sex: "男",
        city: "成都",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "成都****网络科技有限公司",
            department: "安全应急中心",
            post: "安全工程师",
            city: "成都",
            startTime: "2019.08",
            endTime: "2022.06",
            tags: ["渗透测试", "漏洞治理"],
            content:
              "<p>负责业务系统的上线前安全测试与漏洞闭环，累计发现并推动修复高危及以上漏洞 120 余个，上线前高危漏洞拦截率保持在 95% 以上。</p><p>搭建自动化漏洞扫描与复测流程，把常规业务的安全测试周期从 5 天压缩到 1 天，回归人力投入下降六成。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "成都****数字安全有限公司",
            department: "安全运营部",
            post: "高级安全工程师",
            city: "成都",
            startTime: "2022.06",
            endTime: "至今",
            tags: ["应急响应", "零信任建设"],
            content:
              "<p>负责安全监测与应急响应体系建设，主导告警规则治理与 SOAR 自动化编排，日均告警量从 3000 余条降至 200 条以内，真实事件漏报率下降 70%。</p><p>推动零信任访问与堡垒机落地，收敛对外暴露面与运维权限，外部攻击面资产减少 65%，全年未发生数据泄露事件。</p>",
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
            name: "上线前安全测试自动化平台",
            department: "安全应急中心",
            post: "项目负责人",
            city: "成都",
            startTime: "2020.10",
            endTime: "2021.12",
            tags: ["自动化扫描", "漏洞闭环"],
            content:
              "<p>整合主机扫描、依赖成分分析与交互式安全测试工具，实现代码提交即触发扫描并自动分派到责任人。</p><p>平台运行一年累计拦截可利用漏洞 400 余个，安全测试不再成为发布瓶颈，平均交付周期缩短 4 天。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "安全运营与应急响应体系升级",
            department: "安全运营部",
            post: "技术负责人",
            city: "成都",
            startTime: "2023.03",
            endTime: "2024.09",
            tags: ["告警治理", "零信任"],
            content:
              "<p>重构告警分级与关联规则，引入攻击链视角的研判流程，并沉淀 30 余个自动化处置剧本，平均响应时长从 40 分钟降至 8 分钟。</p><p>完成办公与研发网络的零信任改造，统一身份认证与最小权限下发，横向移动风险显著收敛，通过年度第三方渗透与合规审计。</p>",
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
            name: "电子科技大学",
            college: "信息与软件工程学院",
            education: "本科",
            mode: "全日制",
            post: "信息安全",
            city: "成都",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修密码学、网络安全、操作系统安全与软件安全，系统掌握常见攻防原理与防护手段。</p><p>毕业设计完成基于流量特征的异常访问检测原型，并在校内靶场完成验证。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"]},
      data: {
        content:
          "<p><strong>安全测试：</strong>熟悉 Web 与移动端常见漏洞原理与利用方式，熟练使用 Burp Suite、SQLMap、Metasploit 等工具开展渗透测试，掌握代码审计与依赖成分分析方法。</p><p><strong>安全运营：</strong>熟悉 SIEM、EDR 与 SOAR 平台建设，掌握告警规则调优、攻击链研判与应急溯源流程，熟悉零信任、身份权限治理与等级保护合规要求，持有 CISP 证书。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"]},
      list: [
        { ui: {}, data: { name: "年度安全守护奖" } },
        { ui: {}, data: { name: "重大应急事件处置表彰" } },
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
  ui: structuredClone(getResumeThemeTemplate("neonCircuit").item.ui),
};

export default resumeData;
