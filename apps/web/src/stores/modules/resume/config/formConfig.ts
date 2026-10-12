import type {
  DynamicFormRule,
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
// 个人信息「更多」字段先展示常用项，再展示基本信息及其他分类
export const MORE_CATEGORIES = ["常用", "基本信息", "联系方式", "求职意向", "个性标签"];

const DEFAULT_META = {
  version: "1.0.0",
};
const DEFAULT_DRAG_CLASS = ".item-drag";
// 个人信息内部字段恢复独立的圆角边框卡片。
const DEFAULT_COL_CLASS = "rounded-3xl border border-sf-b bg-sf-primary";
// 必填与日期格式规则统一供完成度统计和 ATS 检查读取。
const requiredFieldRule = () => ({ required: true, message: "请填写此项", trigger: "blur" });
// ATS 规则仅生成分析提醒，不阻止用户保存字段内容。
const atsRule = (type: string, options: Record<string, any> = {}): DynamicFormRule => ({
  // 明确规则契约，提示等级保持合法枚举而非推断为任意字符串
  ats: { type, severity: "warning", ...options },
});
const contentQualityRule = () => atsRule("contentQuality");
const MONTH_FORMAT_RULE = {
  pattern: /^\d{4}\.(0[1-9]|1[0-2])$/,
  message: "日期格式应为 YYYY.MM",
  trigger: "blur",
};
const MONTH_PRESENT_FORMAT_RULE = {
  pattern: /^(\d{4}\.(0[1-9]|1[0-2])|至今)$/,
  message: "日期格式应为 YYYY.MM 或 至今",
  trigger: "blur",
};

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

// 模块级归档判断：所有模块共用同一数据路径（隐藏状态改由业务直接读写 ui.hidden）
const MODULE_CHECKS = {
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
    // 固定字段与可添加字段统一圆角边框及上下左右留白。
    colClass: DEFAULT_COL_CLASS + " py-1 px-3!",
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
    // 卡片之间保留纵向间距，外层提供左右及顶部留白以避免贴边。
    rowClass: "gap-y-3 px-3 pt-3",
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
        // 头像与其他个人信息字段统一圆角边框及上下左右留白。
        colClass: DEFAULT_COL_CLASS + " py-1 px-3!",
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
        itemClass: DEFAULT_COL_CLASS + " py-1 px-3!", // 副标题字段恢复圆角边框及统一卡片底色，保留内部留白。
        // 副标题内部卡片保留纵向间距，避免边框紧贴。
        rowClass: "gap-y-3",
        span: 24,
        fields: [],
      },
      // 可添加信息：数据路径存在后渲染在选择入口上方
      {
        type: "group",
        drag: true,
        dragClass: DEFAULT_DRAG_CLASS,
        itemClass: DEFAULT_COL_CLASS + " py-1 px-3!", // 更多字段统一圆角边框及上下左右留白。
        key: "more",
        component: "more",
        slot: "default",
        span: 24,
        // 更多字段内部卡片保留纵向间距，避免边框紧贴。
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
          // 年龄通过出生日期计算，也可切换为展示日期
          createMoreField({
            key: "birthday",
            label: "年龄",
            category: "常用",
            component: "datePicker",
            iconKey: "personal-birthday",
            rules: [MONTH_FORMAT_RULE],
            tip: "推荐必填",
            addable: true,
            // 展示形态：简历上展示年龄或日期
            displayOptions: [
              { label: "年龄", value: "age" },
              { label: "日期", value: "date" },
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
            category: "常用",
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
          // 个人学历复用教育经历中的学历选项
          createMoreField({
            key: "educationLevel",
            label: "学历",
            category: "常用",
            component: "select",
            iconKey: "education-graduation",
            addable: true,
            dict: "education",
            props: {
              placeholder: "请选择学历",
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
            component: "select",
            iconKey: "skill-brain",
            addable: true,
            dict: "mbti",
            props: {
              placeholder: "请选择 MBTI",
              clearable: true,
              filterable: true,
            },
          }),
          // 求职岗位
          createMoreField({
            key: "position",
            label: "求职岗位",
            category: "求职意向",
            component: "positionPicker",
            iconKey: "work-briefcase",
            tip: "推荐必填",
            addable: true,
            dict: "position",
            props: {
              placeholder: "请选择或输入求职岗位",
            },
          }),
          // 参加工作时间
          createMoreField({
            key: "workTime",
            label: "参加工作时间",
            category: "求职意向",
            component: "datePicker",
            iconKey: "work-time",
            rules: [MONTH_FORMAT_RULE],
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
            category: "常用",
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
            category: "常用",
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
            rules: [atsRule("wechat")],
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
            rules: [atsRule("url")],
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
            rules: [atsRule("url")],
          }),
          // 个人网站链接
          createMoreField({
            key: "website",
            label: "个人网站",
            category: "联系方式",
            component: "input",
            iconKey: "social-account",
            tip: "用于展示个人主页、作品集或专业资料",
            addable: true,
            props: {
              placeholder: "请输入个人网站地址",
              clearable: true,
            },
            rules: [atsRule("url")],
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
          createMoreField({
            key: "arrivalTime",
            label: "到岗时间",
            category: "求职意向",
            component: "select",
            iconKey: "work-time",
            addable: true,
            dict: "arrivalTime",
            props: {
              placeholder: "请选择到岗时间",
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
          // 生源地用于校招等招聘场景填写
          createMoreField({
            key: "sourcePlace",
            label: "生源地",
            category: "基本信息",
            component: "cityPicker",
            iconKey: "contact-native-place",
            tip: "用于校招等招聘场景填写生源地，一般按招聘要求填写",
            addable: true,
            dict: "city",
            props: {
              placeholder: "请选择生源地",
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
            component: "salaryRange",
            iconKey: "personal-salary",
            addable: true,
            rules: [atsRule("salaryRange")],
          }),
          createMoreField({
            key: "heightWeight",
            label: "身高体重",
            category: "基本信息",
            component: "heightWeight",
            iconKey: "personal-height-weight",
            addable: true,
            rules: [
              atsRule("numberFields", {
                fields: [
                  { key: "height", label: "height", min: 100, max: 250 },
                  { key: "weight", label: "weight", min: 25, max: 300 },
                ],
              }),
            ],
          }),
          createMoreField({
            key: "measurements",
            label: "三围",
            category: "基本信息",
            component: "measurements",
            iconKey: "personal-height-weight",
            addable: true,
            rules: [
              atsRule("numberFields", {
                fields: [
                  { key: "bust", label: "bust", min: 30, max: 250 },
                  { key: "waist", label: "waist", min: 30, max: 250 },
                  { key: "hip", label: "hip", min: 30, max: 250 },
                ],
              }),
            ],
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
// 数组记录恢复独立圆角卡片及完整边框。
const AAA = "rounded-3xl border border-sf-b bg-sf-primary";

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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " py-1 px-3!", // 记录保留内部留白并显示圆角边框。
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
        rules: [requiredFieldRule(), atsRule("socialLink")],
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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
            rules: [requiredFieldRule()],
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
            rules: [atsRule("projectLink")],
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
              list: [
                "985",
                "211",
                "双一流",
                "C9",
                "QS Top 100",
                "US News Top 100",
                "THE Top 100",
                "ARWU Top 100",
              ],
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
            label: "学历",
            component: "select",
            span: 6,
            rules: [requiredFieldRule()],
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
              placeholder: "请选择学历",
              clearable: true,
              filterable: true,
              allowCreate: true,
            },
          },
          {
            type: "object",
            label: "学制",
            component: "select",
            rules: [requiredFieldRule()],
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
            rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            component: "positionPicker",
            rules: [requiredFieldRule()],
            span: 12,
            model: [
              {
                source: ["data", "post"],
                prop: "modelValue",
              },
              {
                source: ["__options", "major"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择或输入专业",
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
            component: "resumeContentEditor",
            rules: [contentQualityRule()],
            span: 24,
            props: {
              kind: "education",
            },
            model: [
              {
                source: ["data", "content"],
                prop: "modelValue",
              },
            ],
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
      component: "resumeContentEditor",
      rules: [requiredFieldRule(), contentQualityRule()],
      props: {
        kind: "skill",
      },
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
      component: "resumeContentEditor",
      rules: [requiredFieldRule(), contentQualityRule()],
      props: {
        kind: "advantage",
      },
      model: {
        source: ["data", "content"],
        prop: "modelValue",
      },
    },
  ],
} satisfies FormField;
// 顶部标语
export const DEFAULT_SLOGAN_FORM = {
  type: "group",
  component: "collapseModule",
  key: "slogan",
  context: ["slogan"],
  props: {
    add: false,
  },
  model: createModuleState("顶部标语"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    // 标语字段直接声明数据绑定：字段 key 不能与模块状态 key（ui.title / ui.hidden）重名，
    // 否则字段的隐藏状态会写到模块标题上，编辑器面板读写时报错。
    {
      type: "object",
      key: "title",
      label: "标题",
      component: "input",
      span: 24,
      model: [
        {
          source: ["data", "title"],
          prop: "modelValue",
        },
      ],
      props: {
        placeholder: "请输入标题，例如：个人简历",
        clearable: true,
      },
    },
    {
      type: "object",
      key: "subtitle",
      label: "标语",
      component: "input",
      span: 24,
      model: [
        {
          source: ["data", "subtitle"],
          prop: "modelValue",
        },
      ],
      props: {
        placeholder: "请输入一句话标语",
        clearable: true,
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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
          // 基础信息优先展示，岗位与部门、起止时间分别成对排列。
          {
            type: "object",
            label: "公司名称",
            component: "input",
            rules: [requiredFieldRule()],
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
            label: "岗位",
            component: "positionPicker",
            rules: [requiredFieldRule()],
            span: 12,
            model: [
              {
                source: ["data", "post"],
                prop: "modelValue",
              },
              {
                source: ["__options", "position"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择或输入岗位",
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
            rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
          // 所在城市：省市字典由业务域注入
          {
            type: "object",
            label: "所在城市",
            component: "cityPicker",
            span: 24,
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
            label: "项目链接",
            component: "projectLink",
            rules: [atsRule("projectLink")],
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
          {
            type: "object",
            label: "经历",
            rules: [requiredFieldRule(), contentQualityRule()],
            component: "resumeContentEditor",
            span: 24,
            props: {
              kind: "work",
            },
            model: [
              {
                source: ["data", "content"],
                prop: "modelValue",
              },
            ],
          },
        ],
      },
    },
  ],
} satisfies FormField;
// 实习经历独立保存，复用工作经历字段及记录操作，不共享配置引用。
export const DEFAULT_INTERNSHIP_FORM = {
  ...structuredClone(DEFAULT_WORK_FORM), // 实习字段与工作经历使用相同表单结构。
  key: "internship", // 实习经历模块标识。
  context: ["internship"], // 实习经历数据绑定路径。
  model: createModuleState("实习经历"), // 实习模块标题与界面状态绑定。
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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
            rules: [requiredFieldRule()],
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
            rules: [atsRule("projectLink")],
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
            rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            component: "positionPicker",
            rules: [requiredFieldRule()],
            span: 12,
            model: [
              {
                source: ["data", "post"],
                prop: "modelValue",
              },
              {
                source: ["__options", "position"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择或输入岗位",
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
            component: "resumeContentEditor",
            rules: [requiredFieldRule(), contentQualityRule()],
            span: 24,
            props: {
              kind: "project",
            },
            model: [
              {
                source: ["data", "content"],
                prop: "modelValue",
              },
            ],
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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
            rules: [requiredFieldRule()],
          },
        ],
        type: "group",
        component: "collapseItem",
        slot: "default",
        span: 24,
        rules: [requiredFieldRule()],
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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
            rules: [requiredFieldRule()],
          },
        ],
        type: "group",
        component: "collapseItem",
        slot: "default",
        span: 24,
        rules: [requiredFieldRule()],
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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " py-1 px-3!", // 荣誉记录左右留白与其他模块保持一致。

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
        rules: [requiredFieldRule()],
      },
    },
  ],
} satisfies FormField;
// 学术论文：论文的价值维度是发表载体、作者位次与索引分区，与经历类模块的职责岗位结构不同，独立声明字段
export const DEFAULT_PUBLICATION_FORM = {
  type: "group",
  component: "collapseModule",
  key: "publication",
  context: ["publication"],
  props: {
    add: true,
  },
  model: createModuleState("学术论文"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
          // 折叠项标题取论文标题
          {
            source: ["data", "title"],
            prop: "name",
          },
        ],
        fields: [
          // 论文标题
          {
            type: "object",
            label: "论文标题",
            component: "input",
            rules: [requiredFieldRule()],
            span: 24,
            model: {
              source: ["data", "title"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入论文标题",
              clearable: true,
            },
          },
          // 作者列表：按署名顺序填写，渲染时自动加粗本人姓名
          {
            type: "object",
            label: "作者",
            component: "input",
            rules: [requiredFieldRule()],
            span: 24,
            model: {
              source: ["data", "authors"],
              prop: "modelValue",
            },
            props: {
              placeholder: "按署名顺序填写，用逗号分隔",
              clearable: true,
            },
          },
          // 本人位次：一作、共一与通讯作者在求职场景下权重不同，需单独记录
          {
            type: "object",
            label: "本人位次",
            component: "select",
            rules: [requiredFieldRule()],
            span: 12,
            model: [
              {
                source: ["data", "authorOrder"],
                prop: "modelValue",
              },
              {
                source: ["__options", "publicationAuthorOrder"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择本人位次",
              clearable: true,
            },
          },
          // 发表状态：在审与已发表对招聘方的含义不同，需明确区分
          {
            type: "object",
            label: "发表状态",
            component: "select",
            rules: [requiredFieldRule()],
            span: 12,
            model: [
              {
                source: ["data", "status"],
                prop: "modelValue",
              },
              {
                source: ["__options", "publicationStatus"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择发表状态",
              clearable: true,
            },
          },
          // 期刊或会议名称：渲染为斜体，符合学术引用惯例
          {
            type: "object",
            label: "期刊 / 会议",
            component: "input",
            rules: [requiredFieldRule()],
            span: 24,
            model: {
              source: ["data", "venue"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入期刊或会议全称",
              clearable: true,
            },
          },
          // 卷期页码
          {
            type: "object",
            label: "卷期页码",
            component: "input",
            span: 12,
            model: {
              source: ["data", "volumeInfo"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如 36(6):2411-2425",
              clearable: true,
            },
          },
          // 发表时间：论文为单时间点，取年月即可
          {
            type: "object",
            label: "发表时间",
            component: "datePicker",
            rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
            span: 12,
            model: {
              source: ["data", "date"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择发表时间",
            },
          },
          // DOI 或论文链接：可核验的出处比描述更有说服力
          {
            type: "object",
            label: "DOI / 论文链接",
            component: "input",
            span: 24,
            model: {
              source: ["data", "doi"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如 10.1109/TKDE.2024.1234567 或论文主页地址",
              clearable: true,
            },
          },
          // 索引标签：预设常见索引与分区，同时支持回车自定义
          {
            type: "object",
            component: "tag",
            span: 24,
            model: {
              source: ["data", "indexTags"],
              prop: "modelValue",
              defaultValue: [],
            },
            props: {
              list: ["SCI 一区", "SCI 二区", "EI 收录", "CCF-A", "CCF-B", "北大核心", "代表作"],
            },
          },
          // 研究内容：个人贡献与该成果的价值
          {
            type: "object",
            label: "研究内容",
            component: "resumeContentEditor",
            span: 24,
            props: {
              kind: "publication",
            },
            model: [
              {
                source: ["data", "content"],
                prop: "modelValue",
              },
            ],
          },
        ],
      },
    },
  ],
} satisfies FormField;
// 知识产权：专利与软著同属法律确权类成果，共用确权编号、状态与受理机构结构
export const DEFAULT_IP_FORM = {
  type: "group",
  component: "collapseModule",
  key: "ip",
  context: ["ip"],
  props: {
    add: true,
  },
  model: createModuleState("知识产权"),
  checks: MODULE_CHECKS,
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
          // 折叠项标题取成果名称
          {
            source: ["data", "title"],
            prop: "name",
          },
        ],
        fields: [
          // 成果类型：专利与软著的编号口径与状态不同，据此区分
          {
            type: "object",
            label: "成果类型",
            component: "select",
            rules: [requiredFieldRule()],
            span: 12,
            model: [
              {
                source: ["data", "type"],
                prop: "modelValue",
              },
              {
                source: ["__options", "ipType"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择成果类型",
              clearable: true,
            },
          },
          // 确权状态：受理、审查与授权对招聘方的含义不同
          {
            type: "object",
            label: "确权状态",
            component: "select",
            rules: [requiredFieldRule()],
            span: 12,
            model: [
              {
                source: ["data", "status"],
                prop: "modelValue",
              },
              {
                source: ["__options", "ipStatus"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择确权状态",
              clearable: true,
            },
          },
          // 成果名称
          {
            type: "object",
            label: "成果名称",
            component: "input",
            rules: [requiredFieldRule()],
            span: 24,
            model: {
              source: ["data", "title"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入专利名称或软件全称",
              clearable: true,
            },
          },
          // 版本号：专利与软件著作权共用同一套字段，不随成果类型增删
          {
            type: "object",
            label: "版本号",
            component: "input",
            span: 24,
            model: {
              source: ["data", "version"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如 V1.0",
              clearable: true,
            },
          },
          // 发明人或著作权人
          {
            type: "object",
            label: "发明人 / 著作权人",
            component: "input",
            rules: [requiredFieldRule()],
            span: 12,
            model: {
              source: ["data", "holders"],
              prop: "modelValue",
            },
            props: {
              placeholder: "按署名顺序填写，用逗号分隔",
              clearable: true,
            },
          },
          // 发明人位次：第一发明人与其他位次在求职场景下权重不同，需单独记录
          {
            type: "object",
            label: "发明人位次",
            component: "select",
            span: 12,
            model: [
              {
                source: ["data", "authorOrder"],
                prop: "modelValue",
              },
              {
                source: ["__options", "ipAuthorOrder"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择发明人位次",
              clearable: true,
            },
          },
          // 专利号或软著登记号
          {
            type: "object",
            label: "专利号 / 登记号",
            component: "input",
            span: 24,
            model: {
              source: ["data", "number"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如 CN202410123456.7 或 2024SR1234567",
              clearable: true,
            },
          },
          // 受理机构或登记机构
          {
            type: "object",
            label: "受理 / 登记机构",
            component: "input",
            span: 24,
            model: {
              source: ["data", "authority"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如 国家知识产权局、中国版权保护中心",
              clearable: true,
            },
          },
          // 申请日或登记日
          {
            type: "object",
            label: "申请 / 登记日",
            component: "datePicker",
            rules: [MONTH_FORMAT_RULE],
            span: 12,
            model: {
              source: ["data", "applyDate"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择申请或登记日",
            },
          },
          // 授权日或首次公开日
          {
            type: "object",
            label: "授权 / 公开日",
            component: "datePicker",
            rules: [MONTH_FORMAT_RULE],
            span: 12,
            model: {
              source: ["data", "grantDate"],
              prop: "modelValue",
            },
            props: {
              type: "month",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              placeholder: "请选择授权或公开日",
            },
          },
          // 成果标签：预设常见成果标签，同时支持回车自定义
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
              list: ["核心专利", "已转化落地", "PCT 国际申请", "海外授权"],
            },
          },
          // 成果简介
          {
            type: "object",
            label: "成果简介",
            component: "resumeContentEditor",
            span: 24,
            props: {
              kind: "ip",
            },
            model: [
              {
                source: ["data", "content"],
                prop: "modelValue",
              },
            ],
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
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: AAA + " px-3!",
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
            rules: [requiredFieldRule()],
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
            rules: [atsRule("projectLink")],
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
            rules: [requiredFieldRule()],
            label: "职位",
            component: "positionPicker",
            span: 12,
            model: [
              {
                source: ["data", "post"],
                prop: "modelValue",
              },
              {
                source: ["__options", "position"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择或输入职位",
            },
          },
          {
            type: "object",
            rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            rules: [requiredFieldRule(), contentQualityRule()],
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
  slogan: DEFAULT_SLOGAN_FORM,
  education: DEFAULT_EDUCATION_FORM,
  video: DEFAULT_VIDEO_FORM,
  image: DEFAULT_IMAGE_FORM,
  account: DEFAULT_ACCOUNT_FORM,
  work: DEFAULT_WORK_FORM,
  internship: DEFAULT_INTERNSHIP_FORM, // 实习经历表单配置。
  project: DEFAULT_PROJECT_FORM,
  publication: DEFAULT_PUBLICATION_FORM,
  ip: DEFAULT_IP_FORM,
  honor: DEFAULT_HONOR_FORM,
  custom: DEFAULT_CUSTOM_FORM,
} satisfies Record<string, FormField | FormField[]>;
