import {
  DEFAULT_ACCOUNT_FORM,
  DEFAULT_EDUCATION_FORM,
  DEFAULT_PROJECT_FORM,
  DEFAULT_SKILL_FORM,
  DEFAULT_USER_FORM,
  DEFAULT_WORK_FORM,
} from "./formConfig";
// 小羊数据
export const xiaoYangData: any = {
  user: {
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
    data: "<p><strong>1、</strong>精通前端开发核心技术栈，熟练掌握前端技术栈，包括<strong>HTML5</strong>、<strong>CSS3</strong>精准实现产品原型图；结合<strong>ChatGPT</strong>、<strong>Copilot</strong>等AI工具实现高效开发。</p><p><strong>2、</strong>熟练使用<strong>JavaScript、TypeScript（</strong>ES6）进行现代化前端开发，掌握<strong>Axios、Loadsh</strong>等经典库的使用。</p><p><strong>3、</strong>熟练使用 <strong>Vue2和Vue3 和 VueRouter</strong>、<strong>Pinia、VueUse</strong>等vue生态框架，具有丰富的移动端和PC前台和后台项目实战经验，能够根据业务需求选择最优技术方案。</p><p><strong>4、</strong>熟练使用 <strong>UniApp </strong>跨平台开发框架，有多个同时兼容H5、小程序、App多端实战项目经验。</p><p><strong>5、</strong>熟练使用<strong>ElementPlus</strong>、<strong>AntDesignVue</strong>、<strong>Uview</strong>、<strong>Echarts</strong>等主流UI组件库的使用，能根据项目需求对组件进行深度定制和功能扩展，提高开发效率。</p><p><strong>6</strong>、完整参与过多个大型前端项目的<strong>0-1</strong>的全生命周期管理，具备独立负责项目的能力。</p><p><strong>7、</strong>熟练使用<strong>Git</strong>、<strong>SVN</strong>进行版本控制和团队协作。</p><p><strong>8、</strong>掌握<strong>Postman</strong>、<strong>Apifox </strong>等接口调试工具进行前后端联调；了解<strong>Node.js</strong>和对数据库的<strong>CURD</strong>相关知识，能与后端流畅沟通。</p><p><strong>9、</strong>具备严谨的编程思维和良好的代码规范意识，编写的代码接口清晰，可维护性强，有一定抗压能力。</p>",
  },
  education: {
    collapsed: ["1"],
    data: [
      {
        name: "***工学院",
        education: "本科",
        post: "计算机科学与技术",
        time: ["2021.09", "2023.06"],
        content: "<p>独立开发雪花起始页和简历生成器，本简历由该项目生成。</p>",
        mode: "全日制",
      },
    ],
  },
  work: {
    collapsed: ["1"],
    data: [
      {
        name: "浙江****有限公司",
        post: "前端开发工程师",
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
        post: "前端开发工程师",
        time: ["2022.08", "2026.06"],
        content: "",
      },
    ],
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
