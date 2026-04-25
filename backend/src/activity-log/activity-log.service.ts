import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async log(data: any) {
    const log = this.activityLogRepository.create(data);
    return this.activityLogRepository.save(log);
  }

  async findAll(limit = 20) {
    return this.activityLogRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
