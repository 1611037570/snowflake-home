import { Body, Controller, Post, Res } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { ResumePdfService } from './resume-pdf.service'

@ApiTags('简历')
@Controller('resume')
export class ResumePdfController {
  constructor(private readonly resumePdfService: ResumePdfService) {}

  @ApiOperation({ summary: '导出简历PDF' })
  @Post('pdf')
  async createPdf(
    @Body() payload: { item?: unknown; system?: unknown },
    @Res() response: Response,
  ) {
    const pdf = await this.resumePdfService.createPdf(payload?.item, payload?.system)

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', "attachment; filename*=UTF-8''resume.pdf")
    response.setHeader('Content-Length', pdf.length)
    response.send(pdf)
  }
}
