export interface ResumeData {
  user: {
    name: string
    birthday: string
    phone: string
    email: string
    workTime: string
    sex: string
  }
}

// 默认简历数据
export const defaultData: ResumeData = {
  user: {
    name: '',
    birthday: '',
    phone: '',
    email: '',
    workTime: '',
    sex: '',
  },
}
