import { BadRequestException, Injectable, OnModuleDestroy } from '@nestjs/common'
import { chromium, type Browser } from 'playwright'
import { baseConfig } from '../../config/base.config'

@Injectable()
export class ResumePdfService implements OnModuleDestroy {
  private browserPromise?: Promise<Browser>

  async createPdf(item: unknown, system?: unknown): Promise<Buffer> {
    if (!item || typeof item !== 'object') {
      throw new BadRequestException('简历数据无效')
    }

    const browser = await this.getBrowser()
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 1,
    })

    try {
      // 在前端应用初始化前注入本次导出的简历数据，避免依赖浏览器本地存储。
      await page.addInitScript(
        (payload: { resumeItem: unknown; systemConfig: unknown }) => {
          const globalScope = globalThis as Record<string, unknown>
          globalScope.__SNOWFLAKE_RESUME_PRINT_DATA__ = {
            item: payload.resumeItem,
            system: payload.systemConfig,
          }
        },
        { resumeItem: item, systemConfig: system },
      )

      await page.emulateMedia({ media: 'print' })
      await page.goto(baseConfig.pdf.renderUrl, {
        waitUntil: 'domcontentloaded',
        timeout: baseConfig.pdf.timeout,
      })
      await page.waitForSelector('[data-pdf-ready="true"]', {
        state: 'attached',
        timeout: baseConfig.pdf.timeout,
      })

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      return Buffer.from(pdf)
    } finally {
      await page.close()
    }
  }

  async onModuleDestroy() {
    const browser = await this.browserPromise?.catch(() => undefined)
    await browser?.close()
  }

  private getBrowser(): Promise<Browser> {
    this.browserPromise ??= chromium.launch({ headless: true }).catch((error) => {
      this.browserPromise = undefined
      throw error
    })
    return this.browserPromise
  }
}
