import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('actions')
@Index(['eventType'])
@Index(['fileType'])
export class Action {
  @PrimaryGeneratedColumn({ comment: '主键' })
  id: number

  // 一条记录即一次使用动作，与访客表不做关联
  @Column({ name: 'event_type', length: 16, comment: '使用动作：create 新建 / import 导入 / export 导出' })
  eventType: string

  @Column({ name: 'file_type', length: 16, comment: '文件格式：pdf / png / markdown / html / json，新建记为 none' })
  fileType: string

  @Column({ length: 16, nullable: true, comment: '产出方式：local 本地渲染 / server 云端渲染 / image 长图导出，仅导出时有值' })
  source?: string

  @CreateDateColumn({ name: 'created_at', comment: '发生时间' })
  createdAt: Date
}
