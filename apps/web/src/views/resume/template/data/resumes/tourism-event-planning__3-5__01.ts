import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 旅游/酒店行业会展策划岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "会展策划",
        name: "白露",
        birthday: "1997.05",
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
            department: "会展策划部",
            post: "会展策划主管",
            city: "上海",
            startTime: "2023.07",
            endTime: "至今",
            tags: ["团队管理", "全案负责"],
            content:
              "<p>统筹酒店集团与文旅目的地的年度展会计划，负责展位规划、动线设计、展陈搭建与现场运营，全年完成 12 场行业展会与路演活动，单场平均到场专业观众 3000 人次，展位有效留资转化率稳定在 18% 以上。</p><p>建立供应商名录与询比价流程，推动搭建、物料与差旅成本集中采购，年度会展预算执行偏差控制在 5% 以内。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****会务服务有限公司",
            department: "活动策划部",
            post: "会展策划专员",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.06",
            tags: ["会议执行", "招商招展"],
            content:
              "<p>参与酒店行业峰会、目的地推介会与商旅采购对接会的全程执行，完成议程排期、嘉宾邀约、场地布置与现场调度，累计执行 30 余场会议活动。</p><p>负责招商招展与赞助方案落地，单届峰会签约展商 60 余家，赞助收入较上一届提升 25%。</p>",
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
            name: "国际酒店用品与智慧酒店博览会",
            department: "会展策划部",
            post: "项目负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2024.09",
            tags: ["展会主案", "招商招展"],
            content:
              "<p>负责 8000 平方米展区的招展招商、展位划分与主题展区策划，落地智慧客房、绿色餐饮与酒店供应链三大特色板块，最终签约展商 180 家，展位售出率 96%。</p><p>策划同期论坛与采购对接会，促成意向订单金额超 2000 万元，观众满意度评分 4.6 分（满分 5 分）。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "滨海度假目的地文旅推介会",
            department: "会展策划部",
            post: "策划负责人",
            city: "上海",
            startTime: "2023.09",
            endTime: "2024.01",
            tags: ["目的地营销", "路演执行"],
            content:
              "<p>围绕度假酒店与景区资源策划城市路演方案，负责主题创意、舞台流程、体验区布置与媒体邀约，联动 20 家酒店与旅行社完成资源打包。</p><p>活动期间达成渠道签约 40 余家，目的地度假产品预订量环比增长 32%。</p>",
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
            name: "上海****大学",
            college: "旅游学院",
            education: "本科",
            mode: "全日制",
            post: "会展经济与管理",
            city: "上海",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修会展策划与管理、旅游市场营销、酒店运营管理、大型活动项目管理与商务谈判。</p><p>在校期间参与校园旅游文化节组委会，负责展区规划与赞助招商，具备完整的活动落地经验。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>策划与执行：</strong>熟悉会展全案流程，能够独立完成主题创意、展区动线规划、议程排期、招商招展方案与现场执行手册，掌握展会预算编制与供应商管理。</p><p><strong>工具与技术栈：</strong>熟练使用 AutoCAD 绘制展位与动线平面图，使用 SketchUp、3ds Max 与 Photoshop 完成展陈效果图与视觉物料，使用 Excel 数据透视表与 CRM 会展管理系统完成招商数据复盘与客户跟进。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>深耕旅游与酒店行业会展场景，熟悉酒店集团、OTA 平台、景区与商旅客户的合作诉求，能够把目的地资源转化为可售卖的展会产品与推介内容。</p><p>具备较强的资源整合与现场应变能力，善于统筹搭建、会务、安保与媒体多方供应商，在预算与工期压力下保障活动品质与交付节点。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度最佳会展策划奖" } },
        { ui: {}, data: { name: "优秀招商招展团队奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "个人作品集", url: "https://example.com/event-planning-portfolio" } },
        { ui: {}, data: { name: "会展项目复盘", url: "https://example.com/expo-review" } },
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
  ui: structuredClone(getResumeThemeTemplate("chevronRibbon").item.ui),
};

export default resumeData;
