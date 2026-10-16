import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 法律行业行政岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: {},
      data: {
        position: "行政",
        name: "贺文清",
        birthday: "1996.11",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
        sex: "男",
        city: "上海",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "上海****律师事务所",
            department: "综合管理部",
            post: "法务行政专员",
            city: "上海",
            startTime: "2022.07",
            endTime: "至今",
            tags: ["流程规范", "档案管理"],
            content:
              "<p>负责律所综合行政支持，统筹用印与合同归档、案卷借阅登记、律师执业证照年审材料准备以及客户接待与会务安排，年度支撑各类会议与培训 60 余场。</p><p>梳理合同与用印审批流程，建立电子台账与到期提醒机制，累计归档合同及案卷 2000 余份，资料检索时间缩短约 50%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "杭州****律师事务所",
            department: "行政人事部",
            post: "行政助理",
            city: "杭州",
            startTime: "2019.07",
            endTime: "2022.06",
            tags: ["制度建设", "会务支持"],
            content:
              "<p>承担日常行政事务，包含办公用品比价采购、会议室与差旅预订、访客接待及员工入离职手续办理，月均处理采购与行政付款单据约 40 笔。</p><p>协助完善行政制度与表单模板，统一用章登记、合同借阅与快递寄送台账，将常用事务的处理周期由 3 天压缩至 1 天。</p>",
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
            name: "律所合同档案电子化与用印流程规范项目",
            department: "综合管理部",
            post: "项目执行",
            city: "上海",
            startTime: "2023.03",
            endTime: "2023.11",
            tags: ["流程优化", "档案电子化"],
            content:
              "<p>配合行政主管完成在用合同与历史案卷的清点、编号与扫描归档，搭建按客户与案件类型分类的电子目录，覆盖档案 1500 余份。</p><p>推动用印申请由纸质审批改为线上流转，明确审批节点与留痕要求，平均审批时长由 2 天降至半天。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "年度合规培训与会务保障项目",
            department: "行政人事部",
            post: "会务负责人",
            city: "杭州",
            startTime: "2020.09",
            endTime: "2021.03",
            tags: ["会务统筹", "合规培训"],
            content:
              "<p>负责年度合规培训的会务统筹，含场地比选、供应商对接、议程编排与现场执行，累计组织培训 8 场、覆盖 200 余人次。</p><p>整理签到、问卷与费用台账，输出会务执行清单与模板，单场活动筹备时间减少约 30%。</p>",
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
            name: "华东政法大学",
            college: "政治学与公共管理学院",
            education: "本科",
            mode: "全日制",
            post: "行政管理",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修行政管理学、行政法与行政诉讼法、公文写作与档案管理，GPA 3.6/4.0。</p><p>担任学院办公室学生助理，负责通知拟稿、会议记录与档案整理。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"]},
      data: {
        content:
          "<p><strong>办公软件：</strong>熟练使用 Word 长文档排版与目录生成、Excel 数据透视表与函数统计、PowerPoint 汇报制作，能独立完成公文拟稿与文件比对。</p><p><strong>业务工具：</strong>熟悉 OA 协同办公系统、电子签章与合同管理系统、PDF 编辑与文档比对工具，掌握用印审批、合同归档、案卷借阅等行政台账的规范化管理。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"]},
      list: [
        { ui: {}, data: { name: "年度优秀员工" } },
        { ui: {}, data: { name: "档案规范化管理专项表彰" } },
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
  ui: structuredClone(getResumeThemeTemplate("fileIndex").item.ui),
};

export default resumeData;
