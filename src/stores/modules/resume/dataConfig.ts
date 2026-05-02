import { type Data } from './types'
// 默认数据
export const DEFAULT_DATA: Data = {
  user: {
    position: '',
    name: '',
    birthday: '',
    phone: '',
    email: '',
    workTime: '',
    sex: '',
  },
  account: [],
  skill: '',
  education: [
    {
      name: '',
      education: '',
      post: '',
      time: ['', ''],
      content: '',
      mode: '',
    },
  ],
  work: [
    {
      name: '',
      post: '',
      time: ['', ''],
      content: '',
    },
  ],
  project: [
    {
      name: '',
      post: '',
      time: ['', ''],
      content: '',
    },
  ],
}
const a = {
  user: {
    value: {
      name: {
        value: '',
        remark: '用户名称',
        required: true,
      },
      birthday: {
        value: '',
        remark: '用户出生日期',
        required: true,
      },
      phone: {
        value: '',
        remark: '用户手机号',
        required: true,
      },
      email: {
        value: '',
        remark: '用户邮箱',
        required: true,
      },
      workTime: {
        value: '',
        remark: '用户工作时间',
        required: true,
      },
      sex: {
        value: '',
        remark: '用户性别',
        required: false,
      },
      social: {
        value: [],
        remark: '用户社交账号',
        required: false,
      },
    },
    remark: '用户信息',
    required: true,
  },
  skill: {
    value: '',
    remark: '用户技能',
    required: false,
  },
  education: {
    value: [
      {
        name: {
          value: '',
          remark: '学校名称',
          required: true,
        },
        education: {
          value: '',
          remark: '学历',
          required: true,
        },
        post: {
          value: '',
          remark: '岗位',
          required: false,
        },
        time: {
          value: ['', ''],
          remark: '时间',
          required: true,
        },
        content: {
          value: '',
          remark: '内容',
          required: false,
        },
        mode: {
          value: '',
          remark: '学习模式',
          required: false,
        },
      },
    ],
    remark: '教育经历',
    required: false,
  },
  work: {
    value: [
      {
        name: {
          value: '',
          remark: '公司名称',
          required: true,
        },
        post: {
          value: '',
          remark: '岗位',
          required: true,
        },
        time: {
          value: ['', ''],
          remark: '工作时间',
          required: true,
        },
        content: {
          value: '',
          remark: '工作内容',
          required: true,
        },
      },
    ],
    remark: '工作经历',
    required: false,
  },
  project: {
    value: [
      {
        name: {
          value: '',
          remark: '项目名称',
          required: true,
        },
        post: {
          value: '',
          remark: '项目岗位',
          required: true,
        },
        time: {
          value: ['', ''],
          remark: '项目时间',
          required: true,
        },
        content: {
          value: '',
          remark: '项目内容',
          required: true,
        },
      },
    ],
    remark: '项目经历',
    required: false,
  },
}
