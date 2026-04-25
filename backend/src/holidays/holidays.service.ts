import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto, userId: number) {
    // Check if holiday already exists on this date
    const existing = await this.holidayRepository.findOne({
      where: {
        date: new Date(createHolidayDto.date),
        is_active: true,
      },
    });

    if (existing) {
      throw new ConflictException('Holiday already exists on this date');
    }

    const holiday = this.holidayRepository.create({
      ...createHolidayDto,
      created_by: userId,
      department_ids: createHolidayDto.department_ids
        ? createHolidayDto.department_ids.map((d: any) => Number(d))
        : [],
    });

    return this.holidayRepository.save(holiday);
  }

  async findAll(year?: number) {
    const query = this.holidayRepository.createQueryBuilder('holiday');
    query.where('holiday.is_active = :isActive', { isActive: true });

    if (year) {
      query.andWhere('holiday.year = :year', { year });
    }

    return query.orderBy('holiday.date', 'ASC').getMany();
  }

  async findByYear(year: number) {
    return this.holidayRepository.find({
      where: { year, is_active: true },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: number) {
    const holiday = await this.holidayRepository.findOne({
      where: { id, is_active: true },
    });

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    return holiday;
  }

  async update(id: number, updateHolidayDto: UpdateHolidayDto) {
    const holiday = await this.findOne(id);
    Object.assign(holiday, updateHolidayDto);
    return this.holidayRepository.save(holiday);
  }

  async remove(id: number) {
    const holiday = await this.findOne(id);
    holiday.is_active = false;
    return this.holidayRepository.save(holiday);
  }

  async getHolidaysForEmployee(employeeId: number, year: number) {
    const employee = await this.userRepository.findOne({ where: { id: employeeId } });
    const departmentId = employee?.department_id || null;
    const query = this.holidayRepository.createQueryBuilder('holiday');

    query.where('holiday.is_active = :isActive', { isActive: true });
    query.andWhere('holiday.year = :year', { year });

    if (departmentId) {
      query.andWhere(
        '(holiday.applicable_to = :all OR :departmentId = ANY(holiday.department_ids))',
        {
          all: 'all',
          departmentId,
        },
      );
    } else {
      query.andWhere('holiday.applicable_to = :all', { all: 'all' });
    }

    return query.orderBy('holiday.date', 'ASC').getMany();
  }
  async convertToNestedFormat(holidays: Holiday[]) {
    // Convert flat list to nested format: { year: { month: [days] } }
    const result = {};

    holidays.forEach((holiday) => {
      if (!result[holiday.year]) {
        result[holiday.year] = {};
      }
      if (!result[holiday.year][holiday.month]) {
        result[holiday.year][holiday.month] = [];
      }
      result[holiday.year][holiday.month].push(holiday.day);
    });

    return result;
  }
}
