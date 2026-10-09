import { IsNotEmpty, IsString, Length } from 'class-validator'

export class ReportVisitorDto {
  @IsString({ message: '匿名标识格式不正确' })
  @IsNotEmpty({ message: '匿名标识不能为空' })
  @Length(1, 64, { message: '匿名标识长度不能超过64个字符' })
  clientId: string
}
