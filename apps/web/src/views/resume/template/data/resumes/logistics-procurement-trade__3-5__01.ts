import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 仓储/物流行业采购贸易岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "采购贸易",
        name: "程海波",
        birthday: "1997.05",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
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
            name: "上海****供应链管理有限公司",
            department: "采购部",
            post: "采购专员",
            city: "上海",
            startTime: "2019.07",
            endTime: "2023.02",
            tags: ["供应商管理", "交期管控"],
            content:
              "<p>负责快消类物料的采购执行，覆盖需求计划、询价比价、下单跟单与到货验收全流程，月均处理采购订单 200 余笔。</p><p>整合供应商资源并集中议价，核心包材采购单价下降 8%，年度采购降本约 120 万元。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****物流科技有限公司",
            department: "供应链采购中心",
            post: "采购主管",
            city: "上海",
            startTime: "2023.03",
            endTime: "至今",
            tags: ["降本增效", "库存周转"],
            content:
              "<p>负责仓储耗材、叉车配件与运输服务类采购，主导供应商开发、季度考核与年度框架协议谈判，管理 60 余家供应商。</p><p>推行 ABC 分类与安全库存联动机制，关键物料缺货率由 4.5% 降至 1.2%，库存周转天数缩短 9 天。</p>",
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
            name: "仓储耗材集中采购降本专项",
            department: "供应链采购中心",
            post: "项目负责人",
            city: "上海",
            startTime: "2024.05",
            endTime: "2024.12",
            tags: ["降本增效", "流程优化"],
            content:
              "<p>梳理全国 8 个仓的耗材需求，统一物料规格与招标口径，引入备选供应商形成常态化比价机制。</p><p>项目落地后采购综合成本下降 11%，对账与结算周期由 30 天压缩至 15 天。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "跨境进口物资采购交付优化",
            department: "供应链采购中心",
            post: "采购负责人",
            city: "上海",
            startTime: "2025.03",
            endTime: "2025.09",
            tags: ["跨境采购", "交付保障"],
            content:
              "<p>负责进口设备的询价、报关报检与物流衔接，协同货代与仓储完成 CIF 条款下的清关与入库。</p><p>优化订舱与到港预约流程，平均交付周期缩短 12 天，到货准时率提升至 96%。</p>",
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
            name: "上海海事大学",
            college: "经济管理学院",
            education: "本科",
            mode: "全日制",
            post: "物流管理",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修采购管理、仓储与配送、国际贸易实务与供应链数据分析。</p><p>毕业设计围绕区域配送中心库存优化展开，获评院级优秀毕业论文。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>采购与贸易：</strong>熟悉供应商开发与考核、询比价、招投标、合同与账期管理，掌握 FOB、CIF 等贸易条款及报关报检流程。</p><p><strong>工具与数据：</strong>熟练使用 SAP MM、用友 U8、金蝶 K3 与 WMS 系统，能通过 Excel 数据透视表、VLOOKUP 与 Power BI 完成采购及库存分析。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备仓储物流场景下的采购成本意识，能够结合物料规格、库存周转与交付风险制定采购策略。</p><p>沟通协调能力强，擅长推动仓储、运输、财务与供应商多方协同并完成问题闭环。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀采购个人" } },
        { ui: {}, data: { name: "供应链降本专项奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "个人作品集", url: "https://example.com/procurement-portfolio" } },
        { ui: {}, data: { name: "领英", url: "https://example.com/in/procurement" } },
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
  ui: structuredClone(getResumeThemeTemplate("stripedRibbon").item.ui),
};

export default resumeData;
