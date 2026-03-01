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
    email: '1611****570@qq.com',
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
  ],
  work: [
    {
      name: '浙江嘉兴****有限公司',
      post: '前端开发工程师',
      time: ['2022.08.01', '2026.06.01'],
      content: '<p>好哦</p>',
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
