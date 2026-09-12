import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn({ comment: 'Primary key' })
  id: number

  @Column('text', { comment: 'Feedback content' })
  content: string

  @Column({ nullable: true, comment: 'Contact information' })
  contact?: string

  @Column({ name: 'page_url', nullable: true, length: 2048, comment: 'Source page URL' })
  pageUrl?: string

  @CreateDateColumn({ name: 'created_at', comment: 'Creation time' })
  createdAt: Date
}
