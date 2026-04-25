import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceSettings } from '../entities/attendance-settings.entity';
import { User } from '../entities/user.entity';
import { Branch } from '../branches/branch.entity';
import { Holiday } from '../holidays/entities/holiday.entity';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { Department } from '../departments/entities/department.entity';
import { PayrollRun } from '../payroll/entities/payroll-run.entity';
import { PunchInDto } from './dto/punch-in.dto';
import { PunchOutDto } from './dto/punch-out.dto';
import { EditAttendanceDto } from './dto/edit-attendance.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { SettingsService } from '../settings/settings.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import { PayrollService } from '../payroll/payroll.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(AttendanceSettings)
    private settingsRepo: Repository<AttendanceSettings>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(Holiday)
    private holidayRepo: Repository<Holiday>,
    @InjectRepository(LeaveRequest)
    private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(Department)
    private deptRepo: Repository<Department>,
    private activityLogService: ActivityLogService,
    private settingsService: SettingsService,
    private fileStorageService: FileStorageService,
    @Inject(forwardRef(() => PayrollService))
    private payrollService: PayrollService,
  ) {}

  async getSettings(branchId?: number) {
    let settings = await this.settingsRepo.findOne({
      where: { branch_id: branchId || IsNull() },
    });
    if (!settings && branchId) {
      settings = await this.settingsRepo.findOne({ where: { branch_id: IsNull() } });
    }
    return settings || this.settingsRepo.create({});
  }

  // ─── PUNCH IN ──────────────────────────────────────────────
  async punchIn(employeeId: number, dto: PunchInDto) {
    const today = this.getISTDate();
    const now = new Date();

    // CHECK 1: Already punched in today?
    const existing = await this.attendanceRepo.findOne({
      where: { employee_id: employeeId, date: today },
    });
    if (existing) {
      throw new ConflictException('Already punched in today');
    }

    // CHECK 2: Geofence validation
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    const settings = await this.getSettings(dto.branchId);

    // FETCH User with Department to get custom timings
    const user = await this.userRepo.findOne({ 
      where: { id: employeeId },
      relations: ['department']
    });
    const dept = user?.department;

    if (settings.geofence_required) {
      const distance = this.calculateDistance(
        dto.lat,
        dto.lng,
        Number(branch.lat),
        Number(branch.lng),
      );
      if (distance > branch.radius) {
        throw new ForbiddenException(
          `You are ${Math.round(distance)}m away. Must be within ${branch.radius}m to punch in.`,
        );
      }
    }

    // CHECK 3: Determine status based on punch in time
    const punchHour = now.getHours();
    const punchMin = now.getMinutes();
    const punchTimeStr = `${String(punchHour).padStart(2, '0')}:${String(punchMin).padStart(2, '0')}:00`;

    // Rules from Department or fallback to global settings
    const halfDayInTime = dept?.half_day_punch_in_after || settings?.half_day_cutoff || '12:00:00';
    const status = punchTimeStr < halfDayInTime ? 'pending' : 'half_day';

    // CHECK 4: Is late?
    const lateMarkAfter = dept?.punch_in_time || settings?.office_start_time || '09:00:00';
    const isLate = punchTimeStr > lateMarkAfter;

    // UPLOAD Selfie to Cloudinary
    let cloudPhotoUrl = dto.photoUrl;
    if (dto.photoUrl && dto.photoUrl.startsWith('data:image')) {
      try {
        cloudPhotoUrl = await this.fileStorageService.uploadBase64(
          dto.photoUrl,
          'attendance/punch-in',
          `emp-${employeeId}-${today}`,
        );
      } catch (err) {
        console.error('Failed to upload punch-in photo to Cloudinary:', err);
        // Fallback to saving base64 if upload fails, or let it fail if Cloudinary is mandatory
      }
    }

    // CREATE record
    const record = await this.attendanceRepo.save({
      employee_id: employeeId,
      date: today,
      status,
      punch_in_time: now,
      punch_in_lat: dto.lat,
      punch_in_lng: dto.lng,
      punch_in_address: dto.address,
      punch_in_photo_url: cloudPhotoUrl,
      punch_in_branch_id: dto.branchId,
      is_late: isLate,
    });

    await this.activityLogService.log({
      actor_id: employeeId,
      action: 'punched in',
      type: 'attendance',
      detail: `${status === 'half_day' ? 'Half Day' : 'Full Day'} · ${isLate ? 'Late' : 'On Time'}`,
    });

    return record;
  }

  // ─── PUNCH OUT ─────────────────────────────────────────────
  async punchOut(employeeId: number, dto: PunchOutDto) {
    const today = this.getISTDate();
    const now = new Date();

    // CHECK 1: Must have punched in today
    const record = await this.attendanceRepo.findOne({
      where: { employee_id: employeeId, date: today },
    });
    if (!record) {
      throw new BadRequestException('You have not punched in today');
    }
    if (record.punch_out_time) {
      throw new ConflictException('Already punched out today');
    }

    // CHECK 2: Geofence
    const branch = await this.branchRepo.findOne({ where: { id: record.punch_in_branch_id } });
    const settings = await this.getSettings(record.punch_in_branch_id);

    // FETCH User with Department to get custom timings
    const user = await this.userRepo.findOne({ 
      where: { id: employeeId },
      relations: ['department']
    });
    const dept = user?.department;

    if (settings.geofence_required && branch) {
      const distance = this.calculateDistance(
        dto.lat,
        dto.lng,
        Number(branch.lat),
        Number(branch.lng),
      );
      if (distance > branch.radius) {
        throw new ForbiddenException(`You are ${Math.round(distance)}m away from office.`);
      }
    }

    // Calculate working hours
    const workingHours = (now.getTime() - record.punch_in_time.getTime()) / (1000 * 60 * 60);

    // Finalize status
    let finalStatus = record.status === 'pending' ? 'present' : record.status;

    // RULE: Half day if punch out before specific time
    const punchOutHour = now.getHours();
    const punchOutMin = now.getMinutes();
    const punchOutTimeStr = `${String(punchOutHour).padStart(2, '0')}:${String(punchOutMin).padStart(2, '0')}:00`;
    
    const halfDayOutBefore = dept?.half_day_punch_out_before || '14:00:00';
    if (punchOutTimeStr < halfDayOutBefore) {
      finalStatus = 'half_day';
    }

    // UPLOAD Selfie to Cloudinary
    let cloudPhotoUrl = dto.photoUrl;
    if (dto.photoUrl && dto.photoUrl.startsWith('data:image')) {
      try {
        cloudPhotoUrl = await this.fileStorageService.uploadBase64(
          dto.photoUrl,
          'attendance/punch-out',
          `emp-${employeeId}-${today}-out`,
        );
      } catch (err) {
        console.error('Failed to upload punch-out photo to Cloudinary:', err);
      }
    }

    await this.attendanceRepo.update(record.id, {
      punch_out_time: now,
      punch_out_lat: dto.lat,
      punch_out_lng: dto.lng,
      punch_out_address: dto.address,
      punch_out_photo_url: cloudPhotoUrl,
      punch_out_auto: false,
      working_hours: parseFloat(workingHours.toFixed(2)),
      status: finalStatus,
      updated_at: now,
    });

    await this.activityLogService.log({
      actor_id: employeeId,
      action: 'punched out',
      type: 'attendance',
      detail: `Worked for ${workingHours.toFixed(2)} hours`,
    });

    return await this.attendanceRepo.findOne({ where: { id: record.id } });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private getISTDate() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }

  async getTodayStatus(employeeId: number) {
    const today = this.getISTDate();
    const record = await this.attendanceRepo.findOne({
      where: { employee_id: employeeId, date: today },
    });

    return {
      date: today,
      hasPunchedIn: !!record?.punch_in_time,
      hasPunchedOut: !!record?.punch_out_time,
      punchInTime: record?.punch_in_time || null,
      punchOutTime: record?.punch_out_time || null,
      punchOutAuto: record?.punch_out_auto || false,
      status: record?.status || 'not_punched',
      isLate: record?.is_late || false,
      workingHours: record?.working_hours || null,
    };
  }

  private normalizeStatus(status: any): string {
    if (!status) return 'absent_pending';
    const s = String(status).toLowerCase().trim();
    if (s === 'present' || s === 'paid') return 'present';
    if (s === 'absent' || s === 'absent_pending') return 'absent_pending';
    if (s === 'half_day' || s === 'half day') return 'half_day';
    if (s === 'half_day_leave' || s === 'half day leave') return 'half_day_leave';
    if (s === 'paid_leave' || s === 'paid leave') return 'paid_leave';
    if (s === 'unpaid_leave' || s === 'unpaid leave' || s === 'unpaid' || s === 'lop') return 'unpaid_leave';
    if (s === 'week_off' || s === 'week off') return 'week_off';
    if (s === 'holiday') return 'holiday';
    return s;
  }

  private formatDateKey(year: number, month: number, day: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private parseLocalDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private normalizeHolidayDateString(value: any): string | null {
    if (!value) return null;
    const dateString = String(value).trim();
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    // Format as YYYY-MM-DD locally to avoid timezone issues
    return this.formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  private mapLeaveTypeToAttendanceStatus(type?: string) {
    const normalized = String(type || '').toLowerCase();
    if (normalized.includes('unpaid') || normalized.includes('lop')) {
      return 'unpaid_leave';
    }
    if (normalized.includes('half')) {
      return 'half_day_leave';
    }
    return 'paid_leave';
  }

  private getYYYYMMDD(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    // Use local components to avoid timezone shift
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getCycleAttendanceSummary(employeeId: number, startDate: string, endDate: string) {
    const [records, employee, approvedLeaves] = await Promise.all([
      this.attendanceRepo.find({
        where: {
          employee_id: employeeId,
          date: Between(startDate, endDate),
        },
        order: { date: 'ASC' },
      }),
      this.userRepo.findOne({
        where: { id: employeeId },
        relations: ['department'],
      }),
      this.leaveRepo
        .createQueryBuilder('leave')
        .where('leave.employee_id = :employeeId', { employeeId })
        .andWhere('leave.status = :status', { status: 'approved' })
        .andWhere('leave.from_date <= :endDate', { endDate })
        .andWhere('leave.to_date >= :startDate', { startDate })
        .getMany(),
    ]);

    const holidaySettings = await this.settingsService.getHolidaySettings();
    const deptWeekOffDays = this.normalizeWeekOffDays(employee?.department?.week_off_days);
    
    let weekOffDays: number[] = [];
    if (deptWeekOffDays.length > 0) {
      weekOffDays = deptWeekOffDays;
    } else {
      weekOffDays = this.normalizeWeekOffDays(holidaySettings.week_off_days);
    }

    console.log(`[AttendanceService] Cycle Summary for Emp ${employeeId}: Dept WeekOff: ${JSON.stringify(deptWeekOffDays)}, Final WeekOff: ${JSON.stringify(weekOffDays)}`);

    const start = this.parseLocalDate(startDate);
    const end = this.parseLocalDate(endDate);

    const safeYear = end.getFullYear();
    const holidayQuery = this.holidayRepo
      .createQueryBuilder('holiday')
      .where('holiday.is_active = :isActive', { isActive: true })
      .andWhere('holiday.year = :year', { year: safeYear });

    if (employee?.department_id) {
      holidayQuery.andWhere(
        '(holiday.applicable_to = :all OR :departmentId = ANY(holiday.department_ids))',
        {
          all: 'all',
          departmentId: employee.department_id,
        },
      );
    } else {
      holidayQuery.andWhere('holiday.applicable_to = :all', { all: 'all' });
    }

    const holidays = await holidayQuery.getMany();
    const holidayDates = new Set(
      holidays.map((holiday) => this.formatDateKey(holiday.year, holiday.month, holiday.day)),
    );
    const configHolidayDates = new Set(
      (holidaySettings.paid_holidays || []).map((holiday) => this.normalizeHolidayDateString(holiday)).filter(Boolean),
    );

    const leaveStatusByDate: Record<string, string> = {};

    approvedLeaves.forEach((leave) => {
      const leaveStatus = this.mapLeaveTypeToAttendanceStatus(leave.type);
      
      // Use local date parsing to avoid timezone issues
      const fromDateStr = this.getYYYYMMDD(leave.from_date);
      const toDateStr = this.getYYYYMMDD(leave.to_date);
      
      if (!fromDateStr || !toDateStr) return;

      const cursor = this.parseLocalDate(fromDateStr);
      const lastDate = this.parseLocalDate(toDateStr);

      while (cursor <= lastDate) {
        const dateKey = this.formatDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
        if (dateKey >= startDate && dateKey <= endDate) {
          leaveStatusByDate[dateKey] = leaveStatus;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    const summary = {
      present: 0,
      halfDay: 0,
      absent: 0,
      weekOff: 0,
      holiday: 0,
      leave: 0,
      paidLeave: 0,
      unpaidLeave: 0,
      halfDayLeave: 0,
      totalWorkingHours: 0,
      scheduledWeekOffs: 0,
    };

    const joiningDate = employee?.date_of_joining ? new Date(employee.date_of_joining) : null;
    if (joiningDate) {
      joiningDate.setHours(0, 0, 0, 0);
    }

    const recordByDate = new Map(
      records.map((r) => {
        const dateKey = this.getYYYYMMDD(r.date);
        return [dateKey, r];
      }),
    );

    const result = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dateStr = this.formatDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
      const record = recordByDate.get(dateStr);
      
      const isHoliday = holidayDates.has(dateStr) || configHolidayDates.has(dateStr);
      const dayOfWeek = cursor.getDay();
      const isWeekOff = weekOffDays.includes(dayOfWeek);
      const isFutureDay = new Date(`${dateStr}T23:59:59`) > new Date();
      
      const currentCursorDate = new Date(cursor);
      currentCursorDate.setHours(0, 0, 0, 0);
      const isPreJoining = joiningDate && currentCursorDate < joiningDate;

      if (isWeekOff && !isPreJoining) {
        summary.scheduledWeekOffs += 1;
      }

      let status = this.normalizeStatus(record?.status);

      const isStaleLeave = (s: string) => {
        if (!s) return false;
        const lower = String(s).toLowerCase();
        return ['paid_leave', 'unpaid_leave', 'half_day', 'half_day_leave', 'paid', 'unpaid', 'lop', 'paid leave', 'unpaid leave', 'half day', 'half day leave'].includes(lower) || lower.includes('leave');
      };

      const hasManualEdit = record && record.edited_by;
      const hasPunchData = record && (record.status === 'present' || record.status === 'half_day');

      if (joiningDate && currentCursorDate < joiningDate) {
        status = 'pre_joining';
      } else if (hasManualEdit) {
        // PRIORITY 1: Manually edited by admin is the absolute source of truth
        status = this.normalizeStatus(record.status);
      } else if (leaveStatusByDate[dateStr]) {
        // PRIORITY 2: Approved leave from DB (OVERRIDE AUTO PUNCH)
        status = this.normalizeStatus(leaveStatusByDate[dateStr]);
      } else if (hasPunchData) {
        // PRIORITY 3: Actual punch data from employee
        status = this.normalizeStatus(record.status);
      } else if (isStaleLeave(status)) {
        // Only revert if it's NOT a manual edit and NOT a valid leave in DB
        if (isHoliday) status = 'holiday';
        else if (isWeekOff) status = 'week_off';
        else status = isFutureDay ? 'future' : 'absent_pending';
      } else if (isHoliday) {
        // Holiday takes precedence over absent/pending/undefined
        if (!status || status === 'absent' || status === 'absent_pending' || status === 'future') {
          status = 'holiday';
        }
      } else if (isWeekOff) {
        // Week off takes precedence over absent/pending/undefined
        if (!status || status === 'absent' || status === 'absent_pending' || status === 'future') {
          status = 'week_off';
        }
      } else if (!status || status === 'absent' || status === 'absent_pending') {
        status = isFutureDay ? 'future' : 'absent_pending';
      }

      result.push({
        id: record?.id || null,
        date: dateStr,
        day: cursor.getDate(),
        status,
        note: record?.note || null,
        punchIn: record?.punch_in_time || null,
        punchOut: record?.punch_out_time || null,
        punchOutAuto: record?.punch_out_auto || false,
        workingHours: record?.working_hours || null,
        isLate: record?.is_late || false,
        isWeekOff,
        isHoliday,
      });

      switch (status) {
        case 'present':
          summary.present += 1;
          break;
        case 'half_day':
          summary.halfDay += 1;
          break;
        case 'holiday':
          summary.holiday += 1;
          break;
        case 'week_off':
          summary.weekOff += 1;
          break;
        case 'paid_leave':
          summary.leave += 1;
          summary.paidLeave += 1;
          break;
        case 'half_day_leave':
          summary.leave += 0.5;
          summary.halfDayLeave += 1;
          break;
        case 'unpaid_leave':
          summary.leave += 1;
          summary.unpaidLeave += 1;
          break;
        case 'absent':
        case 'absent_pending':
          summary.absent += 1;
          break;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    summary.totalWorkingHours = Number(records.reduce((sum, r) => sum + Number(r.working_hours || 0), 0).toFixed(1));
    return { days: result, summary, ...summary };
  }

  async getMonthlyAttendance(employeeId: number, month: number, year: number) {
    const safeMonth = Number(month);
    const safeYear = Number(year);
    const startDate = `${safeYear}-${String(safeMonth).padStart(2, '0')}-01`;
    // Use last day of month in local format to avoid ISO timezone shift
    const lastDay = new Date(safeYear, safeMonth, 0).getDate();
    const endDate = `${safeYear}-${String(safeMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    console.log(`FETCHING ATTENDANCE FOR: ${startDate} TO ${endDate}`);

    const [records, employee, approvedLeaves] = await Promise.all([
      this.attendanceRepo.find({
        where: {
          employee_id: employeeId,
          date: Between(startDate, endDate),
        },
        order: { date: 'ASC' },
      }),
      this.userRepo.findOne({
        where: { id: employeeId },
        relations: ['department'],
      }),
      this.leaveRepo
        .createQueryBuilder('leave')
        .where('leave.employee_id = :employeeId', { employeeId })
        .andWhere('leave.status = :status', { status: 'approved' })
        .andWhere('leave.from_date <= :endDate', { endDate })
        .andWhere('leave.to_date >= :startDate', { startDate })
        .getMany(),
    ]);

    const holidayQuery = this.holidayRepo
      .createQueryBuilder('holiday')
      .where('holiday.is_active = :isActive', { isActive: true })
      .andWhere('holiday.year = :year', { year: safeYear });

    if (employee?.department_id) {
      holidayQuery.andWhere(
        '(holiday.applicable_to = :all OR :departmentId = ANY(holiday.department_ids))',
        {
          all: 'all',
          departmentId: employee.department_id,
        },
      );
    } else {
      holidayQuery.andWhere('holiday.applicable_to = :all', { all: 'all' });
    }

    const holidays = await holidayQuery.getMany();
    const holidayDates = new Set(
      holidays.map((holiday) => this.formatDateKey(holiday.year, holiday.month, holiday.day)),
    );
    const holidaySettings = await this.settingsService.getHolidaySettings();
    const deptWeekOffDays = this.normalizeWeekOffDays(employee?.department?.week_off_days);
    const configHolidayDates = new Set(
      (holidaySettings.paid_holidays || []).map((holiday) => this.normalizeHolidayDateString(holiday)).filter(Boolean),
    );

    let weekOffDays: number[] = [];
    if (deptWeekOffDays.length > 0) {
      weekOffDays = deptWeekOffDays;
    } else {
      weekOffDays = this.normalizeWeekOffDays(holidaySettings.week_off_days);
    }
    const leaveStatusByDate: Record<string, string> = {};

    approvedLeaves.forEach((leave) => {
      const leaveStatus = this.mapLeaveTypeToAttendanceStatus(leave.type);
      
      // Use local date parsing to avoid timezone issues
      const fromDateStr = this.getYYYYMMDD(leave.from_date);
      const toDateStr = this.getYYYYMMDD(leave.to_date);
      
      if (!fromDateStr || !toDateStr) return;

      const cursor = this.parseLocalDate(fromDateStr);
      const lastDate = this.parseLocalDate(toDateStr);

      while (cursor <= lastDate) {
        const dateKey = this.formatDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
        if (dateKey >= startDate && dateKey <= endDate) {
          leaveStatusByDate[dateKey] = leaveStatus;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    const daysInMonth = new Date(safeYear, safeMonth, 0).getDate();
    const result = [];
    const summary = {
      present: 0,
      halfDay: 0,
      absent: 0,
      weekOff: 0,
      holiday: 0,
      leave: 0,
      paidLeave: 0,
      unpaidLeave: 0,
      halfDayLeave: 0,
      totalWorkingHours: 0,
    };

    const joiningDate = employee?.date_of_joining ? new Date(employee.date_of_joining) : null;
    if (joiningDate) {
      joiningDate.setHours(0, 0, 0, 0);
    }

    const recordByDate = new Map(
      records.map((r) => {
        const dateKey = this.getYYYYMMDD(r.date);
        return [dateKey, r];
      }),
    );

    const cursor = new Date(safeYear, safeMonth - 1, 1);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = this.formatDateKey(safeYear, safeMonth, day);
      const record = recordByDate.get(dateStr);
      
      const isHoliday = holidayDates.has(dateStr) || configHolidayDates.has(dateStr);
      const dayOfWeek = cursor.getDay();
      const isWeekOff = weekOffDays.includes(dayOfWeek);
      
      const isFutureDay = new Date(`${dateStr}T23:59:59`) > new Date();
      
      let status = this.normalizeStatus(record?.status);

      // Check if date is before joining date
      const currentCursorDate = new Date(cursor);
      currentCursorDate.setHours(0, 0, 0, 0);

      const isStaleLeave = (s: string) => {
        if (!s) return false;
        const lower = String(s).toLowerCase();
        return ['paid_leave', 'unpaid_leave', 'half_day', 'half_day_leave', 'paid', 'unpaid', 'lop', 'paid leave', 'unpaid leave', 'half day', 'half day leave'].includes(lower) || lower.includes('leave');
      };

      const hasManualEdit = record && record.edited_by;
      const hasPunchData = record && (record.status === 'present' || record.status === 'half_day');

      if (joiningDate && currentCursorDate < joiningDate) {
        status = 'pre_joining';
      } else if (hasManualEdit) {
        // PRIORITY 1: Manually edited by admin is the absolute source of truth
        status = this.normalizeStatus(record.status);
      } else if (leaveStatusByDate[dateStr]) {
        // PRIORITY 2: Approved leave from DB (OVERRIDE AUTO PUNCH)
        status = this.normalizeStatus(leaveStatusByDate[dateStr]);
      } else if (hasPunchData) {
        // PRIORITY 3: Actual punch data from employee
        status = this.normalizeStatus(record.status);
      } else if (isStaleLeave(status)) {
        // Only revert if it's NOT a manual edit and NOT a valid leave in DB
        if (isHoliday) status = 'holiday';
        else if (isWeekOff) status = 'week_off';
        else status = isFutureDay ? 'future' : 'absent_pending';
      } else if (isHoliday) {
        // Holiday takes precedence over absent/pending/undefined
        if (!status || status === 'absent' || status === 'absent_pending' || status === 'future') {
          status = 'holiday';
        }
      } else if (isWeekOff) {
        // Week off takes precedence over absent/pending/undefined
        if (!status || status === 'absent' || status === 'absent_pending' || status === 'future') {
          status = 'week_off';
        }
      } else if (!status || status === 'absent' || status === 'absent_pending') {
        status = isFutureDay ? 'future' : 'absent_pending';
      }

      result.push({
        id: record?.id || null,
        date: dateStr,
        day,
        status,
        note: record?.note || null,
        punchIn: record?.punch_in_time || null,
        punchOut: record?.punch_out_time || null,
        punchOutAuto: record?.punch_out_auto || false,
        workingHours: record?.working_hours || null,
        isLate: record?.is_late || false,
      });

      switch (status) {
        case 'present':
          summary.present += 1;
          break;
        case 'half_day':
          summary.halfDay += 1;
          break;
        case 'holiday':
          summary.holiday += 1;
          break;
        case 'week_off':
          summary.weekOff += 1;
          break;
        case 'paid_leave':
          summary.leave += 1;
          summary.paidLeave += 1;
          break;
        case 'half_day_leave':
          summary.leave += 0.5;
          summary.halfDayLeave += 1;
          break;
        case 'unpaid_leave':
          summary.leave += 1;
          summary.unpaidLeave += 1;
          break;
        case 'absent':
        case 'absent_pending':
          summary.absent += 1;
          break;
        default:
          break;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    summary.totalWorkingHours = Number(records
      .reduce((sum, r) => sum + Number(r.working_hours || 0), 0)
      .toFixed(1));

    return { days: result, summary, ...summary };
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

  async upsertEmployeeAttendanceForDate(
    employeeId: number,
    date: string,
    dto: EditAttendanceDto,
    editorId: number,
  ) {
    const existingRecord = await this.attendanceRepo.findOne({
      where: { employee_id: employeeId, date },
    });

    const record =
      existingRecord ||
      this.attendanceRepo.create({
        employee_id: employeeId,
        date,
      });

    const previousStatus = record.status || null;
    const nextStatus = dto.status;
    const shouldClearPunchData = ['absent', 'week_off', 'holiday', 'paid_leave', 'unpaid_leave', 'half_day_leave'].includes(nextStatus);

    if (!record.original_status && previousStatus) {
      record.original_status = previousStatus;
    }

    record.status = nextStatus;
    record.note = dto.note || null;
    record.edited_by = editorId;
    record.edited_at = new Date();
    record.edit_reason = dto.editReason;

    if (dto.punchInTime !== undefined) record.punch_in_time = dto.punchInTime ? new Date(dto.punchInTime) : null;
    if (dto.punchOutTime !== undefined) record.punch_out_time = dto.punchOutTime ? new Date(dto.punchOutTime) : null;

    // Recalculate working hours if times changed
    if (record.punch_in_time && record.punch_out_time) {
      const diff = record.punch_out_time.getTime() - record.punch_in_time.getTime();
      const hours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
      record.working_hours = hours.toString() as any;
    } else {
      record.working_hours = '0' as any;
    }

    const saved = await this.attendanceRepo.save(record);
    console.log(`[AttendanceService] Saved record for employee ${employeeId} on ${date}. Status: ${nextStatus}`);

    // Trigger payroll update for this employee/month/year
    try {
      await this.payrollService.syncEmployeePayrollByDate(employeeId, date, editorId);
    } catch (e) {
      console.error('[AttendanceService] Failed to auto-update payroll after attendance change:', e);
    }

    return saved;
  }

  async editAttendance(recordId: number, dto: EditAttendanceDto, editorId: number) {
    const record = await this.attendanceRepo.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Attendance record not found');

    return this.upsertEmployeeAttendanceForDate(record.employee_id, record.date, dto, editorId);
  }

  async getLiveAttendance(date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const employees = await this.userRepo.find({
      where: { isActive: true },
      relations: ['department', 'branch'],
    });

    const records = await this.attendanceRepo.find({
      where: { date: targetDate },
    });

    // Fetch approved leaves for the target date to ensure accuracy
    const approvedLeaves = await this.leaveRepo
      .createQueryBuilder('leave')
      .where('leave.status = :status', { status: 'approved' })
      .andWhere('leave.from_date <= :targetDate', { targetDate })
      .andWhere('leave.to_date >= :targetDate', { targetDate })
      .getMany();

    const list = employees
      .filter((emp) => {
        if (!emp.date_of_joining) return true;
        const joiningDate = new Date(emp.date_of_joining);
        joiningDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(targetDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= joiningDate;
      })
      .map((emp) => {
        const record = records.find((r) => r.employee_id === emp.id);
        const approvedLeave = approvedLeaves.find((l) => l.employee_id === emp.id);

        let status = record?.status || 'not_punched';

        const isManualEdit = record && record.edited_by;

        // Priority Logic:
        // 1. Manual Admin Edit
        if (isManualEdit) {
          status = record.status;
        }
        // 2. Approved Leave (Takes priority over auto punch data if not manually overridden)
        else if (approvedLeave && (status === 'not_punched' || status === 'absent' || status === 'present' || status === 'half_day')) {
          status = this.mapLeaveTypeToAttendanceStatus(approvedLeave.type);
        }
        // 3. Regular Punch Data (status already set from record.status)

        return {
          id: emp.id,
          name: emp.name,
          employeeId: emp.employee_id,
          department: emp.department?.name,
          branch: emp.branch?.name,
          status: status,
          punchInTime: record?.punch_in_time,
          punchOutTime: record?.punch_out_time,
          punchOutAuto: record?.punch_out_auto,
          isLate: record?.is_late,
          workingHours: record?.working_hours,
        };
      });

    return {
      date: targetDate,
      totalEmployees: employees.length,
      present: list.filter((e) => e.status === 'present').length,
      halfDay: list.filter((e) => e.status === 'half_day').length,
      absent: list.filter((e) => e.status === 'absent').length,
      onLeave: list.filter((e) =>
        ['paid_leave', 'unpaid_leave', 'half_day', 'paid', 'unpaid', 'lop', 'paid leave', 'unpaid leave', 'half day'].includes(String(e.status).toLowerCase()) ||
        String(e.status).toLowerCase().includes('leave')
      ).length,
      notYetPunched: list.filter((e) => e.status === 'not_punched').length,
      employees: list,
    };
  }
}
