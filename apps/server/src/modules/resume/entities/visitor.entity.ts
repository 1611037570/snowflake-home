import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('visitors')
export class Visitor {
  @PrimaryGeneratedColumn({ comment: '主键' })
  id: number

  // 匿名标识由浏览器生成并持久化，没有登录时以此作为用户数的去重依据
  @Column({ name: 'client_id', unique: true, length: 64, comment: '匿名标识，统计用户数的去重依据' })
  clientId: string

  @CreateDateColumn({ name: 'first_visit_at', comment: '首次访问时间' })
  firstVisitAt: Date

  @UpdateDateColumn({ name: 'last_visit_at', comment: '最后访问时间' })
  lastVisitAt: Date
}
