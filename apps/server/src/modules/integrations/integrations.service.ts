import { Injectable } from '@nestjs/common'
import type { Request } from 'express'
import { config } from '../../configs'

// 仓库星标缓存条目
type StarsCache = {
  stars: number; // 仓库 Star 总数
  updatedAt: number; // 最近一次成功获取的时间戳
}

@Injectable()
export class IntegrationsService {
  // 星标缓存保留在进程内，避免每个访问者都触发上游配额
  private starsCache: StarsCache | null = null

  /**
   * 请求第三方并返回 JSON，超时统一由 services 配置控制
   */
  private async requestJson(url: string, headers: Record<string, string> = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), config.integrations.timeout)
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`上游请求失败（HTTP ${response.status}）`)
      const data = await response.json()
      return data
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * 拼接上游地址，避免基地址尾斜杠产生空路径段
   */
  private buildUrl(baseUrl: string, path: string) {
    return `${baseUrl.replace(/\/+$/, '')}${path}`
  }

  /**
   * 读取访问者地址：代理链路首个地址才是访问者，避免误取服务器出口地址
   */
  getVisitorIp(request: Request) {
    const forwarded = request.headers['x-forwarded-for']
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded
    const ip = (forwardedIp?.split(',')[0] || request.ip || '').trim()
    return { ip }
  }

  /**
   * 查询指定城市的天气，城市名只允许中英文，避免拼出非预期路径
   */
  async getWeather(city: string) {
    const name = (city || '').trim()
    if (!/^[\u4e00-\u9fa5a-zA-Z]{1,20}$/.test(name)) throw new Error('城市名称不合法')
    const { baseUrl, appId, appSecret } = config.integrations.weather
    if (!baseUrl || !appId || !appSecret) throw new Error('天气服务未配置')
    // 凭据由服务端注入，浏览器无需持有上游应用标识
    const params = new URLSearchParams({ app_id: appId, app_secret: appSecret })
    const url = this.buildUrl(baseUrl, `/api/weather/current/${encodeURIComponent(name)}?${params}`)
    const data = await this.requestJson(url)
    // 上游用业务码表达结果，成功时返回数据体，其余按失败处理
    if (data?.code !== 1) throw new Error(data?.msg || '天气查询失败')
    return data.data
  }

  /**
   * 查询指定分类的热榜，分类必须在白名单内
   */
  async getHotList(category: string) {
    const { baseUrl, categories } = config.integrations.hotList
    if (!baseUrl) throw new Error('热榜服务未配置')
    if (!categories.includes(category)) throw new Error('不支持的热榜分类')
    const url = this.buildUrl(baseUrl, `/doc/hotlist/${encodeURIComponent(category)}`)
    return this.requestJson(url)
  }

  /**
   * 查询搜索结果，关键词由 URLSearchParams 编码，避免特殊字符截断请求
   */
  async getSearch(keyword: string) {
    const word = (keyword || '').trim()
    if (!word || word.length > 50) throw new Error('搜索关键词不合法')
    const { baseUrl } = config.integrations.search
    if (!baseUrl) throw new Error('搜索服务未配置')
    const params = new URLSearchParams({ msg: word })
    const url = this.buildUrl(baseUrl, `/api/baidu-search/?${params}`)
    return this.requestJson(url)
  }

  /**
   * 查询固定仓库星标，结果按配置的时间缓存
   */
  async getGithubStars() {
    const { starsCacheTtl } = config.integrations.github
    const now = Date.now()
    if (this.starsCache && now - this.starsCache.updatedAt < starsCacheTtl) {
      return this.starsCache
    }
    // 固定查询项目仓库，避免配置或路径编码错误
    const url = 'https://api.github.com/repos/1611037570/snowflake-home'
    const data = await this.requestJson(url, { Accept: 'application/vnd.github+json' })
    // 零颗 Star 也是有效结果，拒绝异常数字后再进入缓存
    if (!Number.isSafeInteger(data?.stargazers_count) || data.stargazers_count < 0) {
      throw new Error('仓库星标数据无效')
    }
    this.starsCache = { stars: data.stargazers_count, updatedAt: now }
    return this.starsCache
  }
}
