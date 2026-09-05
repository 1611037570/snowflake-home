import type { FormConfig, FormField } from "@/components/business/dynamicForm";

const DEFAULT_META = {
  version: "1.0.0",
};
const DEFAULT_DRAG_CLASS = ".item-drag";
const DEFAULT_COL_CLASS =
  "rounded-2xl border border-sf-bg-3 bg-sf-primary px-3! hover:border-sf-theme";
// 用户信息
export const DEFAULT_USER_FORM = [
  {
    type: "group",
    component: "boxCollapse",
    key: "user",
    name: "用户信息",
    props: {
      name: "用户信息",
      add: false,
      drag: false,
    },
    model: [
      {
        source: ["user", "collapsed"],
        prop: "collapsed",
        defaultValue: ["1"],
      },
      // 隐藏开关：控制模块在简历预览中显示/隐藏
      {
        source: ["user", "hidden"],
        prop: "hidden",
        defaultValue: false,
      },
    ],
    checks: { hidden: { path: ["user", "hidden"] } },
    slot: "default",
    fields: [
      // 头像
      {
        type: "object",
        label: "头像",
        component: "imageUpload",
        span: 24,
        model: {
          source: ["user", "data", "avatar"],
          prop: "modelValue",
        },
      },

      // 姓名
      {
        type: "object",
        label: "姓名",
        tip: "真实姓名 推荐必填",
        component: "input",
        span: 12,
        required: true,
        model: {
          source: ["user", "data", "name"],
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
      // 出生日期
      {
        type: "object",
        label: "出生日期",
        tip: "出生年月 推荐必填",
        component: "datePicker",
        span: 12,
        model: {
          source: ["user", "data", "birthday"],
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
          source: ["user", "data", "phone"],
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
          source: ["user", "data", "sex"],
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
      // 求职岗位
      {
        type: "object",
        label: "求职岗位",
        tip: "求职岗位 推荐必填",
        component: "input",
        span: 12,
        model: {
          source: ["user", "data", "position"],
          prop: "modelValue",
        },
        props: {
          placeholder: "请输入求职岗位",
          clearable: true,
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
          source: ["user", "data", "status"],
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
          source: ["user", "data", "email"],
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
          source: ["user", "data", "workTime"],
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
    // 隐藏开关：控制模块在简历预览中显示/隐藏
    {
      source: ["account", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["account", "hidden"] } },
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
      dragClass: DEFAULT_DRAG_CLASS,
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
        required: true,
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
    // 隐藏开关：控制模块在简历预览中显示/隐藏
    {
      source: ["education", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["education", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      colClass: DEFAULT_COL_CLASS,
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
            required: true,
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
            required: true,
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
            required: true,
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
            required: true,
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
            required: true,
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
    // 隐藏开关：控制模块在简历预览中显示/隐藏
    {
      source: ["skill", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["skill", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "object",
      component: "wangEditor",
      required: true,
      model: {
        source: ["skill", "data", "content"],
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
  props: {
    name: "个人优势",
    add: false,
  },
  model: [
    {
      source: ["advantage", "collapsed"],
      prop: "collapsed",
      defaultValue: ["1"],
    },
    // 隐藏开关：控制模块在简历预览中显示/隐藏
    {
      source: ["advantage", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["advantage", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "object",
      component: "wangEditor",
      required: true,
      model: {
        source: ["advantage", "data", "content"],
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
    // 隐藏开关：控制模块在简历预览中显示/隐藏
    {
      source: ["work", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["work", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      colClass: DEFAULT_COL_CLASS,
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
            required: true,
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
            required: true,
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
            required: true,
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
            required: true,
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
    // 隐藏开关：控制模块在简历预览中显示/隐藏
    {
      source: ["project", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["project", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      colClass: DEFAULT_COL_CLASS,
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
            required: true,
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
            required: true,
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
            required: true,
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
            required: true,
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
// 视频作品
export const DEFAULT_VIDEO_FORM = {
  type: "group",
  key: "video",
  component: "boxCollapse",
  props: {
    add: true,
    name: "视频作品",
    tip: "该模块的会把视频地址转换为二维码，方便在简历中展示",
  },
  model: [
    {
      source: ["video", "collapsed"],
      prop: "collapsed",
      defaultValue: ["1"],
    },
    {
      source: ["video", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["video", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      colClass: DEFAULT_COL_CLASS,
      list: [],
      addConfig: {
        // 折叠标题数据源：展示当前视频名称
        model: [
          {
            source: ["video", "data", "?", "name"],
            prop: "name",
          },
        ],
        fields: [
          {
            model: [
              {
                source: ["video", "data", "?", "name"],
                defaultValue: "",
                prop: "name",
              },
              {
                source: ["video", "data", "?", "url"],
                defaultValue: "",
                prop: "url",
              },
              {
                source: ["video", "data", "?", "desc"],
                defaultValue: "",
                prop: "desc",
              },
            ],
            type: "object",
            component: "video",
            required: true,
          },
        ],
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        required: true,
      },
    },
  ],
} satisfies FormField;
// 图片作品
export const DEFAULT_IMAGE_FORM = {
  type: "group",
  key: "image",
  component: "boxCollapse",
  props: {
    add: true,
    name: "图片作品",
  },
  model: [
    {
      source: ["image", "collapsed"],
      prop: "collapsed",
      defaultValue: ["1"],
    },
    {
      source: ["image", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
  ],
  checks: { hidden: { path: ["image", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      colClass: DEFAULT_COL_CLASS,
      list: [],
      addConfig: {
        // 折叠标题数据源：展示当前图片作品名称
        model: [
          {
            source: ["image", "data", "?", "name"],
            prop: "name",
          },
        ],
        fields: [
          {
            model: [
              {
                source: ["image", "data", "?", "name"],
                defaultValue: "",
                prop: "name",
              },
              {
                source: ["image", "data", "?", "img"],
                defaultValue: "",
                prop: "img",
              },
              {
                source: ["image", "data", "?", "desc"],
                defaultValue: "",
                prop: "desc",
              },
              {
                source: ["image", "data", "?", "size"],
                defaultValue: 50,
                prop: "size",
              },
            ],
            type: "object",
            component: "image",
            required: true,
          },
        ],
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        required: true,
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
      source: ["custom", "hidden"],
      prop: "hidden",
      defaultValue: false,
    },
    {
      source: ["custom", "name"],
      prop: "name",
      defaultValue: "",
    },
  ],
  checks: { hidden: { path: ["custom", "hidden"] } },
  slot: "default",
  fields: [
    {
      type: "array",
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      colClass: DEFAULT_COL_CLASS,
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
            required: true,
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
            required: true,
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
            required: true,
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
            required: true,
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
  video: DEFAULT_VIDEO_FORM,
  image: DEFAULT_IMAGE_FORM,
  account: DEFAULT_ACCOUNT_FORM,
  work: DEFAULT_WORK_FORM,
  project: DEFAULT_PROJECT_FORM,
  custom: DEFAULT_CUSTOM_FORM,
} satisfies Record<string, FormField | FormField[]>;
