import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { RedisService } from '../../shared/redis/redis.service';
import { RsaService } from '../../shared/rsa/rsa.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly rsaService: RsaService,
  ) { }

  async login(phone: string, passwordEncrypted: string, publicKeyId: string) {
    // 0. RSA 解密获取原始密码 (前端公钥加密后的 Base64 字符串)
    const password = await this.rsaService.decrypt(passwordEncrypted, publicKeyId);

    // 1. 获取或创建用户 (实现登录即注册)
    let user = await this.userRepository.findOne({ where: { phone } });

    if (user) {
      // 校验密码：比较前端传来的(已哈希)密码与数据库存储的(bcrypt哈希)密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('手机号或密码错误');
      }
    } else {
      // 注册新用户：对前端传来的密码进行 bcrypt 加密存储
      const hashedPassword = await bcrypt.hash(password, 10);
      user = this.userRepository.create({
        phone,
        password: hashedPassword,
        username: `用户_${phone.slice(-4)}`,
        registeredAt: new Date(),
      });
    }

    // 2. 更新活跃时间并保存
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // 3. 生成授权凭证并缓存
    const token = this.jwtService.sign({ phone: user.phone, sub: user.id });
    await this.redisService.set(`user:token:${user.id}`, token, 24 * 3600);

    return {
      access_token: token,
      user: { id: user.id, phone: user.phone, username: user.username },
    };
  }
}
