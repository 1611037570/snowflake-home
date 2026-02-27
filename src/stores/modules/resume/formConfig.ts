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

// 个人信息表单配置
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
  key: 'user',
}

export const skillForm: FormItem[] = [
  {
    type: 'object',
    label: '专业技能',
    component: 'input',
    data: {
      path: ['skill'],
      key: 'modelValue',
    },
    props: {
      placeholder: '请输入专业技能',
    },
  },
]
export const skillConfig = {
  form: skillForm,
  key: 'skill',
}

export const allForm = {
  skill: skillForm,
  user: userForm,
}
