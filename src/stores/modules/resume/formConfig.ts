export interface FormItem {
  type: string
  label: string
  component: string
  span?: number
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
    label: '生日',
    component: 'datePicker',
    span: 12,
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
    component: 'datePicker',
    span: 12,
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
]
export const userConfig = {
  form: userForm,
  type: 'user',
  name: '用户信息',
}
// 专业技能
export const skillForm: any = [
  {
    component: 'boxCollapse',
    props: {
      title: '专业技能',
    },
    children: [
      {
        type: 'object',
        component: 'wangEdit',
        data: {
          path: ['skill'],
          key: 'skill',
        },
      },
    ],
  },
]
export const skillConfig = {
  form: skillForm,
  type: 'skill',
  name: '专业技能',
}

// 个人优势
export const advantageForm: any = [
  {
    component: 'boxCollapse',
    props: {
      title: '个人优势',
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
]
export const advantageConfig = {
  form: advantageForm,
  type: 'advantage',
  name: '个人优势',
}
// 工作经历
export const workForm: any = [
  {
    type: 'object',
    component: 'boxCollapse',

    props: {
      title: '工作经历',
    },
    children: [
      {
        component: 'work',
        type: 'array',
        drag: true,
        dragClass: 'item-drag',
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
    ],
  },
]
export const workConfig = {
  form: workForm,
  type: 'work',
  name: '工作经历',
}

// 项目经历
export const projectForm: any = [
  {
    type: 'object',
    component: 'boxCollapse',
    props: {
      title: '项目经历',
    },
    drag: true,
    dragClass: 'item-drag',
    children: [
      {
        component: 'project',
        type: 'array',
        drag: true,
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
    ],
  },
]
export const projectConfig = {
  form: projectForm,
  type: 'project',
  name: '项目经历',
}
// 教育经历
export const educationForm: any = [
  {
    type: 'object',
    component: 'boxCollapse',
    props: {
      title: '教育经历',
    },
    children: [
      {
        component: 'education',
        type: 'array',
        drag: true,
        dragClass: 'item-drag',
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
    ],
  },
]
export const educationConfig = {
  form: educationForm,
  type: 'education',
  name: '教育经历',
}
export const allConfig = {
  skill: skillConfig,
  user: userConfig,
  advantage: advantageConfig,
  education: educationConfig,
  work: workConfig,
  project: projectConfig,
}
