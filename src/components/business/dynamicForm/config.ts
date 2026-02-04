const DEFAULT_FORM = [
  {
    type: 'object',
    label: 'input',
    component: 'input',
    data: {
      path: ['name'],
      key: 'modelValue',
    },
  },
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
    type: 'object',
    label: 'input',
    component: 'input',
    data: {
      path: ['info', 'like'],
      key: 'modelValue',
    },
  },
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
}
export { DEFAULT_FORM, DEFAULT_DATA }
