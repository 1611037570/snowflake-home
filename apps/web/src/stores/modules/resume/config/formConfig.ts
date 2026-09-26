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
// 个人信息「更多」字段的分类顺序：编辑器按此顺序分组展示
export const MORE_CATEGORIES = ["基本信息", "联系方式", "求职意向", "个性标签"];

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
    component: "rowField",
    slot: "default",
    // 包裹组沿用字段标识，供字段顺序持久化与定位
    key,
    // 标签与操作区由包裹组件渲染，字段自身不再声明
    props: { label, tip },
    // 可添加字段：数据存在才渲染
    ...(addable ? { addable: true } : {}),
    // 字段状态绑定到包裹组，供包裹组件双向绑定
    model: [{ source: ["ui", key, "hidden"], prop: "hidden", defaultValue: false }],
    fields: [{ ...field, ...(addable ? { addable: true } : {}) }],
  };
};

// 个人信息更多字段包裹组：图标、可移除/拖拽与字典绑定结构一致，仅标签与组件不同
const createMoreField = (options: {
  key: string;
  label: string;
  component: string;
  iconKey: string;
  tip?: string;
  addable?: boolean;
  // 所属分类：供编辑器「更多」分区归类展示
  category?: string;
  // 展示形态选项：声明后编辑器提供切换，预览按选中形态展示
  displayOptions?: { label: string; value: string }[];
  // 字典 key：存在时内层字段同时绑定选项列表
  dict?: string;
  props?: Record<string, any>;
  rules?: any[];
}): GroupFormField => {
  const {
    key,
    label,
    component,
    iconKey,
    tip,
    addable,
    category,
    displayOptions,
    dict,
    props,
    rules,
  } = options;
  return {
    type: "group",
    component: "rowField",
    slot: "default",
    // 包裹组沿用字段标识，供字段顺序持久化与定位
    key,
    // 标签与操作区由包裹组件渲染，字段自身不再声明
    props: {
      label,
      ...(tip ? { tip } : {}),
      ...(category ? { category } : {}),
      ...(displayOptions ? { displayOptions } : {}),
      removable: true,
      draggable: true,
    },
    // 可添加字段：数据存在才渲染
    ...(addable ? { addable: true } : {}),
    // 字段状态绑定到包裹组，供包裹组件双向绑定
    model: [
      { source: ["ui", key, "hidden"], prop: "hidden", defaultValue: false },
      { source: ["ui", key, "icon"], prop: "icon", defaultValue: iconKey },
      // 展示形态：默认取首个选项，保证初始展示与预览口径一致
      ...(displayOptions
        ? [
            {
              source: ["ui", key, "display"],
              prop: "display",
              defaultValue: displayOptions[0]?.value,
            },
          ]
        : []),
    ],
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
    component: "collapseModule",
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
      // 副标题分区：承载已标记为副标题的更多字段，顺序即姓名下方展示顺序
      {
        type: "group",
        component: "subtitleBox",
        slot: "default",
        key: "subtitle",
        // 无字段或字段均未添加数据时不渲染，避免外层表单项空占位
        hideWhenEmpty: true,
        drag: true,
        dragClass: DEFAULT_DRAG_CLASS,
        itemClass: DEFAULT_COL_CLASS + " py-1 px-1!",
        rowClass: "gap-y-3",
        span: 24,
        fields: [],
      },
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
            // 默认展开，便于直接看到可添加字段
            defaultValue: EXPANDED,
          },
        ],
        fields: [
          // 出生日期
          createMoreField({
            key: "birthday",
            label: "出生日期",
            category: "基本信息",
            component: "datePicker",
            iconKey: "personal-birthday",
            tip: "推荐必填",
            addable: true,
            // 展示形态：简历上展示年龄或出生日期
            displayOptions: [
              { label: "年龄", value: "age" },
              { label: "出生日期", value: "date" },
            ],
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
            category: "基本信息",
            component: "select",
            iconKey: "personal-account",
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
          // 文化水平复用教育经历中的学历选项
          createMoreField({
            key: "educationLevel",
            label: "文化水平",
            category: "基本信息",
            component: "select",
            iconKey: "education-graduation",
            addable: true,
            dict: "education",
            props: {
              placeholder: "请选择文化水平",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          }),
          // 婚姻状况
          createMoreField({
            key: "marital",
            label: "婚姻状况",
            category: "基本信息",
            component: "select",
            iconKey: "personal-marital",
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
            category: "基本信息",
            component: "input",
            iconKey: "personal-nation",
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
            category: "个性标签",
            component: "select",
            iconKey: "hobby-star",
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
            category: "个性标签",
            component: "input",
            iconKey: "skill-brain",
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
            category: "求职意向",
            component: "input",
            iconKey: "work-briefcase",
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
            category: "求职意向",
            component: "datePicker",
            iconKey: "work-time",
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
            category: "联系方式",
            component: "input",
            iconKey: "contact-phone",
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
            category: "联系方式",
            component: "input",
            iconKey: "contact-email",
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
            category: "联系方式",
            component: "input",
            iconKey: "social-wechat",
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
            category: "联系方式",
            component: "input",
            iconKey: "social-github",
            addable: true,
            props: {
              placeholder: "请输入 GitHub 地址",
              clearable: true,
            },
          }),
          createMoreField({
            key: "linkedin",
            label: "LinkedIn",
            category: "联系方式",
            component: "input",
            iconKey: "social-linkedin",
            addable: true,
            props: {
              placeholder: "请输入 LinkedIn 地址",
              clearable: true,
            },
          }),
          // 求职状态
          createMoreField({
            key: "status",
            label: "求职状态",
            category: "求职意向",
            component: "select",
            iconKey: "work-status",
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
            category: "基本信息",
            component: "select",
            iconKey: "personal-political",
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
            category: "求职意向",
            component: "cityPicker",
            iconKey: "contact-city",
            addable: true,
            dict: "city",
            props: {
              placeholder: "请选择城市",
            },
          }),
          createMoreField({
            key: "nativePlace",
            label: "籍贯",
            category: "基本信息",
            component: "cityPicker",
            iconKey: "contact-native-place",
            addable: true,
            dict: "city",
            props: {
              placeholder: "请选择籍贯",
            },
          }),
          createMoreField({
            key: "currentCity",
            label: "现居城市",
            category: "基本信息",
            component: "cityPicker",
            iconKey: "personal-current-city",
            addable: true,
            dict: "city",
            props: {
              placeholder: "请选择现居城市",
            },
          }),
          // 期望薪资
          createMoreField({
            key: "salary",
            label: "期望薪资",
            category: "求职意向",
            component: "input",
            iconKey: "personal-salary",
            addable: true,
            props: {
              placeholder: "请输入期望薪资",
              clearable: true,
            },
          }),
          createMoreField({
            key: "heightWeight",
            label: "身高体重",
            category: "基本信息",
            component: "heightWeight",
            iconKey: "personal-height-weight",
            addable: true,
          }),
          createMoreField({
            key: "measurements",
            label: "三围",
            category: "基本信息",
            component: "measurements",
            iconKey: "personal-height-weight",
            addable: true,
          }),
          createMoreField({
            key: "sizes",
            label: "尺码",
            category: "基本信息",
            component: "sizes",
            iconKey: "other-tag",
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
  component: "collapseModule",
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
        component: "rowAccount",
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
  component: "collapseModule",
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
        component: "collapseItem",
        slot: "default",
        span: 24,
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
          {
            type: "object",
            label: "项目链接",
            component: "projectLink",
            span: 24,
            model: {
              source: ["data", "link"],
              prop: "modelValue",
              defaultValue: {},
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
              list: ["985", "211", "双一流"],
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
  component: "collapseModule",
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
  component: "collapseModule",
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
  component: "collapseModule",
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
        component: "collapseItem",
        slot: "default",
        span: 24,
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
          {
            type: "object",
            label: "项目链接",
            component: "projectLink",
            span: 24,
            model: {
              source: ["data", "link"],
              prop: "modelValue",
              defaultValue: {},
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
  component: "collapseModule",
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
        component: "collapseItem",
        slot: "default",
        span: 24,
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
          {
            type: "object",
            label: "项目链接",
            component: "projectLink",
            span: 24,
            model: {
              source: ["data", "link"],
              prop: "modelValue",
              defaultValue: {},
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
              list: ["已上线", "开源项目", "独立负责", "团队协作", "性能优化"],
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
  component: "collapseModule",
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
        component: "collapseItem",
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
  context: ["image"],
  component: "collapseModule",
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
        component: "collapseItem",
        slot: "default",
        span: 24,
        required: true,
      },
    },
  ],
} satisfies FormField;
// 荣誉证书
export const DEFAULT_HONOR_FORM = {
  type: "group",
  component: "collapseModule",
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
        component: "rowHonor",
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
  component: "collapseModule",
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
        component: "collapseItem",
        slot: "default",
        span: 24,
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
            span: 24,
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
            label: "项目链接",
            component: "projectLink",
            span: 24,
            model: {
              source: ["data", "link"],
              prop: "modelValue",
              defaultValue: {},
            },
          },
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
