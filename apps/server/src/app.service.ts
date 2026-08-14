import { Injectable } from '@nestjs/common'
import { baseConfig } from './config/base.config'
@Injectable()
export class AppService {
  ping(): string {
    return `${baseConfig.app.name}启动成功`
  }
}
