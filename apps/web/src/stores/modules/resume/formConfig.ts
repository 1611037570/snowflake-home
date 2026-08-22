const DEFAULT_META = {
  version: "1.0.0",
};
// 用户信息
export const DEFAULT_USER_FORM = [
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
      // 求职岗位
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
];
// 用户信息的配置
export const DEFAULT_USER_CONFIG = {
  meta: DEFAULT_META,
  // 是否可拖动
  drag: false,
  // 表单中所渲染的组件的字段
  fields: structuredClone(DEFAULT_USER_FORM),
};
// 社交账号
export const DEFAULT_ACCOUNT_FORM = {
  type: "object",
  key: "account",
  name: "社交账号",
  span: 24,
  model: [
    {
      source: ["account"],
      prop: "modelValue",
    },
  ],
  component: "boxCollapse",
  props: {
    title: "社交账号",
    add: true,
  },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: ".item-drag",
      list: [],
      addConfig: {
        model: [
          {
            source: ["account", "?", "name"],
            defaultValue: "",
            prop: "name",
          },
          {
            source: ["account", "?", "url"],
            defaultValue: "",
            prop: "url",
          },
        ],
        type: "object",
        component: "account",
      },
    },
  ],
};
// 教育经历
export const DEFAULT_EDUCATION_FORM = {
  name: "教育经历",
  key: "education",
  // 表单中所渲染的类型
  type: "object",
  // 表单中所渲染的组件
  component: "boxCollapse",
  // 表单中所渲染的组件的属性
  props: {
    title: "教育经历",
    add: true,
  },
  // 表单中所渲染的组件的双向绑定的模型
  model: {
    // 实际未使用，这里绑定为了方便删除
    source: ["education"],
    prop: "modelValue",
  },
  slot: "default",
  // 表单中所渲染的组件的子组件
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: ".item-drag",
      list: [],
      addConfig: {
        model: [
          {
            source: ["education", "?", "name"],
            prop: "name",
          },
          {
            source: ["education", "?", "education"],
            prop: "education",
          },
          {
            source: ["education", "?", "post"],
            prop: "post",
          },
          {
            source: ["education", "?", "time"],
            prop: "time",
          },
          {
            source: ["education", "?", "content"],
            prop: "content",
          },
          // 学制
          {
            source: ["education", "?", "mode"],
            prop: "mode",
          },
        ],
        component: "education",
        span: 24,
      },
    },
  ],
};
// 专业技能
export const DEFAULT_SKILL_FORM = {
  type: "object",
  component: "boxCollapse",
  key: "skill",
  name: "专业技能",
  props: {
    title: "专业技能",
    add: false,
  },
  model: {
    source: ["skill"],
    prop: "modelValue",
  },
  slot: "default",
  fields: [
    {
      type: "object",
      component: "wangEditor",
      model: {
        source: ["skill"],
        prop: "modelValue",
      },
    },
  ],
};
// 个人优势
export const DEFAULT_ADVANTAGE_FORM = {
  type: "object",
  component: "boxCollapse",
  key: "advantage",
  name: "个人优势",
  props: {
    title: "个人优势",
    add: false,
  },
  model: {
    source: ["advantage"],
    prop: "modelValue",
  },
  slot: "default",
  fields: [
    {
      type: "object",
      component: "wangEditor",
      model: {
        source: ["advantage"],
        prop: "modelValue",
      },
    },
  ],
};
// 工作经历
export const DEFAULT_WORK_FORM = {
  type: "object",
  key: "work",
  name: "工作经历",
  component: "boxCollapse",
  props: {
    title: "工作经历",
    add: true,
  },
  model: {
    source: ["work"],
    prop: "modelValue",
  },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: ".item-drag",
      list: [],
      addConfig: {
        component: "work",
        span: 24,
        model: [
          {
            source: ["work", "?", "name"],
            prop: "name",
          },
          {
            source: ["work", "?", "post"],
            prop: "post",
          },
          {
            source: ["work", "?", "time"],
            prop: "time",
          },
          {
            source: ["work", "?", "content"],
            prop: "content",
          },
        ],
      },
    },
  ],
};
// 项目经历
export const DEFAULT_PROJECT_FORM = {
  type: "object",
  key: "project",
  name: "项目经历",
  component: "boxCollapse",
  props: {
    title: "项目经历",
    add: true,
  },
  model: {
    source: ["project"],
    prop: "modelValue",
  },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: ".item-drag",
      list: [],
      addConfig: {
        component: "project",
        span: 24,
        model: [
          {
            source: ["project", "?", "name"],
            prop: "name",
          },
          {
            source: ["project", "?", "post"],
            prop: "post",
          },
          {
            source: ["project", "?", "time"],
            prop: "time",
          },
          {
            source: ["project", "?", "content"],
            prop: "content",
          },
        ],
      },
    },
  ],
};
// 自定义经历
export const DEFAULT_CUSTOM_FORM = {
  type: "object",
  key: "custom",
  name: "",
  component: "boxCollapse",
  props: {
    title: "",
    add: true,
    edit: true,
  },
  model: {
    source: ["custom"],
    prop: "modelValue",
  },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: ".item-drag",
      list: [],
      addConfig: {
        component: "custom",
        span: 24,
        model: [
          {
            source: ["custom", "?", "name"],
            prop: "name",
          },
          {
            source: ["custom", "?", "education"],
            prop: "education",
          },
          {
            source: ["custom", "?", "post"],
            prop: "post",
          },
          {
            source: ["custom", "?", "time"],
            prop: "time",
          },
          {
            source: ["custom", "?", "content"],
            prop: "content",
          },
        ],
      },
    },
  ],
};
//
export const DEFAULT_CONFIG = {
  meta: DEFAULT_META,
  drag: true,
  dragClass: ".container-drag",
  // 表单中所渲染的组件的字段
  fields: [],
};
export const allConfig = {
  skill: DEFAULT_SKILL_FORM,
  user: DEFAULT_USER_FORM,
  advantage: DEFAULT_ADVANTAGE_FORM,
  education: DEFAULT_EDUCATION_FORM,
  account: DEFAULT_ACCOUNT_FORM,
  work: DEFAULT_WORK_FORM,
  project: DEFAULT_PROJECT_FORM,
  custom: DEFAULT_CUSTOM_FORM,
};
