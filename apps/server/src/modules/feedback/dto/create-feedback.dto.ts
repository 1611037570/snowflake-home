import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateFeedbackDto {
  @IsString({ message: '反馈内容格式不正确' })
  @IsNotEmpty({ message: '反馈内容不能为空' })
  @MaxLength(1000, { message: '反馈内容不能超过1000个字符' })
  content: string

  @IsOptional()
  @IsString({ message: '联系方式格式不正确' })
  @MaxLength(100, { message: '联系方式不能超过100个字符' })
  contact?: string

  @IsOptional()
  @IsString({ message: '页面地址格式不正确' })
  @MaxLength(2048, { message: '页面地址不能超过2048个字符' })
  pageUrl?: string
}
