import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ comment: '主键ID' })
  id: number

  @Column({ unique: true, comment: '手机号' })
  phone: string

  @Column({ comment: '密码' })
  password: string

  @Column({ nullable: true, comment: '用户名' })
  username: string

  @Column({ name: 'registered_at', nullable: true, comment: '注册时间' })
  registeredAt: Date

  @Column({ name: 'last_login_at', nullable: true, comment: '最后使用时间' })
  lastLoginAt: Date

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date
}
