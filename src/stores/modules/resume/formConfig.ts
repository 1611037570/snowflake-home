export interface FormItem {
  type: string
  label: string
  component: string
  data: {
    path: string[]
    key: string
  }
  props: Record<string, any>
}

// 用户信息
export const userForm: FormItem[] = [
  {
    type: 'object',
    label: '姓名',
    component: 'input',
    data: {
      path: ['user', 'name'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入姓名',
    },
  },
  {
    type: 'object',
    label: '生日',
    component: 'datePicker',
    data: {
      path: ['user', 'birthday'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入生日',
      type: 'month',
    },
  },
  {
    type: 'object',
    label: '电话',
    component: 'input',
    data: {
      path: ['user', 'phone'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入电话',
    },
  },
  {
    type: 'object',
    label: '邮箱',
    component: 'input',
    data: {
      path: ['user', 'email'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入邮箱',
    },
  },
  {
    type: 'object',
    label: '参加工作时间',
    component: 'datePicker',
    data: {
      path: ['user', 'workTime'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入参加工作时间',
      type: 'month',
    },
  },
  {
    type: 'object',
    label: '性别',
    component: 'select',
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
]
export const userConfig = {
  form: userForm,
  type: 'user',
}
// 专业技能
export const skillForm: any = [
  {
    type: 'object',
    component: 'skill',
    data: {
      path: ['skill'],
      key: 'skill',
    },
  },
]
export const skillConfig = {
  form: skillForm,
  type: 'skill',
}

// 个人优势
export const advantageForm: any = [
  {
    component: 'collapse',
    children: [
      {
        component: 'collapseItem',
        props: {
          title: '个人优势',
          name: '1',
        },
        children: [
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
    ],
  },
]
export const advantageConfig = {
  form: advantageForm,
  type: 'advantage',
}
// 工作经历
export const workForm: any = [
  {
    component: 'work',
    type: 'array',
    list: [
      {
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
]
export const workConfig = {
  form: workForm,
  type: 'work',
}

// 项目经历
export const projectForm: any = [
  {
    component: 'work',
    type: 'array',
    list: [
      {
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
]
export const projectConfig = {
  form: projectForm,
  type: 'project',
}
// 教育经历
export const educationForm: any = [
  {
    component: 'education',
    type: 'array',
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
        ],
      },
    ],
  },
]
export const educationConfig = {
  form: educationForm,
  type: 'education',
}
export const allConfig = {
  skill: skillConfig,
  user: userConfig,
  advantage: advantageConfig,
  education: educationConfig,
  work: workConfig,
  project: projectConfig,
}
