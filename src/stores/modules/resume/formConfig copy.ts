// 用户信息
export const userForm = [
  {
    type: 'object',
    component: 'title',
    props: {
      name: '用户信息',
    },
    data: [
      {
        path: ['user', 'name'],
        key: 'modelValue',
      },
    ],
  },
  {
    list: [
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
          clearable: true,
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
    ],
    drag: false,
    type: 'array',
    key: 'user',
    name: '用户信息',
  },
]
// 教育经历
export const educationForm: any = {
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
        type: 'object',
        component: 'itemCollapse',
        data: {
          path: ['education'],
          key: 'modelValue',
        },
        slot: true,
        children: {
          fields: [
            {
              type: 'array',
              drag: true,
              list: [
                {
                  type: 'object',
                  component: 'input',
                  label: '学校名称',
                  span: 12,
                  data: {
                    path: ['education', '?', 'name'],
                    key: 'modelValue',
                  },
                  props: {
                    placeholder: '请输入学校名称',
                    clearable: true,
                  },
                },
                {
                  type: 'object',
                  component: 'input',
                  label: '学历',
                  span: 12,
                  data: {
                    path: ['education', '?', 'education'],
                    key: 'modelValue',
                  },
                  props: {
                    placeholder: '请输入学历',
                    clearable: true,
                  },
                },
                {
                  type: 'object',
                  component: 'input',
                  label: '专业',
                  span: 12,
                  data: {
                    path: ['education', '?', 'post'],
                    key: 'modelValue',
                  },
                  props: {
                    placeholder: '请输入专业',
                    clearable: true,
                  },
                },
                {
                  type: 'object',
                  component: 'input',
                  label: '入学时间',
                  span: 12,
                  data: {
                    path: ['education', '?', 'time'],
                    key: 'modelValue',
                  },
                  props: {
                    placeholder: '请输入入学时间',
                    clearable: true,
                  },
                },

                {
                  type: 'object',
                  component: 'input',
                  label: '学制',
                  span: 24,
                  data: {
                    path: ['education', '?', 'mode'],
                    key: 'modelValue',
                  },
                  props: {
                    placeholder: '请输入学制',
                    clearable: true,
                  },
                },

                // {
                //   type: 'object',
                //   component: 'input',
                //   // data: [
                //   //   {
                //   //     path: ['education', '?', 'name'],
                //   //     key: 'name',
                //   //     props: {
                //   //       placeholder: '请输入学校名称',
                //   //       clearable: true,
                //   //     },
                //   //   },
                //   //   {
                //   //     path: ['education', '?', 'education'],
                //   //     key: 'education',
                //   //     props: {
                //   //       placeholder: '请输入学历',
                //   //       clearable: true,
                //   //     },
                //   //   },
                //   //   {
                //   //     path: ['education', '?', 'post'],
                //   //     key: 'post',
                //   //     props: {
                //   //       placeholder: '请输入专业',
                //   //       clearable: true,
                //   //     },
                //   //   },
                //   //   {
                //   //     path: ['education', '?', 'time'],
                //   //     key: 'time',
                //   //     props: {
                //   //       placeholder: '请输入时间',
                //   //       clearable: true,
                //   //     },
                //   //   },
                //   //   {
                //   //     path: ['education', '?', 'content'],
                //   //     key: 'content',
                //   //     props: {
                //   //       placeholder: '请输入内容',
                //   //       clearable: true,
                //   //     },
                //   //   },
                //   //   // 学制
                //   //   {
                //   //     path: ['education', '?', 'mode'],
                //   //     key: 'mode',
                //   //     props: {
                //   //       placeholder: '请输入学制',
                //   //       clearable: true,
                //   //     },
                //   //   },
                //   // ],
                //   // component: 'education',
                //   span: 24,
                // },
              ],
            },
            {
              type: 'object',
              component: 'wangEdit',
              data: {
                path: ['education', '?', 'content'],
                key: 'modelValue',
              },
              props: {
                placeholder: '请输入内容',
                clearable: true,
              },
            },
          ],
        },
      },
    ],
  },
}
// 专业技能
export const skillForm: any = {
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
export const advantageForm: any = {
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
export const workForm: any = {
  type: 'object',
  key: 'work',
  name: '工作经历',
  component: 'boxCollapse',
  props: {
    title: '工作经历',
  },
  slot: true,
  children: [
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
}
// 项目经历
export const projectForm: any = {
  type: 'object',
  key: 'project',
  name: '项目经历',
  component: 'boxCollapse',
  props: {
    title: '项目经历',
  },
  drag: true,
  slot: true,
  children: [
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
}

// 自定义经历
export const customForm: any = {
  type: 'object',
  key: 'custom',
  name: '',
  component: 'boxCollapse',
  props: {
    title: '',
  },
  slot: true,
  children: [
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
}

export const allConfig = {
  skill: skillForm,
  user: userForm,
  advantage: advantageForm,
  education: educationForm,
  work: workForm,
  project: projectForm,
  custom: customForm,
}
