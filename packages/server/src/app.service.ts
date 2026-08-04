import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '雪花起始页API服务启动成功';
  }
}
