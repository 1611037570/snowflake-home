import { IsOptional, IsString, Length } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDemoDto {
  @ApiProperty({ description: '名称' })
  @IsString()
  @Length(1, 20)
  name: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string
}
