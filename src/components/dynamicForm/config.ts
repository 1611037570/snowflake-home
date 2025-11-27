const DEFAULT_CONFIG = [
  {
    type: 'object',
    label: 'input',
    component: 'input',
    data: {
      key: ['name'],
      name: 'modelValue',
    },
  },
  {
    type: 'object',
    label: 'input',
    component: 'input',
    data: {
      key: ['info', 'like'],
      name: 'modelValue',
    },
  },
  {
    type: 'object',
    label: 'input',
    component: 'input',
    data: {
      key: ['info', 'like'],
      name: 'modelValue',
    },
  },
  {
    type: 'object',
    label: 'input',
    component: 'input',
    data: {
      key: ['info', 'like'],
      name: 'modelValue',
    },
  },
  {
    type: 'array',
    label: 'input',
    component: 'input',
    data: [
      {
        key: ['test', '?', 'like'],
        name: 'modelValue',
      },
      {
        key: ['test', '?', 'name'],
        name: 'modelValue',
      },
      {
        key: ['test', '?', 'age'],
        name: 'modelValue',
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
export { DEFAULT_CONFIG, DEFAULT_DATA }
