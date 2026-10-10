import { Injectable } from '@nestjs/common'
import { config } from './configs'
@Injectable()
export class AppService {
  ping(): string {
    return `${config.app.name}启动成功`
  }
}
