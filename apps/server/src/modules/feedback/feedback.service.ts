import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateFeedbackDto } from './dto/create-feedback.dto'
import { Feedback } from './feedback.entity'

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto) {
    // Persist submitted feedback for subsequent review.
    const feedback = this.feedbackRepository.create(createFeedbackDto)
    const savedFeedback = await this.feedbackRepository.save(feedback)

    return { id: savedFeedback.id }
  }
}
