const DEFAULT_FORM = [
  {
    type: 'object',
    label: 'input',
    component: 'input',
    data: {
      path: ['info', 'like'],
      key: 'modelValue',
    },
  },
  {
    type: 'array',
    label: 'input',
    component: 'input',
    data: [
      {
        path: ['test', '?', 'like'],
        key: 'modelValue',
      },
      {
        path: ['test', '?', 'name'],
        key: 'modelValue',
      },
      {
        path: ['test', '?', 'age'],
        key: 'modelValue',
      },
    ],
  },
  {
    label: '递归容器',
    children: [
      {
        type: 'object',
        label: '嵌套输入1',
        component: 'input',
        data: {
          path: ['nested', 'field1'],
          key: 'modelValue',
        },
      },
      {
        label: '二级递归',
        children: [
          {
            type: 'object',
            label: '深层输入',
            component: 'input',
            data: {
              path: ['nested', 'deep', 'field'],
              key: 'modelValue',
            },
          },
          {
            label: '三级递归',
            children: [
              {
                type: 'object',
                label: '深层输入',
                component: 'input',
                data: {
                  path: ['nested', 'deep', 'field'],
                  key: 'modelValue',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    component: 'collapse', // 指定容器组件
    props: {
      modelValue: ['1'],
      accordion: true,
      title: '123dddd',
    },
    children: [
      // 这里的内容会被放入 collapse 的默认插槽中
      {
        component: 'collapseItem',
        props: {
          title: '基础信息',
          name: '1',
        },
        children: [
          {
            type: 'object',
            label: '基础信息1',
            component: 'input',
            data: {
              path: ['nested', 'field1'],
              key: 'modelValue',
            },
          },
          {
            type: 'object',
            label: '基础信息2',
            component: 'input',
            data: {
              path: ['nested', 'field2'],
              key: 'modelValue',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'object',
    label: '错误配置测试',
    // 故意缺少 data 属性，触发错误提示
  },
]

const DEFAULT_DATA = {
  name: 'lxy',
  city: 'shenzhen',
  info: {
    like: 'yyqx',
  },
  arr: [
    {
      like: 'yyqx',
    },
  ],
  nested: {
    field1: '递归层级1',
    deep: {
      field: '递归层级2',
    },
  },
}
export { DEFAULT_DATA, DEFAULT_FORM }
