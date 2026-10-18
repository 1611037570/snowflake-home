import type {
  DynamicFormRule,
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
// 圆角边框卡片：个人信息内部字段与各模块列表条目共用同一底座样式。
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

// 个人信息固定字段包裹组：标签与状态绑定结构一致，仅内层字段不同
const createUserField = (
  key: string,
  label: string,
  field: ObjectFormField,
  options: { tip?: string; addable?: boolean; required?: boolean } = {},
): GroupFormField => {
  const { tip = "推荐必填", addable, required } = options;
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
    // 填写口径由业务手动标记，与表单校验规则分离
    required: required === true,
    // 可添加字段：数据存在才渲染
    ...(addable ? { addable: true } : {}),
    // 字段状态绑定到包裹组，供包裹组件双向绑定
    model: [{ source: ["ui", key, "hidden"], prop: "hidden", defaultValue: false }],
    fields: [
      {
        ...field,
        ...(addable ? { addable: true } : {}),
        required: required === true,
      },
    ],
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
  // 填写口径：true 必填；未设置表示可选
  required?: boolean;
  // 空白简历创建时默认添加该可添加字段
  defaultAdded?: boolean;
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
    required,
    defaultAdded,
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
    // 空白简历创建时默认添加该字段
    ...(defaultAdded ? { defaultAdded: true } : {}),
    // 填写口径由业务手动标记，与表单校验规则分离
    required: required === true,
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
        // 内层字段是完成度和 AI 契约读取的字段声明，也承载默认添加标记
        ...(defaultAdded ? { defaultAdded: true } : {}),
        required: required === true,
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
    slot: "default",
    fields: [
      // 头像
      {
        type: "object",
        key: "avatar",
        label: "头像",
        component: "imageUpload",
        required: false,
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
      }, { required: true }),
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
            // 更多分类默认收起，常用字段由组件保持显示
            defaultValue: COLLAPSED,
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
            defaultAdded: true,
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
            defaultAdded: true,
            required: true,
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
            defaultAdded: true,
            required: true,
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
            defaultAdded: true,
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
            defaultAdded: true,
            required: true,
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
            component: "urlInput", // 链接地址提供协议前缀预选。
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
            component: "urlInput", // 链接地址提供协议前缀预选。
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
            component: "urlInput", // 链接地址提供协议前缀预选。
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

// 社交账号
export const DEFAULT_ACCOUNT_FORM = {
  type: "group",
  key: "account",
  context: ["account"],
  span: 24,
  model: createModuleState("社交账号"),
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
      itemClass: DEFAULT_COL_CLASS + " py-1 px-3!", // 记录保留内部留白并显示圆角边框。
      itemSchema: {
        model: [
          {
            source: ["data", "name"],
            defaultValue: "",
            prop: "name",
            required: true,
          },
          {
            source: ["data", "url"],
            defaultValue: "",
            prop: "url",
            required: true,
          },
          {
            source: ["ui", "hidden"],
            defaultValue: false,
            prop: "hidden",
          },
        ],
        type: "object",
        component: "rowAccount",
        required: true, rules: [requiredFieldRule(), atsRule("socialLink")],
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
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
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
            required: true, rules: [requiredFieldRule()],
            span: 12,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如：北京大学",
              clearable: true,
            },
          },
          // 专业与学校名称并排编辑。
          {
            type: "object",
            label: "专业",
            component: "positionPicker",
            required: true, rules: [requiredFieldRule()],
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
          {
            type: "object",
            label: "开始时间",
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            label: "学历",
            component: "select",
            span: 6,
            required: true, rules: [requiredFieldRule()],
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
            required: true, rules: [requiredFieldRule()],
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
          // 成绩与学历、学制同排，可填写绩点或其他成绩。
          {
            type: "object", // 使用普通输入字段。
            label: "成绩/GPA", // 成绩字段标题。
            component: "input", // 使用文本输入组件。
            required: false,
            span: 12, // 占半行宽度。
            model: {
              source: ["data", "score"], // 保存教育经历成绩。
              prop: "modelValue", // 绑定输入值。
            },
            props: {
              placeholder: "如：3.8/4.0", // 提示成绩填写格式。
              clearable: true, // 允许清空成绩。
            },
          },
          {
            type: "object",
            label: "经历",
            component: "resumeContentEditor",
            required: true,
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
          // 更多分组：链接、学院、城市与标签收在折叠区内，只负责折叠，默认收起
          {
            type: "group",
            key: "more",
            component: "collapseGroup",
            slot: "default",
            span: 24,
            rowClass: "gap-y-3",
            // 折叠头标题由折叠分组组件渲染
            props: { label: "更多可选" },
            model: [
              {
                source: ["ui", "moreCollapsed"],
                prop: "collapsed",
                // 更多分组默认收起
                defaultValue: COLLAPSED,
              },
            ],
            fields: [
              // 教育经历复用通用的链接名称与地址编辑字段。
              {
                required: false,
                type: "object", // 使用对象字段承载链接。
                label: "链接", // 通用链接字段标题。
                component: "projectLink", // 复用链接编辑组件。
                rules: [atsRule("projectLink")], // 校验链接地址。
                span: 24, // 链接编辑占整行。
                model: {
                  source: ["data", "link"], // 保存教育经历链接。
                  prop: "modelValue", // 绑定链接对象。
                  defaultValue: {}, // 新条目默认使用空链接。
                },
              },
              // 学院名称
              {
                required: false,
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
              // 所在城市：省市字典由业务域注入
              {
                required: false,
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
              // 学校标签：可选标签由字段配置注入
              {
                required: false,
                type: "object",
                label: "标签", // 学校标签字段标题。
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
    add: true, // 技能评分列表允许新增技能记录。
    addWhenLayout: "proficiency", // 仅切换到技能列表布局时显示新增入口。
  },
  model: createModuleState("专业技能"),
  slot: "default",
  fields: [
    {
      // 正文布局使用富文本编辑器。
      type: "object",
      component: "resumeContentEditor",
      required: true, rules: [requiredFieldRule(), contentQualityRule()],
      props: {
        kind: "skill",
      },
      model: {
        source: ["data", "content"],
        prop: "modelValue",
      },
    },
    {
      // 技能列表：每条技能编辑名称、描述与十分制评分。
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: DEFAULT_COL_CLASS + " px-3! py-1", // 技能卡片上下留白，避免输入框贴住边框。
      itemSchema: {
        model: [
          {
            source: ["ui", "collapsed"], // 保存单条技能的折叠状态。
            defaultValue: EXPANDED, // 新增技能默认展开。
            prop: "collapsed", // 绑定技能条目的折叠组件。
          },
          {
            source: ["data", "name"],
            defaultValue: "",
            prop: "name",
            required: true,
          },
          {
            source: ["data", "desc"], // 技能描述。
            defaultValue: "", // 新增技能默认没有描述。
            prop: "desc", // 将描述传给技能编辑组件。
            required: false,
          },
          {
            source: ["data", "level"],
            defaultValue: 7,
            prop: "level", // 保存所有样式共用的一到十分技能评分
            required: false,
          },
          {
            source: ["ui", "hidden"],
            defaultValue: false,
            prop: "hidden",
          },
        ],
        type: "object",
        component: "rowSkill",
        required: true, rules: [requiredFieldRule()],
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
  slot: "default",
  fields: [
    {
      type: "object",
      component: "resumeContentEditor",
      required: true, rules: [requiredFieldRule(), contentQualityRule()],
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
  slot: "default",
  fields: [
    // 标语字段直接声明数据绑定：字段 key 不能与模块状态 key（ui.title / ui.hidden）重名，
    // 否则字段的隐藏状态会写到模块标题上，编辑器面板读写时报错。
    {
      type: "object",
      key: "title",
      label: "标题",
      component: "input",
      required: false,
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
      required: false,
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
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
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
          // 公司名称与岗位并排展示，起止时间成对排列。
          {
            type: "object",
            label: "公司名称",
            component: "input",
            required: true, rules: [requiredFieldRule()],
            span: 12,
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
            required: true, rules: [requiredFieldRule()],
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
          {
            type: "object",
            label: "开始时间",
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), contentQualityRule()],
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
          // 更多分组：城市、部门、链接与标签收在折叠区内，默认收起。
          {
            type: "group",
            key: "more",
            component: "collapseGroup",
            slot: "default",
            span: 24,
            rowClass: "gap-y-3",
            // 折叠头标题由折叠分组组件渲染
            props: { label: "更多可选" },
            model: [
              {
                source: ["ui", "moreCollapsed"],
                prop: "collapsed",
                // 更多分组默认收起
                defaultValue: COLLAPSED,
              },
            ],
            fields: [
              // 所在城市：省市字典由业务域注入。
              {
                required: false,
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
              // 所在部门紧随城市，展示在同一行。
              {
                required: false,
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
              // 项目链接
              {
                required: false,
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
                required: false,
                type: "object",
                label: "标签", // 工作标签字段标题。
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
            ],
          },
        ],
      },
    },
  ],
} satisfies FormField;
// 实习经历独立维护字段与记录配置。
export const DEFAULT_INTERNSHIP_FORM = {
  type: "group",
  key: "internship", // 实习经历模块标识。
  context: ["internship"], // 实习经历数据绑定路径。
  component: "collapseModule",
  props: {
    add: true,
  },
  model: createModuleState("实习经历"), // 实习模块标题与状态绑定。
  slot: "default",
  fields: [
    // 实习记录列表独立声明字段与操作。
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      // 每条实习记录使用独立的折叠卡片配置。
      itemSchema: {
        type: "group",
        component: "collapseItem",
        slot: "default",
        span: 24,
        model: [
          {
            source: ["ui", "collapsed"], // 实习记录的折叠状态。
            prop: "collapsed",
            defaultValue: EXPANDED,
          },
          {
            source: ["ui", "hidden"], // 实习记录的隐藏状态。
            prop: "hidden",
            defaultValue: false,
          },
          {
            source: ["data", "name"], // 实习单位名称作为记录标题。
            prop: "name",
          },
        ],
        fields: [
          // 实习单位名称与岗位并排展示，起止时间成对排列。
          {
            type: "object",
            label: "公司名称",
            component: "input",
            required: true, rules: [requiredFieldRule()],
            span: 12,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入公司",
              clearable: true,
            },
          },
          // 实习岗位。
          {
            type: "object",
            label: "岗位",
            component: "positionPicker",
            required: true, rules: [requiredFieldRule()],
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
          // 实习开始月份。
          {
            type: "object",
            label: "开始时间",
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
          // 实习结束月份或至今。
          {
            type: "object",
            label: "结束时间",
            required: true, rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
          // 实习职责与成果正文。
          {
            type: "object",
            label: "经历",
            required: true, rules: [requiredFieldRule(), contentQualityRule()],
            component: "resumeContentEditor",
            span: 24,
            props: {
              kind: "work", // 正文写作范例沿用工作经历类型。
            },
            model: [
              {
                source: ["data", "content"],
                prop: "modelValue",
              },
            ],
          },
          // 实习城市、部门、链接与标签收在独立折叠区内，默认收起。
          {
            type: "group",
            key: "more",
            component: "collapseGroup",
            slot: "default",
            span: 24,
            rowClass: "gap-y-3",
            // 折叠头标题由折叠分组组件渲染
            props: { label: "更多可选" },
            model: [
              {
                source: ["ui", "moreCollapsed"],
                prop: "collapsed",
                // 更多分组默认收起
                defaultValue: COLLAPSED,
              },
            ],
            fields: [
              // 所在城市：省市字典由业务域注入。
              {
                required: false,
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
              // 所在部门紧随城市，展示在同一行。
              {
                required: false,
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
              // 实习相关作品链接。
              {
                required: false,
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
              // 实习标签：可选标签由字段配置注入。
              {
                required: false,
                type: "object",
                label: "标签", // 实习标签字段标题。
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
            ],
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
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
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
            required: true, rules: [requiredFieldRule()],
            span: 12,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入项目名称",
              clearable: true,
            },
          },
          // 项目名称与岗位并排展示。
          {
            type: "object",
            label: "岗位",
            component: "positionPicker",
            required: true, rules: [requiredFieldRule()],
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
          {
            type: "object",
            label: "开始时间",
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            component: "resumeContentEditor",
            required: true, rules: [requiredFieldRule(), contentQualityRule()],
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
          // 更多分组与工作经历保持相同的字段顺序。
          {
            type: "group",
            key: "more",
            component: "collapseGroup",
            slot: "default",
            span: 24,
            rowClass: "gap-y-3",
            props: { label: "更多可选" },
            model: [
              {
                source: ["ui", "moreCollapsed"],
                prop: "collapsed",
                defaultValue: COLLAPSED,
              },
            ],
            fields: [
              // 所在城市与所在部门并排编辑。
              {
                required: false,
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
                required: false,
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
              // 链接与标签沿用项目经历现有字段。
              {
                required: false,
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
                required: false,
                type: "object",
                label: "标签", // 项目标签字段标题。
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
            ],
          },
        ],
      },
    },
  ],
} satisfies FormField;
// 作品集：图片与链接可分别填写，不区分作品类型
export const DEFAULT_PORTFOLIO_FORM = {
  type: "group",
  key: "portfolio",
  context: ["portfolio"],
  component: "collapseModule",
  props: {
    add: true,
  },
  model: createModuleState("作品集"),
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        // 折叠标题数据源：展示当前作品名称
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
                // name：作品名称。
                source: ["data", "name"],
                defaultValue: "",
                prop: "name",
                required: true,
              },
              {
                // url：作品链接，适用于任何类型的作品。
                source: ["data", "url"],
                defaultValue: "",
                prop: "url",
                required: false,
              },
              {
                // desc：作品描述。
                source: ["data", "desc"],
                defaultValue: "",
                prop: "desc",
                required: false,
              },
              {
                // img：作品图片，可与作品链接同时使用。
                source: ["data", "img"],
                defaultValue: "",
                prop: "img",
                required: false,
              },
              {
                // size：作品图片在预览中的显示大小百分比。
                source: ["data", "size"],
                defaultValue: 50,
                prop: "size",
                required: false,
              },
            ],
            type: "object",
            component: "portfolio",
            required: true, rules: [requiredFieldRule()],
          },
        ],
        type: "group",
        component: "collapseItem",
        slot: "default",
        span: 24,
        required: true, rules: [requiredFieldRule()],
      },
    },
  ],
} satisfies FormField;
// 荣誉证书：条目升级为折叠卡，名称、链接与描述逐项编辑，预览按标题行加描述块渲染
export const DEFAULT_HONOR_FORM = {
  type: "group",
  component: "collapseModule",
  key: "honor",
  context: ["honor"],
  props: {
    add: true,
  },
  model: createModuleState("荣誉证书"),
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        type: "group",
        component: "collapseItem",
        slot: "default",
        span: 24,
        // 荣誉条目内容底部留白，避免最后一个输入框贴住卡片边框。
        rowClass: "gap-y-3 pb-3",
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
          // 折叠项标题取荣誉名称
          {
            source: ["data", "name"],
            prop: "name",
          },
        ],
        fields: [
          // 荣誉名称
          {
            type: "object",
            label: "荣誉名称",
            component: "input",
            required: true, rules: [requiredFieldRule()],
            span: 24,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如：国家奖学金",
              clearable: true,
            },
          },
          {
            // 荣誉链接：与项目链接同一结构 { name, url }，检查口径保持一致
            type: "object",
            label: "荣誉链接",
            component: "projectLink",
            required: false,
            rules: [atsRule("projectLink")],
            span: 24,
            model: {
              source: ["data", "link"],
              prop: "modelValue",
              defaultValue: {},
            },
          },
          {
            // 荣誉描述使用默认一行的自适应多行输入框。
            type: "object",
            label: "荣誉描述",
            component: "input",
            required: false,
            span: 24,
            props: {
              placeholder: "请输入荣誉描述", // 提示填写简短的荣誉说明。
              clearable: true, // 允许清空荣誉描述。
              type: "textarea", // 支持输入多行荣誉描述。
              autosize: { minRows: 1 }, // 默认显示一行，随内容自动增高。
            },
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

// 社团经历
export const DEFAULT_CLUB_FORM = {
  type: "group",
  key: "club",
  context: ["club"],
  component: "collapseModule",
  props: { add: true },
  model: createModuleState("社团经历"),
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      rowClass: "gap-y-3 px-3 pt-3",
      itemClass: DEFAULT_COL_CLASS + " px-3!",
      itemSchema: {
        type: "group",
        component: "collapseItem",
        slot: "default",
        span: 24,
        model: [
          {
            source: ["ui", "collapsed"], // 社团记录的折叠状态。
            prop: "collapsed", // 绑定折叠组件状态。
            defaultValue: EXPANDED, // 新记录默认展开。
          },
          {
            source: ["ui", "hidden"], // 社团记录的隐藏状态。
            prop: "hidden", // 绑定隐藏操作。
            defaultValue: false, // 新记录默认可见。
          },
          {
            source: ["data", "name"], // 组织或活动名称作为记录标题。
            prop: "name", // 绑定折叠标题。
          },
        ],
        fields: [
          // 组织或活动名称与担任职务按教育经历首行布局并排编辑。
          {
            type: "object",
            label: "组织/活动", // 社团经历的名称字段标题。
            component: "input",
            required: true, rules: [requiredFieldRule()],
            span: 12,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入组织/活动", // 提示填写组织或活动名称。
              clearable: true,
            },
          },
          {
            type: "object",
            label: "担任职务",
            component: "positionPicker",
            required: true,
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
              placeholder: "请选择或输入职务",
            },
          },
          // 起止时间保持同一行。
          {
            type: "object",
            label: "开始时间",
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            component: "resumeContentEditor",
            required: true, rules: [requiredFieldRule(), contentQualityRule()],
            span: 24,
            props: { kind: "work" },
            model: {
              source: ["data", "content"],
              prop: "modelValue",
            },
          },
          // 城市与标签按教育经历结构放入默认收起的更多分组。
          {
            type: "group",
            key: "more",
            component: "collapseGroup",
            slot: "default",
            span: 24,
            rowClass: "gap-y-3",
            props: { label: "更多可选" },
            model: [
              {
                source: ["ui", "moreCollapsed"], // 更多分组的折叠状态。
                prop: "collapsed", // 绑定折叠组件状态。
                defaultValue: COLLAPSED, // 默认收起更多分组。
              },
            ],
            fields: [
              {
                required: false,
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
                required: false,
                type: "object",
                label: "标签", // 社团经历的标签字段标题。
                component: "tag",
                span: 24,
                model: {
                  source: ["data", "tags"],
                  prop: "modelValue",
                  defaultValue: [],
                },
                props: {
                  list: ["社长", "部长", "核心成员", "组织策划", "从0到1"],
                },
              },
            ],
          },
        ],
      },
    },
  ],
} satisfies FormField;
// 志愿者经历独立维护字段与记录配置。
export const DEFAULT_VOLUNTEER_FORM = {
  type: "group",
  key: "volunteer", // 模块标识。
  context: ["volunteer"], // 模块数据路径。
  component: "collapseModule",
  props: {
    add: true,
  },
  model: createModuleState("志愿服务经历"),
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      rowClass: "gap-y-3 px-3 pt-3",
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
          // 组织名称与服务时长按教育经历首行布局并排编辑。
          {
            type: "object",
            label: "组织名称",
            component: "input",
            required: true, rules: [requiredFieldRule()],
            span: 12,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入组织名称",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "服务时长",
            component: "input",
            required: true,
            span: 12,
            model: {
              source: ["data", "duration"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如 120 小时",
              clearable: true,
            },
          },
          // 起止时间保持同一行。
          {
            type: "object",
            label: "开始时间",
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            component: "resumeContentEditor",
            required: true, rules: [requiredFieldRule(), contentQualityRule()],
            span: 24,
            props: {
              kind: "work",
            },
            model: {
              source: ["data", "content"],
              prop: "modelValue",
            },
          },
          // 城市与标签按教育经历结构放入默认收起的更多分组。
          {
            type: "group",
            key: "more",
            component: "collapseGroup",
            slot: "default",
            span: 24,
            rowClass: "gap-y-3",
            props: { label: "更多可选" },
            model: [
              {
                source: ["ui", "moreCollapsed"], // 更多分组的折叠状态。
                prop: "collapsed", // 绑定折叠组件状态。
                defaultValue: COLLAPSED, // 默认收起更多分组。
              },
            ],
            fields: [
              {
                required: false,
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
                required: false,
                type: "object",
                label: "标签", // 志愿者经历的标签字段标题。
                component: "tag",
                span: 24,
                model: {
                  source: ["data", "tags"],
                  prop: "modelValue",
                  defaultValue: [],
                },
                props: {
                  list: ["志愿服务", "公益项目", "团队协作", "组织策划"], // 当前模块的常用标签。
                },
              },
            ],
          },
        ],
      },
    },
  ],
} satisfies FormField;

// 学术论文：论文的价值维度是发表载体、作者署名与索引分区，与经历类模块的职责岗位结构不同，独立声明字段
export const DEFAULT_PUBLICATION_FORM = {
  type: "group",
  component: "collapseModule",
  key: "publication",
  context: ["publication"],
  props: {
    add: true,
  },
  model: createModuleState("论文发表"),
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
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
            required: true, rules: [requiredFieldRule()],
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
          // 论文标签紧随标题填写，预览中与标题同行显示。
          {
            type: "object",
            label: "标签", // 论文索引标签字段标题。
            component: "tag",
            required: false,
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
          // 作者列表：按署名顺序填写，可指定预览中强调的本人姓名。
          {
            type: "object",
            label: "作者",
            component: "publicationAuthors",
            required: true, rules: [requiredFieldRule()],
            span: 24,
            model: [
              {
                source: ["data", "authors"], // 作者署名文本。
                prop: "modelValue", // 作者输入框的值。
                required: true,
              },
              {
                source: ["data", "selfAuthor"], // 预览中需要强调的本人姓名。
                prop: "selfAuthor", // 本人选择结果。
                defaultValue: "", // 空值沿用个人姓名识别，不让空白论文变成有效内容。
                required: false,
              },
            ],
          },
          // 发表状态下拉仅提供已发表、已录用和在投。
          {
            type: "object",
            label: "发表状态",
            component: "select",
            required: true, rules: [requiredFieldRule()],
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
            required: true, rules: [requiredFieldRule()],
            span: 12,
            model: {
              source: ["data", "venue"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入期刊或会议全称",
              clearable: true,
            },
          },
          // 发表时间：论文为单时间点，取年月即可
          {
            type: "object",
            label: "发表时间",
            component: "datePicker",
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            component: "urlInput", // 链接地址可选协议前缀，DOI 编号可原样填写。
            required: false,
            span: 12,
            model: {
              source: ["data", "doi"],
              prop: "modelValue",
            },
            props: {
              placeholder: "如 10.1109/TKDE.2024.1234567 或论文主页地址",
              clearable: true,
              allowDoi: true, // 纯 DOI 编号不自动添加协议前缀。
            },
          },
          // 研究内容沿用作者字段的多行文本输入框。
          {
            type: "object",
            label: "研究内容",
            component: "resumeContentEditor",
            required: false,
            span: 24,
            props: {
              kind: "publication", // 学术论文使用与作者相同的多行文本输入框。
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
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      // 数组卡片恢复纵向间距，容器提供左右及顶部留白。
      rowClass: "gap-y-3 px-3 pt-3",
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
            required: true, rules: [requiredFieldRule()],
            label: "名称",
            component: "input",
            span: 12, // 名称与职位并排编辑。
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入名称",
              clearable: true,
            },
          },
          // 职位紧随名称，同教育经历的专业位置。
          {
            type: "object",
            required: true, rules: [requiredFieldRule()],
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
            required: true, rules: [requiredFieldRule(), MONTH_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), MONTH_PRESENT_FORMAT_RULE],
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
            required: true, rules: [requiredFieldRule(), contentQualityRule()],
            component: "resumeContentEditor",
            span: 24,
            props: {
              // 自定义模块正文与其他模块共用同一编辑器，获得 AI 工具栏与内容质量口径
              kind: "custom",
            },
            model: {
              source: ["data", "content"],
              prop: "modelValue",
            },
          },
          // 自定义经历的链接、部门、城市与标签收进更多分组。
          {
            type: "group",
            key: "more",
            component: "collapseGroup",
            slot: "default",
            span: 24,
            rowClass: "gap-y-3",
            props: { label: "更多可选" },
            model: [
              {
                source: ["ui", "moreCollapsed"], // 更多分组的折叠状态。
                prop: "collapsed", // 绑定折叠组件状态。
                defaultValue: COLLAPSED, // 默认收起更多分组。
              },
            ],
            fields: [
              {
                required: false,
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
                required: false,
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
                required: false,
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
                required: false,
                type: "object",
                label: "标签", // 自定义经历的标签字段标题。
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
            ],
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
  portfolio: DEFAULT_PORTFOLIO_FORM,
  account: DEFAULT_ACCOUNT_FORM,
  work: DEFAULT_WORK_FORM,
  internship: DEFAULT_INTERNSHIP_FORM, // 实习经历表单配置。
  project: DEFAULT_PROJECT_FORM,
  publication: DEFAULT_PUBLICATION_FORM,
  honor: DEFAULT_HONOR_FORM,
  club: DEFAULT_CLUB_FORM,
  volunteer: DEFAULT_VOLUNTEER_FORM,
  custom: DEFAULT_CUSTOM_FORM,
} satisfies Record<string, FormField | FormField[]>;
