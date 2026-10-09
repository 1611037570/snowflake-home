import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Action } from '../entities/action.entity'
import { Visitor } from '../entities/visitor.entity'
import { ReportActionDto } from './dto/report-action.dto'
import { ReportVisitorDto } from './dto/report-visitor.dto'

@Injectable()
export class StatsService {
  constructor(
    // 简历实体全部取自名为 resume 的独立数据源
    @InjectRepository(Visitor, 'resume')
    private readonly visitorRepository: Repository<Visitor>,
    @InjectRepository(Action, 'resume')
    private readonly actionRepository: Repository<Action>,
  ) {}

  // 登记访客：已存在则刷新最后访问时间，不存在则作为首次访问写入
  async reportVisitor({ clientId }: ReportVisitorDto) {
    const visitor = await this.visitorRepository.findOne({ where: { clientId } })

    if (visitor) {
      await this.visitorRepository.update({ id: visitor.id }, { lastVisitAt: new Date() })
      return { isNew: false }
    }

    await this.visitorRepository.insert({ clientId })
    return { isNew: true }
  }

  // 记录一次使用动作
  async reportAction({ eventType, fileType, source }: ReportActionDto) {
    const action = this.actionRepository.create({ eventType, fileType, source })
    const savedAction = await this.actionRepository.save(action)

    return { id: savedAction.id }
  }

  // 统计概览：访客与动作各自聚合，两张表不做关联
  async getOverview(days: number) {
    // 以服务端当天零点为分界，新增与活跃都按此口径统计
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    // 趋势起始日：连同今天在内的 days 天
    const startDate = new Date(startOfToday)
    startDate.setDate(startDate.getDate() - (days - 1))

    const [totalUsers, newUsersToday, activeUsersToday] = await Promise.all([
      this.visitorRepository.count(),
      this.visitorRepository
        .createQueryBuilder('visitor')
        .where('visitor.firstVisitAt >= :startOfToday', { startOfToday })
        .getCount(),
      this.visitorRepository
        .createQueryBuilder('visitor')
        .where('visitor.lastVisitAt >= :startOfToday', { startOfToday })
        .getCount(),
    ])

    const eventRows = await this.actionRepository
      .createQueryBuilder('action')
      .select('action.eventType', 'eventType')
      .addSelect('COUNT(*)', 'total')
      .groupBy('action.eventType')
      .getRawMany()

    const fileRows = await this.actionRepository
      .createQueryBuilder('action')
      .select('action.fileType', 'fileType')
      .addSelect('COUNT(*)', 'total')
      .groupBy('action.fileType')
      .getRawMany()

    const dailyRows = await this.actionRepository
      .createQueryBuilder('action')
      .select('DATE(action.createdAt)', 'date')
      .addSelect('COUNT(*)', 'total')
      .where('action.createdAt >= :startDate', { startDate })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany()

    return {
      visitors: { totalUsers, newUsersToday, activeUsersToday },
      actions: this.toCountMap(eventRows, 'eventType'),
      fileTypes: this.toCountMap(fileRows, 'fileType'),
      daily: dailyRows.map((row) => ({ date: String(row.date), total: Number(row.total) })),
    }
  }

  // 把分组查询结果转成以分组值为键的计数对象
  private toCountMap(rows: Array<Record<string, unknown>>, key: string): Record<string, number> {
    return rows.reduce<Record<string, number>>((map, row) => {
      map[String(row[key])] = Number(row.total)
      return map
    }, {})
  }
}
