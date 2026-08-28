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
    type: "group",
    key: "user",
    name: "用户信息",
    fields: [
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
      // 姓名
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
      // 头像
      {
        type: "object",
        label: "头像",
        component: "imageUpload",
        span: 24,
        model: {
          source: ["user", "avatar"],
          prop: "modelValue",
        },
      },
      // 出生日期
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
      // 手机号
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
      // 性别
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
      // 求职状态
      {
        type: "object",
        label: "状态",
        tip: "求职状态",
        component: "select",
        span: 12,
        model: {
          source: ["user", "status"],
          prop: "modelValue",
        },
        props: {
          placeholder: "请选择状态",
          clearable: true,
          list: [
            {
              name: "在职",
              value: "在职",
            },
            {
              name: "离职",
              value: "离职",
            },
            {
              name: "应届生",
              value: "应届生",
            },
          ],
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
    ],
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
  key: "education",
  type: "group",
  component: "boxCollapse",
  props: {
    name: "教育经历",
    add: true,
  },
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
      list: [],
      addConfig: {
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        model: [
          {
            source: ["education", "data", "?", "name"],
            prop: "name",
          },
        ],
        fields: [
          {
            type: "object",
            label: "学校",
            component: "input",
            span: 12,
            model: {
              source: ["education", "data", "?", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "学校",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "学位",
            component: "select",
            span: 12,
            model: {
              source: ["education", "data", "?", "education"],
              prop: "modelValue",
            },
            props: {
              placeholder: "学位",
              clearable: true,
              list: [
                { name: "高中", value: "高中" },
                { name: "大专", value: "大专" },
                { name: "本科", value: "本科" },
                { name: "硕士", value: "硕士" },
                { name: "博士", value: "博士" },
              ],
            },
          },
          {
            type: "object",
            label: "专业",
            component: "input",
            span: 12,
            model: {
              source: ["education", "data", "?", "post"],
              prop: "modelValue",
            },
            props: {
              placeholder: "专业",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "学制",
            component: "select",
            span: 12,
            model: {
              source: ["education", "data", "?", "mode"],
              prop: "modelValue",
            },
            props: {
              placeholder: "学制",
              clearable: true,
              list: [
                { name: "全日制", value: "全日制" },
                { name: "非全日制", value: "非全日制" },
                { name: "不填写", value: "" }, // 顺带优化：空格字符串改为空字符串
              ],
            },
          },
          {
            type: "object",
            label: "时间",
            component: "datePicker",
            span: 24,
            model: {
              source: ["education", "data", "?", "time"],
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
              source: ["education", "data", "?", "content"],
              prop: "modelValue",
            },
          },
        ],
      },
    },
  ],
} satisfies FormField;

// 专业技能
export const DEFAULT_SKILL_FORM = {
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
  type: "group",
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
      list: [],
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
        // 子项字段列表：纯 schema 声明
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
} satisfies FormField;
// 自定义经历
export const DEFAULT_CUSTOM_FORM = {
  type: "group",
  key: "custom",
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
    {
      source: ["custom", "name"],
      prop: "name",
      defaultValue: "",
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
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        model: [
          {
            source: ["custom", "data", "?", "name"],
            prop: "name",
          },
        ],
        // 子项字段列表：纯 schema 声明
        fields: [
          {
            type: "object",
            label: "名称",
            component: "input",
            span: 12,
            model: {
              source: ["custom", "data", "?", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "名称",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "职位",
            component: "input",
            span: 12,
            model: {
              source: ["custom", "data", "?", "post"],
              prop: "modelValue",
            },
            props: {
              placeholder: "职位",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "时间",
            component: "datePicker",
            span: 24,
            model: {
              source: ["custom", "data", "?", "time"],
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
              source: ["custom", "data", "?", "content"],
              prop: "modelValue",
            },
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
