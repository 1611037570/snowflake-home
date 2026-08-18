import { IsOptional, IsString, Length } from 'class-validator'

export class CreateDemoDto {
  @IsString()
  @Length(1, 20)
  name: string

  @IsOptional()
  @IsString()
  description?: string
}
