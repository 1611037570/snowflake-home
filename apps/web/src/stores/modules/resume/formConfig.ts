import type {
  FieldChecks,
  FormConfig,
  FormField,
  GroupFormField,
  ModelBinding,
  ObjectFormField,
} from "@/components/business/dynamicForm/api";

// 展开状态数组：对应 SfCollapseItem 的激活 name，表示折叠容器为展开态
export const EXPANDED = ["1"];
// 收起状态数组：表示折叠容器为收起态
export const COLLAPSED: string[] = [];

const DEFAULT_META = {
  version: "1.0.0",
};
const DEFAULT_DRAG_CLASS = ".item-drag";
const DEFAULT_COL_CLASS = "rounded-3xl border border-sf-bg-3 bg-sf-primary";

// 模块界面状态绑定：标题、折叠、隐藏在各模块间结构一致
const createModuleState = (title: string): ModelBinding[] => [
  {
    source: ["ui", "title"],
    prop: "title",
    defaultValue: title,
  },
  {
    source: ["ui", "collapsed"],
    prop: "collapsed",
    defaultValue: EXPANDED,
  },
  // 隐藏开关：控制模块在简历预览中显示/隐藏
  {
    source: ["ui", "hidden"],
    prop: "hidden",
    defaultValue: false,
  },
];

// 模块级显隐与归档判断：所有模块共用同一数据路径
const MODULE_CHECKS = {
  hidden: { path: ["ui", "hidden"] },
  removed: { path: ["ui", "archived"] },
} satisfies FieldChecks;

// 个人信息固定字段包裹组：标签与状态绑定结构一致，仅内层字段不同
const createUserField = (
  key: string,
  label: string,
  field: ObjectFormField,
  options: { tip?: string; addable?: boolean } = {},
): GroupFormField => {
  const { tip = "推荐必填", addable } = options;
  return {
    type: "group",
    component: "fieldItem",
    slot: "default",
    // 包裹组沿用字段标识，供字段顺序持久化与定位
    key,
    // 标签与操作区由包裹组件渲染，字段自身不再声明
    props: { label, tip },
    // 可添加字段：数据存在才渲染
    ...(addable ? { addable: true } : {}),
    // 字段状态绑定到包裹组，供包裹组件双向绑定
    model: [{ source: ["ui", key, "hidden"], prop: "hidden", defaultValue: false }],
    // 字段隐藏时的置灰判断
    checks: { hidden: { path: ["ui", key, "hidden"], equals: true } },
    fields: [{ ...field, ...(addable ? { addable: true } : {}) }],
  };
};

// 个人信息更多字段包裹组：图标、可移除/拖拽与字典绑定结构一致，仅标签与组件不同
const createMoreField = (options: {
  key: string;
  label: string;
  component: string;
  icon: string;
  tip?: string;
  addable?: boolean;
  // 字典 key：存在时内层字段同时绑定选项列表
  dict?: string;
  props?: Record<string, any>;
  rules?: any[];
}): GroupFormField => {
  const { key, label, component, icon, tip, addable, dict, props, rules } = options;
  return {
    type: "group",
    component: "fieldItem",
    slot: "default",
    // 包裹组沿用字段标识，供字段顺序持久化与定位
    key,
    // 标签与操作区由包裹组件渲染，字段自身不再声明
    props: { label, ...(tip ? { tip } : {}), removable: true, draggable: true },
    // 可添加字段：数据存在才渲染
    ...(addable ? { addable: true } : {}),
    // 字段状态绑定到包裹组，供包裹组件双向绑定
    model: [
      { source: ["ui", key, "hidden"], prop: "hidden", defaultValue: false },
      { source: ["ui", key, "icon"], prop: "icon", defaultValue: icon },
      // 副标题标记：序号存在字段自身的界面配置里，仅用于排序
      { source: ["ui", key, "subtitle"], prop: "subtitleOrder", defaultValue: 0 },
    ],
    // 字段隐藏时的置灰判断
    checks: { hidden: { path: ["ui", key, "hidden"], equals: true } },
    fields: [
      {
        type: "object",
        key,
        component,
        span: 24,
        ...(addable ? { addable: true } : {}),
        model: dict
          ? [
              { source: ["data", key], prop: "modelValue" },
              { source: ["__options", dict], prop: "list", raw: true },
            ]
          : { source: ["data", key], prop: "modelValue" },
        ...(props ? { props } : {}),
        ...(rules ? { rules } : {}),
      },
    ],
  };
};
// 个人信息
export const DEFAULT_USER_FORM = [
  {
    type: "group",
    component: "boxCollapse",
    key: "user",
    context: ["user"],
    drag: false,
    dragClass: DEFAULT_DRAG_CLASS,
    // 个人信息字段保持统一垂直间距
    rowClass: "gap-y-3",
    // 固定模块：不参与模块拖拽排序
    fixed: true,
    props: {
      add: false,
      drag: false,
    },
    model: createModuleState("个人信息"),
    checks: MODULE_CHECKS,
    slot: "default",
    fields: [
      // 头像
      {
        type: "object",
        key: "avatar",
        label: "头像",
        component: "imageUpload",
        span: 24,
        ui: {
          // 头像隐藏开关：控制头像在简历预览中显示或隐藏
          hidden: {
            source: ["ui", "avatar", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
        },
        checks: {
          hidden: {
            path: ["ui", "avatar", "hidden"],
            equals: true,
          },
        },
        model: [
          {
            source: ["data", "avatar"],
            prop: "modelValue",
          },
        ],
      },

      // 姓名
      createUserField("name", "姓名", {
        type: "object",
        key: "name",
        component: "input",
        span: 24,
        required: true,
        model: [
          {
            source: ["data", "name"],
            prop: "modelValue",
          },
        ],
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
      }),
      // 可添加信息：数据路径存在后渲染在选择入口上方
      {
        type: "group",
        drag: true,
        dragClass: DEFAULT_DRAG_CLASS,
        itemClass: DEFAULT_COL_CLASS + " py-1 px-1!",
        key: "more",
        component: "more",
        slot: "default",
        span: 24,
        // 可添加字段之间保持统一垂直间距
        rowClass: "gap-y-3",
        model: [
          {
            source: ["ui", "moreCollapsed"],
            prop: "collapsed",
            defaultValue: [],
          },
        ],
        fields: [
          // 出生日期
          createMoreField({
            key: "birthday",
            label: "出生日期",
            component: "datePicker",
            icon: "mdi:cake-variant",
            tip: "推荐必填",
            addable: true,
            props: {
              placeholder: "请选择出生日期",
              valueFormat: "YYYY.MM",
              type: "month",
            },
          }),
          // 性别
          createMoreField({
            key: "sex",
            label: "性别",
            component: "select",
            icon: "mdi:account",
            tip: "推荐必填",
            addable: true,
            dict: "sex",
            props: {
              placeholder: "请选择性别",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          }),
          // 婚姻状况
          createMoreField({
            key: "marital",
            label: "婚姻状况",
            component: "select",
            icon: "mdi:heart-outline",
            addable: true,
            dict: "marital",
            props: {
              placeholder: "请选择婚姻状况",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          }),
          // 民族
          createMoreField({
            key: "nation",
            label: "民族",
            component: "input",
            icon: "mdi:account-group-outline",
            addable: true,
            props: {
              placeholder: "请输入民族",
              clearable: true,
            },
          }),
          // 星座
          createMoreField({
            key: "zodiac",
            label: "星座",
            component: "select",
            icon: "lucide:star",
            addable: true,
            dict: "zodiac",
            props: {
              placeholder: "请选择星座",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          }),
          // MBTI
          createMoreField({
            key: "mbti",
            label: "MBTI",
            component: "input",
            icon: "ph:brain-duotone",
            addable: true,
            props: {
              placeholder: "请输入 MBTI",
              clearable: true,
            },
          }),
          // 求职岗位
          createMoreField({
            key: "position",
            label: "求职岗位",
            component: "input",
            icon: "lucide:briefcase",
            tip: "推荐必填",
            addable: true,
            props: {
              placeholder: "请输入求职岗位",
              clearable: true,
            },
          }),
          // 参加工作时间
          createMoreField({
            key: "workTime",
            label: "参加工作时间",
            component: "datePicker",
            icon: "mdi:briefcase-clock",
            tip: "推荐必填",
            addable: true,
            props: {
              placeholder: "请选择参加工作时间",
              valueFormat: "YYYY.MM",
              type: "month",
            },
          }),
          // 电话
          createMoreField({
            key: "phone",
            label: "电话",
            component: "input",
            icon: "mdi:phone",
            tip: "推荐必填",
            // 可添加字段：数据存在才渲染，删除后可从更多中重新添加
            addable: true,
            props: {
              placeholder: "请输入电话",
              clearable: true,
            },
            rules: [
              { required: true, message: "请输入电话", trigger: "blur" },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: "请输入正确的电话",
                trigger: "blur",
              },
            ],
          }),
          createMoreField({
            key: "email",
            label: "邮箱",
            component: "input",
            icon: "mdi:email-outline",
            addable: true,
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
          }),

          // 微信
          createMoreField({
            key: "wechat",
            label: "微信",
            component: "input",
            icon: "mdi:wechat",
            addable: true,
            props: {
              placeholder: "请输入微信",
              clearable: true,
            },
          }),
          // GitHub
          createMoreField({
            key: "github",
            label: "GitHub",
            component: "input",
            icon: "simple-icons:github",
            addable: true,
            props: {
              placeholder: "请输入 GitHub 地址",
              clearable: true,
            },
          }),
          // 求职状态
          createMoreField({
            key: "status",
            label: "求职状态",
            component: "select",
            icon: "mdi:briefcase-check-outline",
            addable: true,
            dict: "status",
            props: {
              placeholder: "请选择求职状态",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          }),
          // 政治面貌
          createMoreField({
            key: "political",
            label: "政治面貌",
            component: "select",
            icon: "mdi:flag-outline",
            addable: true,
            dict: "political",
            props: {
              placeholder: "请选择政治面貌",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          }),
          // 所在城市
          createMoreField({
            key: "city",
            label: "期望城市",
            component: "cityPicker",
            icon: "mdi:map-marker-outline",
            addable: true,
            dict: "city",
            props: {
              placeholder: "请选择城市",
            },
          }),
          createMoreField({
            key: "nativePlace",
            label: "籍贯",
            component: "cityPicker",
            icon: "mdi:home-outline",
            addable: true,
            dict: "city",
            props: {
              placeholder: "请选择籍贯",
            },
          }),
          // 期望薪资
          createMoreField({
            key: "salary",
            label: "期望薪资",
            component: "input",
            icon: "mdi:currency-cny",
            addable: true,
            props: {
              placeholder: "请输入期望薪资",
              clearable: true,
            },
          }),
          createMoreField({
            key: "heightWeight",
            label: "身高体重",
            component: "heightWeight",
            icon: "mdi:human-male-height",
            addable: true,
          }),
        ],
      },
    ],
  },
] satisfies FormField[];

// 社交账号
export const DEFAULT_ACCOUNT_FORM = {
  type: "group",
  key: "account",
  context: ["account"],
  span: 24,
  model: createModuleState("社交账号"),
  checks: MODULE_CHECKS,
  component: "boxCollapse",
  props: {
    add: true,
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " py-1 px-1!",
      itemSchema: {
        model: [
          {
            source: ["data", "name"],
            defaultValue: "",
            prop: "name",
          },
          {
            source: ["data", "url"],
            defaultValue: "",
            prop: "url",
          },
          {
            source: ["ui", "hidden"],
            defaultValue: false,
            prop: "hidden",
          },
        ],
        type: "object",
        component: "account",
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        required: true,
      },
    },
  ],
} satisfies FormField;
// 教育经历
export const DEFAULT_EDUCATION_FORM = {
  key: "education",
  type: "group",
  context: ["education"],
  component: "boxCollapse",
  props: {
    add: true,
  },
  model: createModuleState("教育经历"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        model: [
          {
            source: ["ui", "collapsed"],
            prop: "collapsed",
            defaultValue: EXPANDED,
          },
          {
            source: ["ui", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
          {
            source: ["data", "name"],
            prop: "name",
          },
        ],
        fields: [
          {
            type: "object",
            label: "学校名称",
            component: "input",
            required: true,
            span: 24,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如：北京大学",
              clearable: true,
            },
          },
          // 学校标签：可选标签由字段配置注入
          {
            type: "object",
            component: "tag",
            span: 24,
            model: {
              source: ["data", "tags"],
              prop: "modelValue",
              defaultValue: [],
            },
            props: {
              list: ["985", "211", "双一流", "C9联盟", "省重点"],
            },
          },
          // 学院名称
          {
            type: "object",
            label: "学院名称",
            component: "input",
            span: 12,
            model: {
              source: ["data", "college"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入学院名称",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "学位",
            component: "select",
            span: 6,
            required: true,
            model: [
              {
                source: ["data", "education"],
                prop: "modelValue",
              },
              {
                source: ["__options", "education"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择学位",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          },
          {
            type: "object",
            label: "学制",
            component: "select",
            required: true,
            span: 6,
            model: [
              {
                source: ["data", "mode"],
                prop: "modelValue",
              },
              {
                source: ["__options", "mode"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择学制",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          },
          {
            type: "object",
            label: "开始时间",
            required: true,
            component: "datePicker",
            span: 12,
            model: {
              source: ["data", "startTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择开始时间",
            },
          },
          {
            type: "object",
            label: "结束时间",
            required: true,
            component: "datePickerPresent",
            span: 12,
            model: {
              source: ["data", "endTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择结束时间",
              presentText: "至今",
            },
          },
          {
            type: "object",
            label: "专业",
            component: "input",
            required: true,
            span: 12,
            model: {
              source: ["data", "post"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入专业",
              clearable: true,
            },
          },

          // 所在城市：省市字典由业务域注入
          {
            type: "object",
            label: "所在城市",
            component: "cityPicker",
            span: 12,
            model: [
              {
                source: ["data", "city"],
                prop: "modelValue",
              },
              {
                source: ["__options", "city"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择所在城市",
            },
          },
          {
            type: "object",
            label: "经历",
            component: "wangEditor",
            span: 24,
            model: {
              source: ["data", "content"],
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
  context: ["skill"],
  props: {
    add: false,
  },
  model: createModuleState("专业技能"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "object",
      component: "wangEditor",
      required: true,
      model: {
        source: ["data", "content"],
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
  context: ["advantage"],
  props: {
    add: false,
  },
  model: createModuleState("个人优势"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "object",
      component: "wangEditor",
      required: true,
      model: {
        source: ["data", "content"],
        prop: "modelValue",
      },
    },
  ],
} satisfies FormField;
// 工作经历
export const DEFAULT_WORK_FORM = {
  type: "group",
  key: "work",
  context: ["work"],
  component: "boxCollapse",
  props: {
    add: true,
  },
  model: createModuleState("工作经历"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        model: [
          {
            source: ["ui", "collapsed"],
            prop: "collapsed",
            defaultValue: EXPANDED,
          },
          {
            source: ["ui", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
          {
            source: ["data", "name"],
            prop: "name",
          },
        ],
        fields: [
          {
            type: "object",
            label: "公司名称",
            component: "input",
            required: true,
            span: 24,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入公司",
              clearable: true,
            },
          },
          // 工作标签：可选标签由字段配置注入
          {
            type: "object",
            component: "tag",
            span: 24,
            model: {
              source: ["data", "tags"],
              prop: "modelValue",
              defaultValue: [],
            },
            props: {
              list: ["核心成员", "团队管理", "独立负责", "跨部门协作", "从0到1"],
            },
          },
          // 所在部门
          {
            type: "object",
            label: "所在部门",
            component: "input",
            span: 12,
            model: {
              source: ["data", "department"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入所在部门",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "开始时间",
            required: true,
            component: "datePicker",
            span: 12,
            model: {
              source: ["data", "startTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择开始时间",
            },
          },
          {
            type: "object",
            label: "结束时间",
            required: true,
            component: "datePickerPresent",
            span: 12,
            model: {
              source: ["data", "endTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择结束时间",
              presentText: "至今",
            },
          },
          {
            type: "object",
            label: "岗位",
            component: "input",
            required: true,
            span: 12,
            model: {
              source: ["data", "post"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入岗位",
              clearable: true,
            },
          },
          // 所在城市：省市字典由业务域注入
          {
            type: "object",
            label: "所在城市",
            component: "cityPicker",
            span: 12,
            model: [
              {
                source: ["data", "city"],
                prop: "modelValue",
              },
              {
                source: ["__options", "city"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择所在城市",
            },
          },
          {
            type: "object",
            label: "经历",
            required: true,
            component: "wangEditor",
            span: 24,
            model: {
              source: ["data", "content"],
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
  context: ["project"],
  component: "boxCollapse",
  props: {
    add: true,
  },
  model: createModuleState("项目经历"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        model: [
          {
            source: ["ui", "collapsed"],
            prop: "collapsed",
            defaultValue: EXPANDED,
          },
          {
            source: ["ui", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
          {
            source: ["data", "name"],
            prop: "name",
          },
        ],
        // 子项字段列表：纯 schema 声明
        fields: [
          {
            type: "object",
            label: "项目名称",
            component: "input",
            required: true,
            span: 24,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入项目名称",
              clearable: true,
            },
          },
          // 项目标签：可选标签由字段配置注入
          {
            type: "object",
            component: "tag",
            span: 24,
            model: {
              source: ["data", "tags"],
              prop: "modelValue",
              defaultValue: [],
            },
            props: {
              list: ["核心项目", "独立负责", "已上线", "开源项目", "团队协作"],
            },
          },
          // 所在部门
          {
            type: "object",
            label: "所在部门",
            component: "input",
            span: 12,
            model: {
              source: ["data", "department"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入所在部门",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "开始时间",
            required: true,
            component: "datePicker",
            span: 12,
            model: {
              source: ["data", "startTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择开始时间",
            },
          },
          {
            type: "object",
            label: "结束时间",
            required: true,
            component: "datePickerPresent",
            span: 12,
            model: {
              source: ["data", "endTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择结束时间",
              presentText: "至今",
            },
          },
          {
            type: "object",
            label: "岗位",
            component: "input",
            required: true,
            span: 12,
            model: {
              source: ["data", "post"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入岗位",
              clearable: true,
            },
          },
          // 所在城市：省市字典由业务域注入
          {
            type: "object",
            label: "所在城市",
            component: "cityPicker",
            span: 12,
            model: [
              {
                source: ["data", "city"],
                prop: "modelValue",
              },
              {
                source: ["__options", "city"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择所在城市",
            },
          },
          {
            type: "object",
            label: "经历",
            component: "wangEditor",
            required: true,
            span: 24,
            model: {
              source: ["data", "content"],
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
  context: ["video"],
  component: "boxCollapse",
  props: {
    add: true,
    tip: "该模块会将视频地址转换为二维码，方便在简历中展示",
  },
  model: createModuleState("视频作品"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        // 折叠标题数据源：展示当前视频名称
        model: [
          {
            source: ["ui", "collapsed"],
            prop: "collapsed",
            defaultValue: EXPANDED,
          },
          {
            source: ["ui", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
          {
            source: ["data", "name"],
            prop: "name",
          },
        ],
        fields: [
          {
            model: [
              {
                source: ["data", "name"],
                defaultValue: "",
                prop: "name",
              },
              {
                source: ["data", "url"],
                defaultValue: "",
                prop: "url",
              },
              {
                source: ["data", "desc"],
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
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        required: true,
      },
    },
  ],
} satisfies FormField;
// 图片作品
export const DEFAULT_IMAGE_FORM = {
  type: "group",
  key: "image",
  context: ["image"],
  component: "boxCollapse",
  props: {
    add: true,
  },
  model: createModuleState("图片作品"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        // 折叠标题数据源：展示当前图片作品名称
        model: [
          {
            source: ["ui", "collapsed"],
            prop: "collapsed",
            defaultValue: EXPANDED,
          },
          {
            source: ["ui", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
          {
            source: ["data", "name"],
            prop: "name",
          },
        ],
        fields: [
          {
            model: [
              {
                source: ["data", "name"],
                defaultValue: "",
                prop: "name",
              },
              {
                source: ["data", "img"],
                defaultValue: "",
                prop: "img",
              },
              {
                source: ["data", "desc"],
                defaultValue: "",
                prop: "desc",
              },
              {
                source: ["data", "size"],
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
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        required: true,
      },
    },
  ],
} satisfies FormField;
// 荣誉证书
export const DEFAULT_HONOR_FORM = {
  type: "group",
  component: "boxCollapse",
  key: "honor",
  context: ["honor"],
  props: {
    add: true,
  },
  model: createModuleState("荣誉证书"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " py-1 px-1!",

      itemSchema: {
        // 名称数据源：绑定当前荣誉证书名称
        model: [
          {
            source: ["data", "name"],
            defaultValue: "",
            prop: "name",
          },
          {
            source: ["ui", "hidden"],
            defaultValue: false,
            prop: "hidden",
          },
        ],
        type: "object",
        component: "honor",
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        required: true,
      },
    },
  ],
} satisfies FormField;
// 自定义经历
export const DEFAULT_CUSTOM_FORM = {
  type: "group",
  key: "custom",
  context: ["custom"],
  component: "boxCollapse",
  props: {
    add: true,
  },
  model: createModuleState(""),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        type: "group",
        component: "itemCollapse",
        slot: "default",
        span: 24,
        checks: {
          hidden: {
            path: ["ui", "hidden"],
            equals: true,
          },
        },
        model: [
          {
            source: ["ui", "collapsed"],
            prop: "collapsed",
            defaultValue: EXPANDED,
          },
          {
            source: ["ui", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
          {
            source: ["data", "name"],
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
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入名称",
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
              source: ["data", "post"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入职位",
              clearable: true,
            },
          },
          {
            type: "object",
            required: true,
            label: "开始时间",
            component: "datePicker",
            span: 12,
            model: {
              source: ["data", "startTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择开始时间",
            },
          },
          {
            type: "object",
            required: true,
            label: "结束时间",
            component: "datePickerPresent",
            span: 12,
            model: {
              source: ["data", "endTime"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择结束时间",
              presentText: "至今",
            },
          },
          {
            type: "object",
            label: "经历",
            required: true,
            component: "wangEditor",
            span: 24,
            model: {
              source: ["data", "content"],
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
  honor: DEFAULT_HONOR_FORM,
  custom: DEFAULT_CUSTOM_FORM,
} satisfies Record<string, FormField | FormField[]>;
