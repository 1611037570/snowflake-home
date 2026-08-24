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
  account: [
    {
      name: "github",
      url: "https://github.com/1611037570",
    },
    {
      name: "稀土掘金",
      url: "https://juejin.cn/user/2342386827791687/posts",
    },
  ],
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
  fields: [
    {
      type: "object",
      component: "title",
      props: {
        modelValue: "个人信息",
      },
      model: [],
    },
    {
      list: [
        {
          type: "object",
          label: "求职岗位",
          tip: "目标岗位，必填",
          component: "input",
          span: 24,
          model: {
            source: ["user", "position"],
            prop: "modelValue",
          },
          props: {
            placeholder: "请输入求职岗位",
            clearable: true,
          },
        },
        {
          type: "object",
          label: "姓名",
          tip: "真实姓名，必填",
          component: "input",
          span: 12,
          model: {
            source: ["user", "name"],
            prop: "modelValue",
          },
          props: {
            placeholder: "请输入姓名",
            clearable: true,
          },
        },
        {
          type: "object",
          label: "出生日期",
          tip: "出生年月，必填",
          component: "datePicker",
          span: 12,
          model: {
            source: ["user", "birthday"],
            prop: "modelValue",
          },
          props: {
            placeholder: "请输入出生日期",
            valueFormat: "YYYY.MM",
            type: "month",
          },
        },
        {
          type: "object",
          label: "电话",
          tip: "常用手机号，必填",
          component: "input",
          span: 12,
          model: {
            source: ["user", "phone"],
            prop: "modelValue",
          },
          props: {
            placeholder: "请输入电话",
            clearable: true,
          },
        },
        {
          type: "object",
          label: "邮箱",
          tip: "常用邮箱",
          component: "input",
          span: 12,
          model: {
            source: ["user", "email"],
            prop: "modelValue",
          },
          props: {
            placeholder: "请输入邮箱",
            clearable: true,
          },
        },
        {
          type: "object",
          label: "参加工作时间",
          tip: "首次工作年月",
          component: "datePicker",
          span: 12,
          model: {
            source: ["user", "workTime"],
            prop: "modelValue",
          },
          props: {
            placeholder: "请输入参加工作时间",
            valueFormat: "YYYY.MM",
            type: "month",
          },
        },
        {
          type: "object",
          label: "性别",
          tip: "选择性别",
          component: "select",
          span: 12,
          model: {
            source: ["user", "sex"],
            prop: "modelValue",
          },
          props: {
            placeholder: "请输入性别",
            clearable: true,
            list: [
              {
                name: "男",
                value: "男",
              },
              {
                name: "女",
                value: "女",
              },
            ],
          },
        },
      ],
      drag: false,
      type: "array",
      key: "user",
      name: "用户信息",
    },
  ],
};

export const xiaoYangForm = {
  meta: {
    version: "1.0.0",
  },
  drag: true,
  dragClass: ".container-drag",
  fields: [
    // 教育经历（原“社交账号”但 key 为 education，保留不变，仅修正 model）
    {
      name: "社交账号",
      key: "education",
      type: "object",
      component: "boxCollapse",
      props: {
        add: true,
      },
      // ✅ 修正：boxCollapse 的 model 为数组，包含 collapsed 控制
      model: [
        {
          source: ["education", "collapsed"],
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
              // ✅ 修正：内部 list 的 model 为数组，source 包含 data 和 ?
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
            // ✅ 修正：addConfig 的 model 同样修正
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
      type: "object",
      component: "boxCollapse",
      key: "skill",
      name: "专业技能",
      props: {
        add: false,
      },
      // ✅ 修正：boxCollapse 的 model 为数组
      model: [
        {
          source: ["skill", "collapsed"],
          prop: "collapsed",
          defaultValue: ["1"],
        },
      ],
      slot: "default",
      fields: [
        {
          type: "object",
          component: "wangEditor",
          // ✅ 修正：source 指向 skill.data
          model: {
            source: ["skill", "data"],
            prop: "modelValue",
          },
        },
      ],
    },
    // 工作经历
    {
      type: "object",
      key: "work",
      name: "工作经历",
      component: "boxCollapse",
      props: {
        add: true,
      },
      // ✅ 修正
      model: [
        {
          source: ["work", "collapsed"],
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
              component: "work",
              span: 24,
              // ✅ 修正：source 包含 work.data.?
              model: [
                {
                  source: ["work", "data", "?", "name"],
                  prop: "name",
                },
                {
                  source: ["work", "data", "?", "post"],
                  prop: "post",
                },
                {
                  source: ["work", "data", "?", "time"],
                  prop: "time",
                },
                {
                  source: ["work", "data", "?", "content"],
                  prop: "content",
                },
              ],
            },
          ],
          addConfig: {
            component: "work",
            span: 24,
            model: [
              {
                source: ["work", "data", "?", "name"],
                prop: "name",
              },
              {
                source: ["work", "data", "?", "post"],
                prop: "post",
              },
              {
                source: ["work", "data", "?", "time"],
                prop: "time",
              },
              {
                source: ["work", "data", "?", "content"],
                prop: "content",
              },
            ],
          },
        },
      ],
    },
    // 项目经历
    {
      type: "object",
      key: "project",
      name: "项目经历",
      component: "boxCollapse",
      props: {
        add: true,
      },
      // ✅ 修正
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
              component: "project",
              span: 24,
              model: [
                {
                  source: ["project", "data", "?", "name"],
                  prop: "name",
                },
                {
                  source: ["project", "data", "?", "post"],
                  prop: "post",
                },
                {
                  source: ["project", "data", "?", "time"],
                  prop: "time",
                },
                {
                  source: ["project", "data", "?", "content"],
                  prop: "content",
                },
              ],
            },
          ],
          addConfig: {
            component: "project",
            span: 24,
            model: [
              {
                source: ["project", "data", "?", "name"],
                prop: "name",
              },
              {
                source: ["project", "data", "?", "post"],
                prop: "post",
              },
              {
                source: ["project", "data", "?", "time"],
                prop: "time",
              },
              {
                source: ["project", "data", "?", "content"],
                prop: "content",
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
  color: "#ff4d4f",
  fontFamily: "text-puhui",
};

export const xiaoYangResumeItem = {
  data: xiaoYangData,
  config: xiaoYangForm,
  fixedConfig: xiaoYangFixedForm,
  ui: xiaoYangUI,
};
