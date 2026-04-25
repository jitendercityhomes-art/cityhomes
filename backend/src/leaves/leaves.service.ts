import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { Attendance } from '../entities/attendance.entity';
import { PayrollService } from '../payroll/payroll.service';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRepository: Repository<LeaveRequest>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private payrollService: PayrollService,
  ) {}

  private mapLeaveTypeToAttendanceStatus(type: string) {
    const normalized = String(type || '').toLowerCase();
    if (normalized.includes('unpaid') || normalized.includes('lop')) {
      return 'unpaid_leave';
    }
    if (normalized.includes('half')) {
      return 'half_day';
    }
    // Default to paid_leave for anything else (Paid Leave, Sick Leave, etc.)
    return 'paid_leave';
  }

  private formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private async syncApprovedLeaveToAttendance(leave: LeaveRequest, approvedBy: number) {
    const attendanceStatus = this.mapLeaveTypeToAttendanceStatus(leave.type);
    const cursor = new Date(leave.from_date);
    const endDate = new Date(leave.to_date);

    while (cursor <= endDate) {
      // Use local date components to avoid timezone shift
      const dateKey = this.formatDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
      const existing = await this.attendanceRepository.findOne({
        where: { employee_id: leave.employee_id, date: dateKey },
      });

      if (existing && ['holiday', 'week_off'].includes(existing.status)) {
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }

      const record =
        existing ||
        this.attendanceRepository.create({
          employee_id: leave.employee_id,
          date: dateKey,
        });

      const previousStatus = record.status || null;
      if (!record.original_status && previousStatus) {
        record.original_status = previousStatus;
      }

      record.status = attendanceStatus;
      record.note = `${leave.type} approved`;
      record.edited_by = approvedBy;
      record.edited_at = new Date();
      record.edit_reason = `Leave approved (${leave.type})`;
      record.punch_in_time = null;
      record.punch_out_time = null;
      record.working_hours = null;
      record.punch_out_auto = false;
      record.is_late = false;

      await this.attendanceRepository.save(record);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  async createLeave(employeeId: number, createLeaveDto: CreateLeaveDto) {
    const leave = this.leaveRepository.create({
      ...createLeaveDto,
      employee_id: employeeId,
      from_date: new Date(createLeaveDto.from_date),
      to_date: new Date(createLeaveDto.to_date),
    });

    return this.leaveRepository.save(leave);
  }

  async findAll(filters?: { status?: string; employee_id?: number }) {
    const query = this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee');

    if (filters?.status) {
      query.where('leave.status = :status', { status: filters.status });
    }

    if (filters?.employee_id) {
      query.andWhere('leave.employee_id = :empId', { empId: filters.employee_id });
    }

    return query.orderBy('leave.created_at', 'DESC').getMany();
  }

  async findOne(id: number) {
    const leave = await this.leaveRepository.findOne({ where: { id } });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    return leave;
  }

  async approveLeave(id: number, approvedBy: number, approvedLeaveType: string) {
    const leave = await this.findOne(id);
    leave.status = 'approved';
    leave.approved_by = approvedBy;
    leave.type = approvedLeaveType; // Update the leave type with the approved type
    const savedLeave = await this.leaveRepository.save(leave);
    await this.syncApprovedLeaveToAttendance(savedLeave, approvedBy);
    
    // Trigger payroll update
    try {
      await this.payrollService.syncEmployeePayrollByDate(leave.employee_id, leave.from_date, approvedBy);
    } catch (err) {
      console.error('Failed to sync payroll after leave approval:', err);
    }
    
    return savedLeave;
  }

  async rejectLeave(id: number, approvedBy: number, reason: string) {
    const leave = await this.findOne(id);
    const wasApproved = leave.status === 'approved';
    leave.status = 'rejected';
    leave.approved_by = approvedBy;
    leave.rejected_reason = reason;
    const saved = await this.leaveRepository.save(leave);
    
    if (wasApproved) {
      // Trigger payroll update if it was previously approved
      try {
        await this.payrollService.syncEmployeePayrollByDate(leave.employee_id, leave.from_date, approvedBy);
      } catch (err) {
        console.error('Failed to sync payroll after leave rejection:', err);
      }
    }
    
    return saved;
  }

  async removeLeave(id: number, employeeId: number) {
    const leave = await this.leaveRepository.findOne({
      where: { id, employee_id: employeeId },
    });
    if (!leave) {
      throw new NotFoundException('Leave request not found or unauthorized');
    }

    const wasApproved = leave.status === 'approved';
    const fromDate = leave.from_date;

    // If leave was approved, we should revert attendance records
    if (wasApproved) {
      const cursor = new Date(leave.from_date);
      const endDate = new Date(leave.to_date);

      while (cursor <= endDate) {
        const dateKey = this.formatDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
        const record = await this.attendanceRepository.findOne({
          where: { employee_id: leave.employee_id, date: dateKey },
        });

        if (record && record.status === this.mapLeaveTypeToAttendanceStatus(leave.type)) {
          // Revert to original status if available, else set to absent or pending
          if (record.original_status) {
            record.status = record.original_status;
            record.original_status = null;
          } else {
            record.status = 'absent';
          }
          record.note = `Leave cancelled (${leave.type})`;
          record.edited_at = new Date();
          await this.attendanceRepository.save(record);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const result = await this.leaveRepository.remove(leave);
    
    if (wasApproved) {
      try {
        await this.payrollService.syncEmployeePayrollByDate(employeeId, fromDate, employeeId);
      } catch (err) {
        console.error('Failed to sync payroll after leave removal:', err);
      }
    }
    
    return result;
  }

  async getLeavesForEmployee(employeeId: number) {
    return this.findAll({ employee_id: employeeId });
  }

  async getPendingLeaves() {
    return this.findAll({ status: 'pending' });
  }
}
