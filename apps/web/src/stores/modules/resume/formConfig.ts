import type { FormConfig, FormField } from "@/components/business/dynamicForm";

// 展开状态数组：对应 SfCollapseItem 的激活 name，表示折叠容器为展开态
export const EXPANDED = ["1"];
// 收起状态数组：表示折叠容器为收起态
export const COLLAPSED: string[] = [];

const DEFAULT_META = {
  version: "1.0.0",
};
const DEFAULT_DRAG_CLASS = ".item-drag";
const DEFAULT_COL_CLASS =
  "rounded-2xl border border-sf-bg-3 bg-sf-primary px-3! hover:border-sf-theme";
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
    model: [
      {
        source: ["ui", "title"],
        prop: "title",
        defaultValue: "个人信息",
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
      // 归档开关：控制模块是否从编辑器主区域移除
      {
        source: ["ui", "archived"],
        prop: "archived",
        defaultValue: false,
      },
    ],
    checks: {
      hidden: { path: ["ui", "hidden"] },
      removed: { path: ["ui", "archived"] },
    },
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
      {
        type: "group",
        component: "fieldItem",
        slot: "default",
        // 包裹组沿用字段标识，供字段顺序持久化与定位
        key: "name",
        // 标签与操作区由包裹组件渲染，字段自身不再声明
        props: {
          label: "姓名",
          tip: "推荐必填",
        },
        // 字段状态绑定到包裹组，供包裹组件双向绑定
        model: [
          {
            source: ["ui", "name", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
        ],
        // 字段隐藏时的置灰判断
        checks: {
          hidden: {
            path: ["ui", "name", "hidden"],
            equals: true,
          },
        },
        fields: [
          {
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
          },
        ],
      },
      // 出生日期
      {
        type: "group",
        component: "fieldItem",
        slot: "default",
        // 包裹组沿用字段标识，供字段顺序持久化与定位
        key: "birthday",
        // 标签与操作区由包裹组件渲染，字段自身不再声明
        props: {
          label: "出生日期",
          tip: "推荐必填",
        },
        // 字段状态绑定到包裹组，供包裹组件双向绑定
        model: [
          {
            source: ["ui", "birthday", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
        ],
        // 字段隐藏时的置灰判断
        checks: {
          hidden: {
            path: ["ui", "birthday", "hidden"],
            equals: true,
          },
        },
        fields: [
          {
            type: "object",
            key: "birthday",
            component: "datePicker",
            span: 24,
            model: {
              source: ["data", "birthday"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请选择出生日期",
              valueFormat: "YYYY.MM",
              type: "month",
            },
          },
        ],
      },

      // 性别
      {
        type: "group",
        component: "fieldItem",
        slot: "default",
        // 包裹组沿用字段标识，供字段顺序持久化与定位
        key: "sex",
        // 标签与操作区由包裹组件渲染，字段自身不再声明
        props: {
          label: "性别",
          tip: "推荐必填",
        },
        // 字段状态绑定到包裹组，供包裹组件双向绑定
        model: [
          {
            source: ["ui", "sex", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
        ],
        // 字段隐藏时的置灰判断
        checks: {
          hidden: {
            path: ["ui", "sex", "hidden"],
            equals: true,
          },
        },
        fields: [
          {
            type: "object",
            key: "sex",
            component: "select",
            span: 24,
            model: [
              {
                source: ["data", "sex"],
                prop: "modelValue",
              },
              {
                source: ["__options", "sex"],
                prop: "list",
                raw: true,
              },
            ],
            props: {
              placeholder: "请选择性别",
              clearable: true,
            },
          },
        ],
      },
      // 求职岗位
      {
        type: "group",
        component: "fieldItem",
        slot: "default",
        // 包裹组沿用字段标识，供字段顺序持久化与定位
        key: "position",
        // 标签与操作区由包裹组件渲染，字段自身不再声明
        props: {
          label: "求职岗位",
          tip: "推荐必填",
        },
        // 字段状态绑定到包裹组，供包裹组件双向绑定
        model: [
          {
            source: ["ui", "position", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
        ],
        // 字段隐藏时的置灰判断
        checks: {
          hidden: {
            path: ["ui", "position", "hidden"],
            equals: true,
          },
        },
        fields: [
          {
            type: "object",
            key: "position",
            component: "input",
            span: 24,
            model: {
              source: ["data", "position"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入求职岗位",
              clearable: true,
            },
          },
        ],
      },
      {
        type: "group",
        component: "fieldItem",
        slot: "default",
        // 包裹组沿用字段标识，供字段顺序持久化与定位
        key: "workTime",
        // 标签与操作区由包裹组件渲染，字段自身不再声明
        props: {
          label: "参加工作时间",
          tip: "推荐必填",
        },
        // 可添加字段：数据存在才渲染
        addable: true,
        // 字段状态绑定到包裹组，供包裹组件双向绑定
        model: [
          {
            source: ["ui", "workTime", "hidden"],
            prop: "hidden",
            defaultValue: false,
          },
        ],
        // 字段隐藏时的置灰判断
        checks: {
          hidden: {
            path: ["ui", "workTime", "hidden"],
            equals: true,
          },
        },
        fields: [
          {
            type: "object",
            key: "workTime",
            component: "datePicker",
            span: 24,
            addable: true,
            model: {
              source: ["data", "workTime"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请选择参加工作时间",
              valueFormat: "YYYY.MM",
              type: "month",
            },
          },
        ],
      },
      // 可添加信息：数据路径存在后渲染在选择入口上方
      {
        type: "group",
        drag: true,
        dragClass: DEFAULT_DRAG_CLASS,
        itemClass: DEFAULT_COL_CLASS + " py-1",
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
          // 手机号
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "phone",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "手机号",
              tip: "推荐必填",
              removable: true,
              draggable: true,
            },
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "phone", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "phone", "icon"],
                prop: "icon",
                defaultValue: "mdi:phone",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "phone", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "phone",
                component: "input",
                span: 24,
                model: {
                  source: ["data", "phone"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "请输入手机号",
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
            ],
          },
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "email",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "邮箱",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "email", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "email", "icon"],
                prop: "icon",
                defaultValue: "mdi:email-outline",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "email", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "email",
                component: "input",
                span: 24,
                addable: true,
                model: {
                  source: ["data", "email"],
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
            ],
          },

          // 微信号
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "wechat",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "微信号",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "wechat", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "wechat", "icon"],
                prop: "icon",
                defaultValue: "mdi:wechat",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "wechat", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "wechat",
                component: "input",
                span: 24,
                addable: true,
                model: {
                  source: ["data", "wechat"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "请输入微信号",
                  clearable: true,
                },
              },
            ],
          },
          // GitHub
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "github",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "GitHub",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "github", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "github", "icon"],
                prop: "icon",
                defaultValue: "simple-icons:github",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "github", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "github",
                component: "input",
                span: 24,
                addable: true,
                model: {
                  source: ["data", "github"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "请输入 GitHub 地址",
                  clearable: true,
                },
              },
            ],
          },
          // 求职状态
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "status",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "求职状态",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "status", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "status", "icon"],
                prop: "icon",
                defaultValue: "mdi:briefcase-check-outline",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "status", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "status",
                component: "select",
                span: 24,
                addable: true,
                model: [
                  {
                    source: ["data", "status"],
                    prop: "modelValue",
                  },
                  {
                    source: ["__options", "status"],
                    prop: "list",
                    raw: true,
                  },
                ],
                props: {
                  placeholder: "请选择求职状态",
                  clearable: true,
                },
              },
            ],
          },
          // 政治面貌
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "political",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "政治面貌",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "political", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "political", "icon"],
                prop: "icon",
                defaultValue: "mdi:flag-outline",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "political", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "political",
                component: "select",
                span: 24,
                addable: true,
                model: [
                  {
                    source: ["data", "political"],
                    prop: "modelValue",
                  },
                  {
                    source: ["__options", "political"],
                    prop: "list",
                    raw: true,
                  },
                ],
                props: {
                  placeholder: "请选择政治面貌",
                  clearable: true,
                },
              },
            ],
          },
          // 所在城市
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "city",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "期望城市",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "city", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "city", "icon"],
                prop: "icon",
                defaultValue: "mdi:map-marker-outline",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "city", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "city",
                component: "cityPicker",
                span: 24,
                addable: true,
                model: {
                  source: ["data", "city"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "请选择城市",
                },
              },
            ],
          },
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "nativePlace",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "籍贯",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "nativePlace", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "nativePlace", "icon"],
                prop: "icon",
                defaultValue: "mdi:home-outline",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "nativePlace", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "nativePlace",
                component: "cityPicker",
                span: 24,
                addable: true,
                model: {
                  source: ["data", "nativePlace"],
                  prop: "modelValue",
                },
                props: {
                  placeholder: "请选择籍贯",
                },
              },
            ],
          },
          {
            type: "group",
            component: "fieldItem",
            slot: "default",
            // 包裹组沿用字段标识，供字段顺序持久化与定位
            key: "heightWeight",
            // 标签与操作区由包裹组件渲染，字段自身不再声明
            props: {
              label: "身高体重",
              removable: true,
              draggable: true,
            },
            // 可添加字段：数据存在才渲染
            addable: true,
            // 字段状态绑定到包裹组，供包裹组件双向绑定
            model: [
              {
                source: ["ui", "heightWeight", "hidden"],
                prop: "hidden",
                defaultValue: false,
              },
              {
                source: ["ui", "heightWeight", "icon"],
                prop: "icon",
                defaultValue: "mdi:human-male-height",
              },
            ],
            // 字段隐藏时的置灰判断
            checks: {
              hidden: {
                path: ["ui", "heightWeight", "hidden"],
                equals: true,
              },
            },
            fields: [
              {
                type: "object",
                key: "heightWeight",
                component: "heightWeight",
                span: 24,
                addable: true,
                model: {
                  source: ["data", "heightWeight"],
                  prop: "modelValue",
                },
              },
            ],
          },
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "社交账号",
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
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
      itemClass: DEFAULT_COL_CLASS + " py-1",
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "教育经历",
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS,
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
            label: "学校",
            component: "input",
            required: true,
            span: 12,
            model: {
              source: ["data", "name"],
              prop: "modelValue",
            },
            props: {
              placeholder: "请输入学校",
              clearable: true,
            },
          },
          {
            type: "object",
            label: "学位",
            component: "select",
            span: 12,
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
          {
            type: "object",
            label: "学制",
            component: "select",
            required: true,
            span: 12,
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
            },
          },
          {
            type: "object",
            label: "时间",
            required: true,
            component: "datePicker",
            span: 24,
            model: {
              source: ["data", "time"],
              prop: "modelValue",
            },
            props: {
              type: "monthrange",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              startPlaceholder: "请选择开始时间",
              endPlaceholder: "请选择结束时间",
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "专业技能",
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "个人优势",
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "工作经历",
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS,
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
            label: "公司",
            component: "input",
            required: true,
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
          {
            type: "object",
            label: "时间",
            required: true,
            component: "datePicker",
            span: 24,
            model: {
              source: ["data", "time"],
              prop: "modelValue",
            },
            props: {
              type: "monthrange",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              startPlaceholder: "请选择开始时间",
              endPlaceholder: "请选择结束时间",
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "项目经历",
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS,
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
          {
            type: "object",
            label: "时间",
            required: true,
            component: "datePicker",
            span: 24,
            model: {
              source: ["data", "time"],
              prop: "modelValue",
            },
            props: {
              type: "monthrange",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              startPlaceholder: "请选择开始时间",
              endPlaceholder: "请选择结束时间",
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "视频作品",
    },
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS,
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "图片作品",
    },
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS,
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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "荣誉证书",
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS + " py-1",

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
  model: [
    {
      source: ["ui", "title"],
      prop: "title",
      defaultValue: "",
    },
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
    // 归档状态：已完成模块移入归档区域
    {
      source: ["ui", "archived"],
      prop: "archived",
      defaultValue: false,
    },
  ],
  checks: {
    hidden: { path: ["ui", "hidden"] },
    removed: { path: ["ui", "archived"] },
  },
  slot: "default",
  fields: [
    {
      type: "array",
      source: ["list"],
      drag: true,
      dragClass: DEFAULT_DRAG_CLASS,
      itemClass: DEFAULT_COL_CLASS,
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
            label: "时间",
            component: "datePicker",
            span: 24,
            model: {
              source: ["data", "time"],
              prop: "modelValue",
            },
            props: {
              type: "monthrange",
              format: "YYYY.MM",
              valueFormat: "YYYY.MM",
              startPlaceholder: "请选择开始时间",
              endPlaceholder: "请选择结束时间",
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
