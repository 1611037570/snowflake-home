import { DEFAULT_USER_FORM } from "./formConfig";
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

export const xiaoYangForm = {
  meta: {
    version: "1.0.0",
  },
  drag: true,
  dragClass: ".container-drag",
  fields: [
    // 社交账号
    {
      type: "group",
      key: "account",
      span: 24,
      model: [
        {
          source: ["account", "collapsed"],
          prop: "collapsed",
          defaultValue: ["1"],
        },
      ],
      component: "boxCollapse",
      props: {
        name: "社交账号",
        add: true,
      },
      slot: "default",
      fields: [
        {
          type: "array",
          drag: true,
          dragClass: ".item-drag",
          list: [
            {
              model: [
                {
                  source: ["account", "data", "?", "name"],
                  defaultValue: "",
                  prop: "name",
                },
                {
                  source: ["account", "data", "?", "url"],
                  defaultValue: "",
                  prop: "url",
                },
              ],
              type: "object",
              component: "account",
            },
            {
              model: [
                {
                  source: ["account", "data", "?", "name"],
                  defaultValue: "",
                  prop: "name",
                },
                {
                  source: ["account", "data", "?", "url"],
                  defaultValue: "",
                  prop: "url",
                },
              ],
              type: "object",
              component: "account",
            },
          ],
          addConfig: {
            model: [
              {
                source: ["account", "data", "?", "name"],
                defaultValue: "",
                prop: "name",
              },
              {
                source: ["account", "data", "?", "url"],
                defaultValue: "",
                prop: "url",
              },
            ],
            type: "object",
            component: "account",
          },
        },
      ],
    },
    // 教育经历
    {
      key: "education",
      type: "group",
      component: "boxCollapse",
      props: {
        name: "教育经历",
        add: true,
      },
      model: {
        source: ["education", "collapsed"],
        prop: "collapsed",
        defaultValue: ["1"],
      },
      slot: "default",
      fields: [
        {
          type: "array",
          drag: true,
          dragClass: ".item-drag",
          list: [
            {
              model: [
                {
                  source: ["education", "data", "?", "name"],
                  prop: "name",
                },
                {
                  source: ["education", "data", "?", "education"],
                  prop: "education",
                },
                {
                  source: ["education", "data", "?", "post"],
                  prop: "post",
                },
                {
                  source: ["education", "data", "?", "time"],
                  prop: "time",
                },
                {
                  source: ["education", "data", "?", "content"],
                  prop: "content",
                },
                {
                  source: ["education", "data", "?", "mode"],
                  prop: "mode",
                },
              ],
              component: "education",
              span: 24,
            },
          ],
          addConfig: {
            model: [
              {
                source: ["education", "data", "?", "name"],
                prop: "name",
              },
              {
                source: ["education", "data", "?", "education"],
                prop: "education",
              },
              {
                source: ["education", "data", "?", "post"],
                prop: "post",
              },
              {
                source: ["education", "data", "?", "time"],
                prop: "time",
              },
              {
                source: ["education", "data", "?", "content"],
                prop: "content",
              },
              {
                source: ["education", "data", "?", "mode"],
                prop: "mode",
              },
            ],
            component: "education",
            span: 24,
          },
        },
      ],
    },
    // 专业技能
    {
      type: "group",
      component: "boxCollapse",
      key: "skill",
      props: {
        name: "专业技能",
        add: false,
      },
      model: [
        {
          source: ["skill", "collapsed"],
          prop: "collapsed",
          defaultValue: [],
        },
      ],
      slot: "default",
      fields: [
        {
          type: "object",
          component: "wangEditor",
          model: {
            source: ["skill", "data"],
            prop: "modelValue",
          },
        },
      ],
    },
    // 工作经历
    {
      type: "group",
      key: "work",
      component: "boxCollapse",
      props: {
        name: "工作经历",
        add: true,
      },
      model: [
        {
          source: ["work", "collapsed"],
          prop: "collapsed",
          defaultValue: [],
        },
      ],
      slot: "default",
      fields: [
        {
          type: "array",
          drag: true,
          dragClass: ".item-drag",
          list: [
            {
              type: "group",
              component: "itemCollapse",
              slot: "default",
              span: 24,
              model: [
                {
                  source: ["work", "data", "?", "name"],
                  prop: "name",
                },
              ],
              fields: [
                {
                  type: "object",
                  label: "公司",
                  component: "input",
                  span: 12,
                  model: {
                    source: ["work", "data", "?", "name"],
                    prop: "modelValue",
                  },
                  props: {
                    placeholder: "公司",
                    clearable: true,
                  },
                },
                {
                  type: "object",
                  label: "岗位",
                  component: "input",
                  span: 12,
                  model: {
                    source: ["work", "data", "?", "post"],
                    prop: "modelValue",
                  },
                  props: {
                    placeholder: "岗位",
                    clearable: true,
                  },
                },
                {
                  type: "object",
                  label: "时间",
                  component: "datePicker",
                  span: 24,
                  model: {
                    source: ["work", "data", "?", "time"],
                    prop: "modelValue",
                  },
                  props: {
                    type: "monthrange",
                    format: "YYYY.MM",
                    valueFormat: "YYYY.MM",
                    startPlaceholder: "开始时间",
                    endPlaceholder: "结束时间",
                  },
                },
                {
                  type: "object",
                  label: "经历",
                  component: "wangEditor",
                  span: 24,
                  model: {
                    source: ["work", "data", "?", "content"],
                    prop: "modelValue",
                  },
                },
              ],
            },
          ],
          addConfig: {
            type: "group",
            component: "itemCollapse",
            slot: "default",
            span: 24,
            model: [
              {
                source: ["work", "data", "?", "name"],
                prop: "name",
              },
            ],
            fields: [
              {
                type: "object",
                label: "公司",
                component: "input",
                span: 12,
                model: {
                  source: ["work", "data", "?", "name"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "公司",
                  clearable: true,
                },
              },
              {
                type: "object",
                label: "岗位",
                component: "input",
                span: 12,
                model: {
                  source: ["work", "data", "?", "post"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "岗位",
                  clearable: true,
                },
              },
              {
                type: "object",
                label: "时间",
                component: "datePicker",
                span: 24,
                model: {
                  source: ["work", "data", "?", "time"],
                  prop: "modelValue",
                },
                props: {
                  type: "monthrange",
                  format: "YYYY.MM",
                  valueFormat: "YYYY.MM",
                  startPlaceholder: "开始时间",
                  endPlaceholder: "结束时间",
                },
              },
              {
                type: "object",
                label: "经历",
                component: "wangEditor",
                span: 24,
                model: {
                  source: ["work", "data", "?", "content"],
                  prop: "modelValue",
                },
              },
            ],
          },
        },
      ],
    },
    // 项目经历
    {
      type: "group",
      key: "project",
      component: "boxCollapse",
      props: {
        add: true,
        name: "项目经历",
      },
      model: [
        {
          source: ["project", "collapsed"],
          prop: "collapsed",
          defaultValue: ["1"],
        },
      ],
      slot: "default",
      fields: [
        {
          type: "array",
          drag: true,
          dragClass: ".item-drag",
          list: [
            {
              type: "group",
              component: "itemCollapse",
              slot: "default",
              span: 24,
              model: [
                {
                  source: ["project", "data", "?", "name"],
                  prop: "name",
                },
              ],
              fields: [
                {
                  type: "object",
                  label: "公司",
                  component: "input",
                  span: 12,
                  model: {
                    source: ["project", "data", "?", "name"],
                    prop: "modelValue",
                  },
                  props: {
                    placeholder: "公司",
                    clearable: true,
                  },
                },
                {
                  type: "object",
                  label: "岗位",
                  component: "input",
                  span: 12,
                  model: {
                    source: ["project", "data", "?", "post"],
                    prop: "modelValue",
                  },
                  props: {
                    placeholder: "岗位",
                    clearable: true,
                  },
                },
                {
                  type: "object",
                  label: "时间",
                  component: "datePicker",
                  span: 24,
                  model: {
                    source: ["project", "data", "?", "time"],
                    prop: "modelValue",
                  },
                  props: {
                    type: "monthrange",
                    format: "YYYY.MM",
                    valueFormat: "YYYY.MM",
                    startPlaceholder: "开始时间",
                    endPlaceholder: "结束时间",
                  },
                },
                {
                  type: "object",
                  label: "经历",
                  component: "wangEditor",
                  span: 24,
                  model: {
                    source: ["project", "data", "?", "content"],
                    prop: "modelValue",
                  },
                },
              ],
            },
          ],
          addConfig: {
            type: "group",
            component: "itemCollapse",
            slot: "default",
            span: 24,
            model: [
              {
                source: ["project", "data", "?", "name"],
                prop: "name",
              },
            ],
            fields: [
              {
                type: "object",
                label: "公司",
                component: "input",
                span: 12,
                model: {
                  source: ["project", "data", "?", "name"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "公司",
                  clearable: true,
                },
              },
              {
                type: "object",
                label: "岗位",
                component: "input",
                span: 12,
                model: {
                  source: ["project", "data", "?", "post"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "岗位",
                  clearable: true,
                },
              },
              {
                type: "object",
                label: "时间",
                component: "datePicker",
                span: 24,
                model: {
                  source: ["project", "data", "?", "time"],
                  prop: "modelValue",
                },
                props: {
                  type: "monthrange",
                  format: "YYYY.MM",
                  valueFormat: "YYYY.MM",
                  startPlaceholder: "开始时间",
                  endPlaceholder: "结束时间",
                },
              },
              {
                type: "object",
                label: "经历",
                component: "wangEditor",
                span: 24,
                model: {
                  source: ["project", "data", "?", "content"],
                  prop: "modelValue",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

export const xiaoYangUI = {
  padding: 28,
  fontSize: 15,
  lineHeight: 25,
  moduleSpacing: 12,
  themeColor: "#ff4d4f",
  fontFamily: "text-puhui",
  themeTemplate: "default",
};

export const xiaoYangResumeItem = {
  data: xiaoYangData,
  config: xiaoYangForm,
  fixedConfig: xiaoYangFixedForm,
  ui: xiaoYangUI,
};
