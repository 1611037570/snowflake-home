import { IsNotEmpty, Matches, MinLength } from 'class-validator'

export class LoginDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确，必须为11位数字' })
  phone: string

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string

  @IsNotEmpty({ message: 'publicKeyId 不能为空' })
  publicKeyId: string
}
