import { Global, Module } from '@nestjs/common'
import { RsaService } from './rsa.service'

@Global()
@Module({
  providers: [RsaService],
  exports: [RsaService],
})
export class RsaModule {}
