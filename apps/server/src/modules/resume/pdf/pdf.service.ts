import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { chromium, type Browser } from 'playwright'
import { config } from '../../../configs'

@Injectable()
export class PdfService implements OnModuleDestroy {
  /** 排队上限，队列满时直接拒绝而不是继续堆积，避免等待时间被拖到不可接受 */
  private static readonly MAX_WAITING = 20
  private browserPromise?: Promise<Browser>
  /** 当前是否有渲染任务在执行 */
  private running = false
  /** 排队等待的渲染任务，先进先出，保证并发恒为 1 */
  private readonly waiting: Array<() => void> = []

  async createPdf(item: unknown, system?: unknown): Promise<Buffer> {
    if (!item || typeof item !== 'object') {
      throw new BadRequestException('简历数据无效')
    }

    // 云端渲染是重资源任务，统一串行排队：超出的请求等待上一单结束，而不是并发拖垮服务
    await this.acquire()
    try {
      return await this.render(item, system)
    } finally {
      this.release()
    }
  }

  async onModuleDestroy() {
    const browser = await this.browserPromise?.catch(() => undefined)
    await browser?.close()
  }

  // 渲染整份 PDF：所有步骤共用同一份总预算，超时立刻关页释放资源
  private async render(item: unknown, system?: unknown): Promise<Buffer> {
    const deadline = Date.now() + config.pdf.timeout
    // 每一步只取剩余预算，避免单步超时叠加后整体失去上限
    const takeStep = <T>(run: (timeout: number) => Promise<T>): Promise<T> => {
      const leftover = deadline - Date.now()
      if (leftover <= 0) throw new RequestTimeoutException('简历渲染超时，请稍后重试')
      return run(leftover)
    }

    const browser = await this.getBrowser()
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 1,
    })

    // 看门狗兜底：page.pdf() 这类阻塞单步超时管不到，到点直接关页让渲染失败退出
    let expired = false
    const watchdog = setTimeout(() => {
      expired = true
      void page.close().catch(() => undefined)
    }, config.pdf.timeout)

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
      await takeStep((timeout) =>
        page.goto(config.pdf.renderUrl, { waitUntil: 'domcontentloaded', timeout }),
      )
      await takeStep((timeout) =>
        page.waitForSelector('[data-pdf-ready="true"]', { state: 'attached', timeout }),
      )

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      return Buffer.from(pdf)
    } catch (error) {
      if (expired) throw new RequestTimeoutException('简历渲染超时，请稍后重试')
      throw error
    } finally {
      clearTimeout(watchdog)
      await page.close().catch(() => undefined)
    }
  }

  // 并发为 1 的信号量：空闲则立刻执行，占用中则排队等前一个任务交棒
  private acquire(): Promise<void> {
    if (!this.running) {
      this.running = true
      return Promise.resolve()
    }
    if (this.waiting.length >= PdfService.MAX_WAITING) {
      throw new ServiceUnavailableException('当前导出任务已排满，请稍后重试')
    }
    return new Promise<void>((resolve) => {
      this.waiting.push(resolve)
    })
  }

  // 直接把执行权交给队首并保持占用标记，避免后来的请求插队
  private release(): void {
    const next = this.waiting.shift()
    if (next) {
      next()
      return
    }
    this.running = false
  }

  private getBrowser(): Promise<Browser> {
    this.browserPromise ??= chromium.launch({ headless: true }).catch((error) => {
      this.browserPromise = undefined
      throw error
    })
    return this.browserPromise
  }
}
