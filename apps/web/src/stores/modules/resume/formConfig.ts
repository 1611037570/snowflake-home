import type { FormConfig, FormField } from "@/components/business/dynamicForm";

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
        tip: "求职岗位 推荐必填",
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
        tip: "真实姓名 推荐必填",
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
        rules: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          {
            pattern: /^[\u4e00-\u9fa5a-zA-Z0-9·\s]{2,20}$/,
            message: "请输入2-20位姓名",
            trigger: "blur",
          },
        ],
      },
      {
        type: "object",
        label: "出生日期",
        tip: "出生年月 推荐必填",
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
        tip: "常用手机号 推荐必填",
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
        rules: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号",
            trigger: "blur",
          },
        ],
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
        rules: [
          {
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "请输入正确的邮箱格式",
            trigger: "blur",
          },
        ],
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
] satisfies FormField[];
// 用户信息的配置
export const DEFAULT_USER_CONFIG = {
  meta: DEFAULT_META,
  // 是否可拖动
  drag: false,
  // 表单中所渲染的组件的字段
  fields: structuredClone(DEFAULT_USER_FORM),
} satisfies FormConfig;
// 社交账号
export const DEFAULT_ACCOUNT_FORM = {
  type: "object",
  key: "account",
  name: "社交账号",
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
} satisfies FormField;
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
    add: true,
  },
  // 表单中所渲染的组件的双向绑定的模型
  model: {
    source: ["education", "collapsed"],
    prop: "collapsed",
    defaultValue: ["1"],
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
          // 学制
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
} satisfies FormField;
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
      model: {
        source: ["skill", "data"],
        prop: "modelValue",
      },
    },
  ],
} satisfies FormField;
// 个人优势
export const DEFAULT_ADVANTAGE_FORM = {
  type: "object",
  component: "boxCollapse",
  key: "advantage",
  name: "个人优势",
  props: {
    add: false,
  },
  model: [
    {
      source: ["advantage", "collapsed"],
      prop: "collapsed",
      defaultValue: ["1"],
    },
  ],
  slot: "default",
  fields: [
    {
      type: "object",
      component: "wangEditor",
      model: {
        source: ["advantage", "data"],
        prop: "modelValue",
      },
    },
  ],
} satisfies FormField;
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
      list: [],
      addConfig: {
        type: "object",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        // 折叠标题：绑定标题字段，由 itemCollapse 推导展示
        props: {
          placeholder: "未填写公司名称",
        },
        model: [
          {
            source: ["work", "data", "?", "name"],
            prop: "name",
          },
        ],
        // 子项字段列表：纯 schema 声明
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
} satisfies FormField;
// 项目经历
export const DEFAULT_PROJECT_FORM = {
  type: "object",
  key: "project",
  name: "项目经历",
  component: "boxCollapse",
  props: {
    add: true,
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
      list: [],
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
} satisfies FormField;
// 自定义经历
export const DEFAULT_CUSTOM_FORM = {
  type: "object",
  key: "custom",
  name: "",
  component: "boxCollapse",
  props: {
    add: true,
    edit: true,
  },
  model: [
    {
      source: ["custom", "collapsed"],
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
      list: [],
      addConfig: {
        component: "custom",
        span: 24,
        model: [
          {
            source: ["custom", "data", "?", "name"],
            prop: "name",
          },
          {
            source: ["custom", "data", "?", "education"],
            prop: "education",
          },
          {
            source: ["custom", "data", "?", "post"],
            prop: "post",
          },
          {
            source: ["custom", "data", "?", "time"],
            prop: "time",
          },
          {
            source: ["custom", "data", "?", "content"],
            prop: "content",
          },
        ],
      },
    },
  ],
} satisfies FormField;
//
export const DEFAULT_CONFIG = {
  meta: DEFAULT_META,
  drag: true,
  dragClass: ".container-drag",
  // 表单中所渲染的组件的字段
  fields: [],
} satisfies FormConfig;
export const allConfig = {
  skill: DEFAULT_SKILL_FORM,
  user: DEFAULT_USER_FORM,
  advantage: DEFAULT_ADVANTAGE_FORM,
  education: DEFAULT_EDUCATION_FORM,
  account: DEFAULT_ACCOUNT_FORM,
  work: DEFAULT_WORK_FORM,
  project: DEFAULT_PROJECT_FORM,
  custom: DEFAULT_CUSTOM_FORM,
} satisfies Record<string, FormField | FormField[]>;
