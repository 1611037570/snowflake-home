// 用户信息
export const DEFAULT_USER_FORM = [
  {
    type: 'object',
    component: 'title',
    props: {
      modelValue: '个人信息',
    },
    data: [
      // {
      //   path: ['user', 'name'],
      //   key: 'modelValue',
      // },
    ],
  },
  {
    list: [
      // 求职岗位
      {
        type: 'object',
        label: '求职岗位',
        tip: '你求职的岗位，必填',
        component: 'input',
        span: 24,
        data: {
          path: ['user', 'position'],
          key: 'modelValue',
        },
        props: {
          placeholder: '请输入求职岗位',
          clearable: true,
        },
      },
      {
        type: 'object',
        label: '姓名',
        tip: '你的姓名，必填',
        component: 'input',
        span: 12,
        data: {
          path: ['user', 'name'],
          key: 'modelValue',
        },
        props: {
          placeholder: '请输入姓名',
          clearable: true,
        },
      },
      {
        type: 'object',
        label: '出生日期',
        tip: '你的出生日期，必填',
        component: 'datePicker',
        span: 12,
        data: {
          path: ['user', 'birthday'],
          key: 'modelValue',
        },
        props: {
          placeholder: '请输入出生日期',
          valueFormat: 'YYYY.MM',
          type: 'month',
        },
      },
      {
        type: 'object',
        label: '电话',
        tip: '用于联系你的手机号，必填',
        component: 'input',
        span: 12,
        data: {
          path: ['user', 'phone'],
          key: 'modelValue',
        },
        props: {
          placeholder: '请输入电话',
          clearable: true,
        },
      },
      {
        type: 'object',
        label: '邮箱',
        tip: '用于联系你的邮箱',
        component: 'input',
        span: 12,
        data: {
          path: ['user', 'email'],
          key: 'modelValue',
        },
        props: {
          placeholder: '请输入邮箱',
          clearable: true,
        },
      },
      {
        type: 'object',
        label: '参加工作时间',
        tip: '你参加工作时间',
        component: 'datePicker',
        span: 12,
        data: {
          path: ['user', 'workTime'],
          key: 'modelValue',
        },
        props: {
          placeholder: '请输入参加工作时间',
          valueFormat: 'YYYY.MM',
          type: 'month',
        },
      },
      {
        type: 'object',
        label: '性别',
        tip: '你的性别',
        component: 'select',
        span: 12,
        data: {
          path: ['user', 'sex'],
          key: 'modelValue',
        },
        props: {
          placeholder: '请输入性别',
          clearable: true,
          list: [
            {
              name: '男',
              value: '男',
            },
            {
              name: '女',
              value: '女',
            },
          ],
        },
      },
    ],
    drag: false,
    type: 'array',
    key: 'user',
    name: '用户信息',
  },
  {
    component: 'socialAccount',
    span: 24,
    type: 'object',
    data: [
      {
        path: ['user', 'link'],
        key: 'modelValue',
      },
    ],
  },
]
// 教育经历
export const DEFAULT_EDUCATION_FORM = {
  type: 'object',
  key: 'education',
  name: '教育经历',
  component: 'boxCollapse',
  props: {
    title: '教育经历',
  },
  slot: true,
  children: {
    fields: [
      {
        type: 'array',
        drag: true,
        list: [
          {
            data: [
              {
                path: ['education', '?', 'name'],
                key: 'name',
              },
              {
                path: ['education', '?', 'education'],
                key: 'education',
              },
              {
                path: ['education', '?', 'post'],
                key: 'post',
              },
              {
                path: ['education', '?', 'time'],
                key: 'time',
              },
              {
                path: ['education', '?', 'content'],
                key: 'content',
              },
              // 学制
              {
                path: ['education', '?', 'mode'],
                key: 'mode',
              },
            ],
            component: 'education',
            span: 24,
          },
        ],
      },
    ],
    drag: true,
  },
}
// 专业技能
export const DEFAULT_SKILL_FORM = {
  type: 'object',
  component: 'boxCollapse',
  key: 'skill',
  name: '专业技能',
  props: {
    title: '专业技能',
  },
  slot: true,
  children: {
    fields: [
      {
        type: 'object',
        component: 'wangEdit',
        data: {
          path: ['skill'],
          key: 'modelValue',
        },
      },
    ],
  },
}
// 个人优势
export const DEFAULT_ADVANTAGE_FORM = {
  type: 'object',
  component: 'boxCollapse',
  key: 'advantage',
  name: '个人优势',
  props: {
    title: '个人优势',
  },
  slot: true,
  children: {
    fields: [
      {
        type: 'object',
        component: 'wangEdit',
        data: {
          path: ['advantage'],
          key: 'modelValue',
        },
      },
    ],
  },
}
// 工作经历
export const DEFAULT_WORK_FORM = {
  type: 'object',
  key: 'work',
  name: '工作经历',
  component: 'boxCollapse',
  props: {
    title: '工作经历',
  },
  slot: true,
  children: {
    fields: [
      {
        type: 'array',
        drag: true,
        list: [
          {
            component: 'work',
            span: 24,
            data: [
              {
                path: ['work', '?', 'name'],
                key: 'name',
              },
              {
                path: ['work', '?', 'post'],
                key: 'post',
              },
              {
                path: ['work', '?', 'time'],
                key: 'time',
              },
              {
                path: ['work', '?', 'content'],
                key: 'content',
              },
            ],
          },
        ],
      },
    ],
  },
}
// 项目经历
export const DEFAULT_PROJECT_FORM = {
  type: 'object',
  key: 'project',
  name: '项目经历',
  component: 'boxCollapse',
  props: {
    title: '项目经历',
  },
  drag: true,
  slot: true,
  children: {
    fields: [
      {
        type: 'array',
        drag: true,
        list: [
          {
            component: 'project',
            span: 24,
            data: [
              {
                path: ['project', '?', 'name'],
                key: 'name',
              },
              {
                path: ['project', '?', 'post'],
                key: 'post',
              },
              {
                path: ['project', '?', 'time'],
                key: 'time',
              },
              {
                path: ['project', '?', 'content'],
                key: 'content',
              },
            ],
          },
          {
            component: 'project',
            span: 24,
            data: [
              {
                path: ['project', '?', 'name'],
                key: 'name',
              },
              {
                path: ['project', '?', 'post'],
                key: 'post',
              },
              {
                path: ['project', '?', 'time'],
                key: 'time',
              },
              {
                path: ['project', '?', 'content'],
                key: 'content',
              },
            ],
          },
        ],
      },
    ],
  },
}
// 自定义经历
export const DEFAULT_CUSTOM_FORM = {
  type: 'object',
  key: 'custom',
  name: '',
  component: 'boxCollapse',
  props: {
    title: '',
  },
  slot: true,
  children: {
    fields: [
      {
        type: 'array',
        drag: true,
        list: [
          {
            component: 'custom',
            span: 24,
            data: [
              {
                path: ['custom', '?', 'name'],
                key: 'name',
              },
              {
                path: ['custom', '?', 'education'],
                key: 'education',
              },
              {
                path: ['custom', '?', 'post'],
                key: 'post',
              },
              {
                path: ['custom', '?', 'time'],
                key: 'time',
              },
              {
                path: ['custom', '?', 'content'],
                key: 'content',
              },
            ],
          },
        ],
      },
    ],
  },
}

export const allConfig = {
  skill: DEFAULT_SKILL_FORM,
  user: DEFAULT_USER_FORM,
  advantage: DEFAULT_ADVANTAGE_FORM,
  education: DEFAULT_EDUCATION_FORM,
  work: DEFAULT_WORK_FORM,
  project: DEFAULT_PROJECT_FORM,
  custom: DEFAULT_CUSTOM_FORM,
}
