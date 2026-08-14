import { Injectable, BadRequestException } from '@nestjs/common'
import * as crypto from 'crypto'
import { RedisService } from '../redis/redis.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class RsaService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 生成 RSA 密钥对，公钥发给前端，私钥存入 Redis (5分钟有效)
   */
  async generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })

    const publicKeyId = uuidv4()
    // 存储私钥，5分钟有效期
    await this.redisService.set(`rsa:private:${publicKeyId}`, privateKey, 300)

    return { publicKey, publicKeyId }
  }

  /**
   * 使用私钥解密前端传来的数据
   */
  async decrypt(encryptedData: string, publicKeyId: string): Promise<string> {
    const privateKey = await this.redisService.get(`rsa:private:${publicKeyId}`)
    if (!privateKey) {
      throw new BadRequestException('密钥已过期或不存在，请重新获取公钥')
    }

    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedData, 'base64'),
      )

      // 解密后立即删除私钥，确保一次性使用
      await this.redisService.del(`rsa:private:${publicKeyId}`)

      return decrypted.toString('utf8')
    } catch (error) {
      throw new BadRequestException('数据解密失败，请检查加密方式是否正确')
    }
  }
}
