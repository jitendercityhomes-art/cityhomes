import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { User, UserRole } from '../entities/user.entity';
import { Holiday } from '../holidays/entities/holiday.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AttendanceCron {
  private readonly logger = new Logger(AttendanceCron.name);

  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Holiday)
    private holidayRepo: Repository<Holiday>,
    private settingsService: SettingsService,
  ) {}

  // ─── CRON 1: Auto Punch Out at 11:59 PM ──────────────────
  @Cron('59 23 * * *', { timeZone: 'Asia/Kolkata' })
  async autoPunchOut() {
    const today = new Date().toISOString().split('T')[0];

    const unpunchedOut = await this.attendanceRepo.find({
      where: {
        date: today,
        punch_out_time: IsNull(),
        punch_in_time: Not(IsNull()),
      },
    });

    for (const record of unpunchedOut) {
      const autoPunchOutTime = new Date();
      autoPunchOutTime.setHours(23, 59, 0, 0);

      const workingHours = (autoPunchOutTime.getTime() - record.punch_in_time.getTime()) / (1000 * 60 * 60);

      const finalStatus = record.status === 'pending' ? 'present' : record.status;

      await this.attendanceRepo.update(record.id, {
        punch_out_time: autoPunchOutTime,
        punch_out_auto: true,
        working_hours: parseFloat(workingHours.toFixed(2)),
        status: finalStatus,
        updated_at: new Date(),
      });
    }

    this.logger.log(`[AutoPunchOut] ${unpunchedOut.length} records auto punched out at 23:59`);
  }

  // ─── CRON 2: Auto Mark Absent at 12:00 AM ────────────────
  @Cron('1 0 * * *', { timeZone: 'Asia/Kolkata' })
  async autoMarkAbsent() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const allEmployees = await this.userRepo.find({
      where: { isActive: true, role: Not(UserRole.SUPERADMIN) },
      relations: ['department'],
    });

    for (const employee of allEmployees) {
      // Skip if yesterday is before joining date
      if (employee.date_of_joining) {
        const joiningDate = new Date(employee.date_of_joining);
        joiningDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(yesterday);
        checkDate.setHours(0, 0, 0, 0);
        if (checkDate < joiningDate) {
          continue;
        }
      }

      const existing = await this.attendanceRepo.findOne({
        where: { employee_id: employee.id, date: yesterdayStr },
      });

      if (!existing) {
        const isWeekOff = await this.isWeekOffDay(employee, yesterday);
        const isHoliday = await this.isHolidayDay(yesterday);

        if (!isWeekOff && !isHoliday) {
          await this.attendanceRepo.save({
            employee_id: employee.id,
            date: yesterdayStr,
            status: 'absent',
            punch_out_auto: false,
          });
        } else if (isWeekOff) {
          await this.attendanceRepo.save({
            employee_id: employee.id,
            date: yesterdayStr,
            status: 'week_off',
          });
        } else if (isHoliday) {
          await this.attendanceRepo.save({
            employee_id: employee.id,
            date: yesterdayStr,
            status: 'holiday',
          });
        }
      }
    }

    this.logger.log(`[AutoAbsent] Processed ${allEmployees.length} employees for ${yesterdayStr}`);
  }

  private async isWeekOffDay(employee: User, date: Date): Promise<boolean> {
    const holidaySettings = await this.settingsService.getHolidaySettings();
    const deptWeekOffDays = this.normalizeWeekOffDays(employee?.department?.week_off_days);
    const deptName = employee?.department?.name?.toLowerCase() || '';

    let weekOffDays: number[] = [];
    if (deptWeekOffDays.length > 0) {
      weekOffDays = deptWeekOffDays;
    } else {
      weekOffDays = employee?.department ? [] : this.normalizeWeekOffDays(holidaySettings.week_off_days);
    }

    return weekOffDays.includes(date.getDay());
  }

  private normalizeWeekOffDays(value: any): number[] {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) {
      return value
        .map((item) => Number(item))
        .filter((n) => Number.isFinite(n) && n >= 0 && n <= 6);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          return this.normalizeWeekOffDays(JSON.parse(trimmed));
        } catch {
          // fall through to manual parse
        }
      }
      return trimmed
        .split(/[,\s]+/)
        .map((item) => Number(item.trim()))
        .filter((n) => Number.isFinite(n) && n >= 0 && n <= 6);
    }
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 && num <= 6 ? [num] : [];
  }

  private normalizeHolidayDateString(value: any): string | null {
    if (!value) return null;
    const dateString = String(value).trim();
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  private async isHolidayDay(date: Date): Promise<boolean> {
    const holidayDateKey = date.toISOString().split('T')[0];
    const [holiday, holidaySettings] = await Promise.all([
      this.holidayRepo.findOne({
        where: {
          date: date,
          is_active: true,
        },
      }),
      this.settingsService.getHolidaySettings(),
    ]);

    if (holiday) return true;
    const configHolidays = (holidaySettings.paid_holidays || [])
      .map((value) => this.normalizeHolidayDateString(value))
      .filter(Boolean);
    return configHolidays.includes(holidayDateKey);
  }
}
