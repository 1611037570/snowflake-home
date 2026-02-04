export interface UserData {
  user: {
    name: string
    birthday: string
    phone: string
    email: string
    workTime: string
    sex: string
  }
}

// 默认用户数据
export const userData: UserData = {
  user: {
    name: '',
    birthday: '',
    phone: '',
    email: '',
    workTime: '',
    sex: '',
  },
}
