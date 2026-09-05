import {
  DEFAULT_ACCOUNT_FORM,
  DEFAULT_EDUCATION_FORM,
  DEFAULT_IMAGE_FORM,
  DEFAULT_PROJECT_FORM,
  DEFAULT_SKILL_FORM,
  DEFAULT_USER_FORM,
  DEFAULT_VIDEO_FORM,
  DEFAULT_WORK_FORM,
} from "./formConfig";
// 小羊数据
export const xiaoYangData: any = {
  user: {
    data: {
      position: "前端开发",
      name: "小羊",
      birthday: "2000-07",
      phone: "158****2637",
      email: "161****570@qq.com",
      workTime: "2022.08.01",
      sex: "男",
      avatar:
        "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",
    },
  },
  account: {
    collapsed: ["1"],
    data: [
      {
        name: "github",
        url: "https://github.com/1611037570",
      },
      {
        name: "稀土掘金",
        url: "https://juejin.cn/user/2342386827791687/posts",
      },
    ],
  },
  skill: {
    collapsed: ["1"],
    data: {
      content:
        "<p><strong>1、</strong>精通前端开发核心技术栈，熟练掌握前端技术栈，包括<strong>HTML5</strong>、<strong>CSS3</strong>精准实现产品原型图；结合<strong>ChatGPT</strong>、<strong>Copilot</strong>等AI工具实现高效开发。</p><p><strong>2、</strong>熟练使用<strong>JavaScript、TypeScript（</strong>ES6）进行现代化前端开发，掌握<strong>Axios、Loadsh</strong>等经典库的使用。</p><p><strong>3、</strong>熟练使用 <strong>Vue2和Vue3 和 VueRouter</strong>、<strong>Pinia、VueUse</strong>等vue生态框架，具有丰富的移动端和PC前台和后台项目实战经验，能够根据业务需求选择最优技术方案。</p><p><strong>4、</strong>熟练使用 <strong>UniApp </strong>跨平台开发框架，有多个同时兼容H5、小程序、App多端实战项目经验。</p><p><strong>5、</strong>熟练使用<strong>ElementPlus</strong>、<strong>AntDesignVue</strong>、<strong>Uview</strong>、<strong>Echarts</strong>等主流UI组件库的使用，能根据项目需求对组件进行深度定制和功能扩展，提高开发效率。</p><p><strong>6</strong>、完整参与过多个大型前端项目的<strong>0-1</strong>的全生命周期管理，具备独立负责项目的能力。</p><p><strong>7、</strong>熟练使用<strong>Git</strong>、<strong>SVN</strong>进行版本控制和团队协作。</p><p><strong>8、</strong>掌握<strong>Postman</strong>、<strong>Apifox </strong>等接口调试工具进行前后端联调；了解<strong>Node.js</strong>和对数据库的<strong>CURD</strong>相关知识，能与后端流畅沟通。</p><p><strong>9、</strong>具备严谨的编程思维和良好的代码规范意识，编写的代码接口清晰，可维护性强，有一定抗压能力。</p>",
    },
  },
  education: {
    collapsed: ["1"],
    data: [
      {
        name: "***工学院",
        education: "本科",
        post: "计算机科学与技术",
        time: ["2021.09", "2023.06"],
        content: "<p>轻舟简历和雪花起始页项目作者</p>",
        mode: "全日制",
      },
    ],
  },
  work: {
    collapsed: ["1"],
    data: [
      {
        name: "浙江****有限公司",
        post: "前端开发",
        time: ["2022.08", "2026.06"],
        content:
          "<p><strong>2023.5-2024.2：</strong>参与**社区的功能开发与系统维护，优化用户体验并提升系统稳定性，支持平台日均数百万用户的稳定访问。 </p><p><strong>2024.3-2025.2：</strong>主导**社区5.0版本重构工作，推动组件化落地，提升代码复用率与开发效率，缩短新功能开发周期约30%。 &nbsp;</p><p><strong>2025.2-2026.4：</strong>负责社区6.0版本实现AI Agent在前端的落地应用，从前端交互到后端接口的全流程开发。</p>",
      },
    ],
  },
  project: {
    collapsed: ["1"],
    data: [
      {
        name: "**社区",
        post: "前端开发",
        time: ["2022.08", "2026.06"],
        content: "",
      },
      {
        name: "**轻舟简历",
        post: "全栈开发",
        time: ["2022.08", "2026.06"],
        content: "",
      },
    ],
  },
  video: {
    collapsed: [],
    hidden: false,
    data: [
      {
        name: "轻舟简历",
        url: "http://nannan.work/#/resumeEditor?id=1611037570",
        desc: "非视频 仅用于展示",
      },
    ],
  },
  image: {
    collapsed: [],
    hidden: false,
    data: [],
  },
};

export const xiaoYangFixedForm = {
  meta: {
    version: "1.0.0",
  },
  drag: false,
  fields: DEFAULT_USER_FORM,
};

// 复用默认配置时各模块数组子项 list 为空，按小羊已有数据条数补齐（相当于完成一次添加）
const initArrayListByData = (fields: any[]) => {
  fields.forEach((field: any) => {
    // 当前模块的数组子项字段
    const arrayField = field.fields?.find((f: any) => f.type === "array");
    if (!arrayField?.addConfig) return;
    // 由 addConfig 首项绑定路径解析数据数组路径（截取 "?" 之前的部分）
    const source: string[] | undefined = arrayField.addConfig.model?.[0]?.source;
    if (!Array.isArray(source)) return;
    const index = source.indexOf("?");
    if (index === -1) return;
    const dataArray = source
      .slice(0, index)
      .reduce((acc: any, key: string) => acc?.[key], xiaoYangData);
    const count = Array.isArray(dataArray) ? dataArray.length : 0;
    // 按数据条数深拷贝 addConfig 填充 list，避免污染默认配置的共享引用
    for (let i = 0; i < count; i++) {
      arrayField.list.push(structuredClone(arrayField.addConfig));
    }
  });
};

export const xiaoYangForm = {
  meta: {
    version: "1.0.0",
  },
  drag: true,
  dragClass: ".container-drag",
  // 直接复用默认模块配置，避免自行维护与默认配置不同步
  fields: [
    structuredClone(DEFAULT_ACCOUNT_FORM),
    structuredClone(DEFAULT_EDUCATION_FORM),
    structuredClone(DEFAULT_SKILL_FORM),
    structuredClone(DEFAULT_WORK_FORM),
    structuredClone(DEFAULT_PROJECT_FORM),
  ],
};

// 复用默认配置后按数据补齐数组子项，保证带数据的模块列表完整展示
initArrayListByData(xiaoYangForm.fields);

export const xiaoYangUI = {
  padding: 24,
  fontSize: 16,
  lineHeight: 1.2,
  moduleSpacing: 12,
  themeColor: "#ff4d4f",
  fontFamily: "text-puhui",
  themeTemplate: "default",
  userInfoMode: "text",
  avatarPosition: "right",
};

export const xiaoYangResumeItem = {
  data: xiaoYangData,
  config: xiaoYangForm,
  fixedConfig: xiaoYangFixedForm,
  ui: xiaoYangUI,
};
