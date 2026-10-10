import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'
import { config } from '../../configs'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis

  onModuleInit() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
    })
  }

  onModuleDestroy() {
    this.client.disconnect()
  }

  getClient(): Redis {
    return this.client
  }

  async set(key: string, value: any, ttl?: number) {
    const val = typeof value === 'string' ? value : JSON.stringify(value)
    if (ttl) {
      await this.client.set(key, val, 'EX', ttl)
    } else {
      await this.client.set(key, val)
    }
  }

  async get(key: string) {
    return await this.client.get(key)
  }

  async del(key: string) {
    await this.client.del(key)
  }
}
