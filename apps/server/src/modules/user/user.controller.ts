import { Controller, Post, Body, Get } from '@nestjs/common'
import { UserService } from './user.service'
import { RsaService } from '../../shared/rsa/rsa.service'
import { LoginDto } from './dto/login.dto'

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rsaService: RsaService,
  ) {}

  @Get('public-key')
  async getPublicKey() {
    return this.rsaService.generateKeyPair()
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto.phone, loginDto.password, loginDto.publicKeyId)
  }
}
