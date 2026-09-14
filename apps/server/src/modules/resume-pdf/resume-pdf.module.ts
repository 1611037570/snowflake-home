import { Module } from '@nestjs/common'
import { ResumePdfController } from './resume-pdf.controller'
import { ResumePdfService } from './resume-pdf.service'

@Module({
  controllers: [ResumePdfController],
  providers: [ResumePdfService],
})
export class ResumePdfModule {}
