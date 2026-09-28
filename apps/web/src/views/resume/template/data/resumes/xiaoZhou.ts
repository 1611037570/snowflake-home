import dayjs from "dayjs";
import { xiaozhou } from "../avatar";

// 小舟默认数据
const defaultData: any = {
  data: {
    user: {
      ui: {
        archived: false,
        title: "个人信息",
        collapsed: [],
        hidden: false,
        avatar: {
          hidden: false,
        },
        name: {
          hidden: false,
        },
        moreCollapsed: [],
        birthday: {
          hidden: false,
          icon: "personal-birthday",
          display: "age",
        },
        sex: {
          hidden: false,
          icon: "personal-account",
        },
        position: {
          hidden: false,
          icon: "work-briefcase",
        },
        workTime: {
          hidden: false,
          icon: "work-time",
        },
        phone: {
          hidden: false,
          icon: "contact-phone",
        },
        email: {
          hidden: false,
          icon: "contact-email",
        },
        subtitleOrder: ["sex", "birthday", "position"],
        mbti: {
          hidden: false,
          icon: "skill-brain",
        },
      },
      data: {
        position: "独立开发者",
        name: "小舟",
        birthday: "2000-07",
        phone: "158****2637",
        email: "161****570@qq.com",
        workTime: "2022.08.01",
        sex: "女",
        avatar: xiaozhou,
        mbti: "",
      },
    },
    account: {
      ui: {
        collapsed: [],
        archived: false,
        title: "社交账号",
        hidden: false,
      },
      list: [
        {
          ui: {
            hidden: false,
          },
          data: {
            name: "抖音",
            url: "https://www.douyin.com/user/MS4wLjABAAAAre0YOu4w-m9z260-GU-cTZbAl0yDgtZEFeoY1YSBdG6l5l9jWyo2APQBtfU6Ln38",
          },
        },
        {
          ui: {
            hidden: false,
          },
          data: {
            name: "小红书",
            url: "https://xhslink.cn/o/5x9OVDfiAfc",
          },
        },
        {
          ui: {
            hidden: false,
          },
          data: {
            name: "bilibili",
            url: "https://space.bilibili.com/272381122",
          },
        },
        {
          ui: {
            hidden: false,
          },
          data: {
            name: "github",
            url: "https://github.com/1611037570",
          },
        },
        {
          ui: {
            hidden: false,
          },
          data: {
            name: "稀土掘金",
            url: "https://juejin.cn/user/2342386827791687/posts",
          },
        },
      ],
    },
    skill: {
      ui: {
        collapsed: [],
        archived: false,
        title: "专业技能",
        hidden: true,
      },
      data: {
        content: "<p>熟悉前端开发与简历编辑器全链路研发，能够完成业务功能开发、接口联调和持续迭代。</p><p>掌握常用前端框架与协作工具，注重代码质量和用户体验。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content: "<p>具备独立推进产品研发与交付的能力，能够协调需求梳理、技术实现和上线维护等环节。</p><p>重视用户体验与团队协作，做事认真负责，能够持续复盘并改进工作流程。</p>",
      },
    },
    education: {
      ui: {
        collapsed: [],
        archived: false,
        title: "教育经历",
        hidden: false,
      },
      list: [
        {
          ui: {
            collapsed: ["1"],
            hidden: false,
          },
          data: {
            name: "广西科技大学",
            education: "本科",
            post: "计算机科学与技术",
            content: "<p>计算机科学与技术专业，系统学习计算机与软件开发相关课程。</p>",
            mode: "全日制",
            tags: ["GPA 3.9/4.0", "非985", "非211"],
            college: "",
            startTime: "2019.09",
            endTime: "2023.06",
            city: "柳州市",
          },
        },
      ],
    },
    project: {
      ui: {
        collapsed: ["1"],
        archived: false,
        title: "项目经历",
        hidden: false,
      },
      list: [
        {
          ui: {
            collapsed: [],
            hidden: false,
          },
          data: {
            name: "**轻舟简历",
            post: "软件工程师",
            startTime: "2024.02",
            endTime: "至今",
            content: "<p>负责简历编辑器全链路研发</p>",
            link: {
              name: "",
              url: "",
            },
            tags: ["已上线", "开源项目", "独立负责"],
            department: "研发部",
            city: "深圳市",
          },
        },
        {
          ui: {
            collapsed: [],
            hidden: false,
          },
          data: {
            name: "轻舟简历AI助手",
            link: {},
            tags: ["Agent", "LLM", "React"],
            department: "人工智能部",
            startTime: "2024.02",
            endTime: "至今",
            post: "AI助手",
            city: "深圳市",
            content: "<p>负责AI助手模块全链路研发</p>",
          },
        },
      ],
    },
    work: {
      ui: {
        title: "工作经历",
        collapsed: ["1"],
        hidden: false,
      },
      list: [
        {
          ui: {
            collapsed: ["1"],
            hidden: false,
          },
          data: {
            name: "轻舟科技有限公司",
            tags: ["独立负责", "从0到1"],
            department: "",
            startTime: "2024.02",
            endTime: "至今",
            post: "项目负责人",
            city: "深圳市",
            content: "<p>负责轻舟简历从0到1全链路研发</p>",
          },
        },
      ],
    },
  },
  config: {
    meta: {
      version: "1.0.0",
    },
    drag: true,
    dragClass: ".container-drag",
    fields: [
      {
        key: "user",
        fields: [
          {
            key: "avatar",
          },
          {
            key: "name",
          },
          {
            key: "subtitle",
            fields: [
              {
                key: "sex",
              },
              {
                key: "birthday",
              },
              {
                key: "position",
              },
            ],
          },
          {
            key: "more",
            fields: [
              {
                key: "marital",
              },
              {
                key: "nation",
              },
              {
                key: "zodiac",
              },
              {
                key: "wechat",
              },
              {
                key: "github",
              },
              {
                key: "linkedin",
              },
              {
                key: "status",
              },
              {
                key: "arrivalTime",
              },
              {
                key: "political",
              },
              {
                key: "city",
              },
              {
                key: "nativePlace",
              },
              {
                key: "currentCity",
              },
              {
                key: "salary",
              },
              {
                key: "heightWeight",
              },
              {
                key: "measurements",
              },
              {
                key: "sizes",
              },
              {
                key: "workTime",
              },
              {
                key: "phone",
              },
              {
                key: "email",
              },
              {
                key: "mbti",
              },
            ],
          },
        ],
      },
      {
        key: "account",
        fields: [{}],
      },
      {
        key: "education",
        fields: [{}],
      },
      {
        key: "skill",
      },
      {
        key: "advantage",
      },
      {
        key: "work",
        fields: [{}],
      },
      {
        key: "project",
        fields: [{}],
      },
    ],
  },
  ui: {
    page: { padding: { vertical: 22, horizontal: 22 }, spacing: { paragraph: 6, module: 21 }, footer: "" },
    font: { family: "text-puhui", size: 18, titleSize: 24, lineHeight: 1.1 },
    content: { language: "zh", textAlign: "auto", infoSeparator: "space", linkUnderline: false, dateStyle: "dot", datePosition: "right" },
    theme: { template: "classic", color: "#ef93b5", titleIconMode: "icon", userModule: "auto", module: "auto", item: "auto" },
    layout: { template: null, custom: null, leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "center", infoPosition: "center" },
  },
};

// 小舟数据：出生日期按当前时间倒推 18 年生成，保证年龄恒为 18 岁
const resumeData: any = {
  ...defaultData,
  data: {
    ...defaultData.data,
    user: {
      ...defaultData.data.user,
      data: {
        ...defaultData.data.user.data,
        birthday: dayjs().subtract(18, "year").format("YYYY-MM"),
      },
    },
  },
};

export default resumeData;
