export interface UserData {
  user?: {
    name: string
    birthday: string
    phone: string
    email: string
    workTime: string
    sex: string
  }
  skill?: string
  education?: {
    name: string
    education: string
    post: string
    time: [string, string]
    content: string
  }[]
  work?: {
    name: string
    post: string
    time: [string, string]
    content: string
  }[]
  project?: {
    name: string
    post: string
    time: [string, string]
    content: string
  }[]
}

// 默认用户数据
export const userData: UserData = {
  user: {
    name: '小羊',
    birthday: '2000-07',
    phone: '158****2637',
    email: '161****570@qq.com',
    workTime: '2022.08.01',
    sex: '男',
  },
  skill: '',
  education: [
    {
      name: '***工学院',
      education: '本科',
      post: '计算机科学与技术',
      time: ['2019.09.01', '2023.06.30'],
      content: '<p><br></p>',
    },
    {
      name: '****职业学院',
      education: '大专',
      post: '计算机网络',
      time: ['2018.09.01', '2021.06.30'],
      content: '<p><br></p>',
    },
  ],
  work: [
    {
      name: '浙江****有限公司',
      post: '前端开发工程师',
      time: ['2022.08.01', '2026.06.01'],
      content:
        '<p><strong>2023.5-2024.2：</strong>参与**社区的功能开发与系统维护，优化用户体验并提升系统稳定性，支持平台日均数百万用户的稳定访问。 </p><p><strong>2024.3-2025.2：</strong>主导**社区5.0版本重构工作，推动组件化落地，提升代码复用率与开发效率，缩短新功能开发周期约30%。 &nbsp;</p><p><strong>2025.2-2026.4：</strong>负责社区6.0版本实现AI Agent在前端的落地应用，从前端交互到后端接口的全流程开发。</p>',
    },
  ],
  project: [
    {
      name: '**社区',
      post: '前端开发工程师',
      time: ['2022.08.01', '2026.06.01'],
      content: '',
    },
  ],
}
