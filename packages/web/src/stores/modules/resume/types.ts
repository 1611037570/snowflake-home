// 简历数据类型
export interface Data {
  // 用户信息
  user: {
    // 求职岗位
    position?: string
    // 姓名
    name: string
    // 出生日期
    birthday: string
    // 手机号
    phone: string
    // 邮箱
    email?: string
    // 工作时间
    workTime?: string
    // 性别
    sex?: string
  }
  // 技能
  skill?: string
  // 账号
  account?: {
    // 名称
    name?: string
    // 链接
    url?: string
  }[]
  // 教育经历
  education?: {
    // 学校名称
    name?: string
    // 学历
    education?: string
    // 岗位
    post?: string
    // 时间
    time?: [string, string]
    // 学习模式
    mode?: string
    // 内容
    content?: string
  }[]
  // 工作经历
  work?: {
    // 公司名称
    name?: string
    // 岗位
    post?: string
    // 工作时间
    time?: [string, string]
    // 工作内容
    content?: string
  }[]
  // 项目经历
  project?: {
    // 项目名称
    name?: string
    // 项目岗位
    post?: string
    // 项目时间
    time?: [string, string]
    // 项目内容
    content?: string
  }[]
}
