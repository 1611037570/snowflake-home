import { IsIn, IsOptional } from 'class-validator'

// 使用动作取值：新建简历、导入简历、导出简历
const EVENT_TYPES = ['create', 'import', 'export']
// 文件格式取值：新建动作不涉及文件，统一记为 none
const FILE_TYPES = ['pdf', 'png', 'markdown', 'html', 'json', 'none']
// 导出产出方式取值：本地渲染、云端渲染、长图导出
const SOURCES = ['local', 'server', 'image']

export class ReportActionDto {
  @IsIn(EVENT_TYPES, { message: '使用动作取值不合法' })
  eventType: string

  @IsIn(FILE_TYPES, { message: '文件格式取值不合法' })
  fileType: string

  @IsOptional()
  @IsIn(SOURCES, { message: '产出方式取值不合法' })
  source?: string
}
