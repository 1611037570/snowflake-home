import { Injectable } from '@nestjs/common'
import { CreateDemoDto } from './demo.dto'

@Injectable()
export class DemoService {
  ping() {
    return {
      message: 'pong',
    }
  }

  hello(name: string) {
    return {
      message: `Hello, ${name || 'World'}!`,
    }
  }

  getDetail(id: string) {
    return {
      id,
      name: 'demo',
    }
  }

  create(data: CreateDemoDto) {
    return {
      id: 1,
      ...data,
    }
  }
}
