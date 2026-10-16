import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 广告行业平面设计岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: {},
      data: {
        position: "平面设计/美工",
        name: "沈知微",
        birthday: "1996.12",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.06",
        sex: "女",
        city: "广州",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "广州****品牌策划有限公司",
            department: "视觉设计部",
            post: "平面设计师",
            city: "广州",
            startTime: "2019.06",
            endTime: "2022.03",
            tags: ["品牌视觉", "物料输出"],
            content:
              "<p>负责快消与餐饮客户的品牌视觉物料设计，涵盖包装、海报、菜单与线下陈列，年均交付物料 300 余套，客户一次通过率保持在 80% 以上。</p><p>搭建常用物料模板库与出图规范，把常规海报的产出时间从两天压缩到半天，团队人均产能提升约 40%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "广州****文化传播有限公司",
            department: "创意设计中心",
            post: "资深平面设计师",
            city: "广州",
            startTime: "2022.03",
            endTime: "至今",
            tags: ["整合营销", "视觉规范"],
            content:
              "<p>负责整合营销项目的主视觉与延展设计，统筹线上投放图、线下物料与社媒版本的一致性，单项目物料复用率提升 50%。</p><p>主导品牌视觉规范手册编写与内部培训，统一色彩、字体与图形使用规则，新入职设计师的上手周期缩短一半。</p>",
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
            name: "新茶饮品牌年度视觉升级",
            department: "视觉设计部",
            post: "主创设计",
            city: "广州",
            startTime: "2020.09",
            endTime: "2021.11",
            tags: ["品牌升级", "包装设计"],
            content:
              "<p>完成 logo 优化、包装体系与门店视觉的成套升级，输出 12 个 sku 的包装设计与 40 余款延展物料。</p><p>升级后品牌在社媒的自发曝光增长明显，客户次年续约并将视觉规范推广至全国门店。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "连锁餐饮节日整合营销设计",
            department: "创意设计中心",
            post: "设计负责人",
            city: "广州",
            startTime: "2023.04",
            endTime: "2024.05",
            tags: ["主视觉", "全渠道延展"],
            content:
              "<p>统筹春节与暑期两档大促的主视觉及全渠道延展，覆盖外卖平台banner、门店灯箱、社媒九宫格与短视频封面共 60 余个尺寸。</p><p>统一视觉后品牌识别度调研得分提升 22%，活动期间门店客诉中关于物料不一致的反馈归零。</p>",
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
            name: "广州美术学院",
            college: "视觉艺术设计学院",
            education: "本科",
            mode: "全日制",
            post: "视觉传达设计",
            city: "广州",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修品牌设计、版式设计与包装设计，系统掌握色彩构成、字体设计与印刷工艺知识。</p><p>毕业设计完成一套地方特产的品牌形象与包装设计，并入选学院年度优秀作品展。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"]},
      data: {
        content:
          "<p><strong>设计软件：</strong>精通 Photoshop、Illustrator 与 InDesign，熟练使用 Figma 输出线上物料，掌握基础动效与轻视频剪辑，能独立完成从创意到完稿出片的全流程。</p><p><strong>专业能力：</strong>熟悉品牌视觉规范、包装结构、印刷工艺与材质选择，具备手绘草图与图形原创能力，能与策划、文案及供应商顺畅对接落地细节。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"]},
      list: [
        { ui: {}, data: { name: "年度最佳视觉创意奖" } },
        { ui: {}, data: { name: "客户满意度之星" } },
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
  ui: structuredClone(getResumeThemeTemplate("popCollage").item.ui),
};

export default resumeData;
