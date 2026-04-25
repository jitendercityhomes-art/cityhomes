import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { PayrollRun } from './entities/payroll-run.entity';
import { User } from '../entities/user.entity';
import { Holiday } from '../holidays/entities/holiday.entity';
import { Department } from '../departments/entities/department.entity';
import { Reimbursement } from '../reimbursements/entities/reimbursement.entity';
import { SalaryStructure } from '../salary/entities/salary-structure.entity';
import { SettingsService } from '../settings/settings.service';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRun)
    private payrollRepository: Repository<PayrollRun>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Reimbursement)
    private reimbursementRepository: Repository<Reimbursement>,
    @InjectRepository(SalaryStructure)
    private salaryStructureRepository: Repository<SalaryStructure>,
    private settingsService: SettingsService,
    @Inject(forwardRef(() => AttendanceService))
    private attendanceService: AttendanceService,
  ) {}

  async bulkSync(month: number, year: number, userId: number) {
    try {
      const employees = await this.userRepository.find({
        where: { isActive: true },
        relations: ['department'],
      });

      const salarySettings = await this.settingsService.getSalarySettings();
      const cycleStart = Number(salarySettings.cycle_start_day) || 1;
      
      let startDate: Date;
      let endDate: Date;

      if (cycleStart === 1) {
        startDate = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        endDate = new Date(year, month - 1, lastDayOfMonth);
      } else {
        // Example: 16th Feb to 15th Mar for March Payroll
        startDate = new Date(year, month - 2, cycleStart);
        endDate = new Date(year, month - 1, cycleStart - 1);
      }

      // Ensure dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error(`Invalid cycle dates calculated: ${startDate} to ${endDate}`);
      }

      // Use local date strings to avoid timezone issues with toISOString()
      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      const periodType = salarySettings.period_type || 'calendar';
      const fixedDays = Number(salarySettings.fixed_days) || 26;
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const actualCycleDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalCycleDays = periodType === 'fixed' ? fixedDays : actualCycleDays;

      console.log(`Syncing Payroll for ${month}/${year}. Cycle: ${startDateStr} to ${endDateStr} (${totalCycleDays} days)`);

      const results = [];

      for (const employee of employees) {
        if (employee.role === 'superadmin') continue;

        try {
          const data = await this.calculateEmployeePayrollData(employee.id, month, year, userId);

          let payroll = await this.payrollRepository.findOne({
            where: { employee_id: employee.id, month, year },
          });

          if (payroll) {
            if (payroll.status !== 'paid') {
              Object.assign(payroll, data);
              payroll = await this.payrollRepository.save(payroll);
            }
          } else {
            payroll = this.payrollRepository.create(data);
            payroll = await this.payrollRepository.save(payroll);
          }

          results.push(payroll);
        } catch (err) {
          console.error(`Sync failed for employee ${employee.id}:`, err);
        }
      }

      return results;
    } catch (error) {
      console.error('Bulk Sync failed:', error);
      throw error;
    }
  }

  async calculatePayroll(
    employeeId: number,
    month: number,
    year: number,
    userId: number,
  ) {
    // Check if payroll already exists for this month
    const existing = await this.payrollRepository.findOne({
      where: { employee_id: employeeId, month, year },
    });

    if (existing) {
      throw new Error('Payroll already calculated for this month');
    }

    const data = await this.calculateEmployeePayrollData(employeeId, month, year, userId);
    const payroll = this.payrollRepository.create(data);
    return this.payrollRepository.save(payroll);
  }

  async syncEmployeePayroll(
    employeeId: number,
    month: number,
    year: number,
    userId: number,
  ) {
    console.log(`[PayrollService] Syncing payroll for employee ${employeeId}, month ${month}, year ${year}`);
    
    let payroll = await this.payrollRepository.findOne({
      where: { employee_id: employeeId, month, year },
    });

    if (payroll && payroll.status === 'paid') {
      console.log(`[PayrollService] Payroll already paid for employee ${employeeId}. Skipping sync.`);
      return payroll;
    }

    const data = await this.calculateEmployeePayrollData(employeeId, month, year, userId);
    
    if (payroll) {
      Object.assign(payroll, data);
    } else {
      payroll = this.payrollRepository.create(data);
    }
    
    return this.payrollRepository.save(payroll);
  }

  async syncEmployeePayrollByDate(
    employeeId: number,
    date: string | Date,
    userId: number,
  ) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Based on salary settings, determine which month this date falls into
    const salarySettings = await this.settingsService.getSalarySettings();
    const cycleStart = Number(salarySettings.cycle_start_day) || 1;
    
    let month = dateObj.getMonth() + 1;
    let year = dateObj.getFullYear();

    // If cycle start is not 1, we need to adjust the month/year
    if (cycleStart > 1) {
      const day = dateObj.getDate();
      if (day >= cycleStart) {
        // Falls into the next month's payroll
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
    }

    return this.syncEmployeePayroll(employeeId, month, year, userId);
  }

  private async calculateEmployeePayrollData(
    employeeId: number,
    month: number,
    year: number,
    userId: number,
  ) {
    // Get salary cycle settings
    const salarySettings = await this.settingsService.getSalarySettings();
    const periodType = salarySettings.period_type || 'calendar';
    const fixedDays = Number(salarySettings.fixed_days) || 26;
    const cycleStart = Number(salarySettings.cycle_start_day) || 1;
    
    let startDate: Date;
    let endDate: Date;

    if (cycleStart === 1) {
      startDate = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      endDate = new Date(year, month - 1, lastDayOfMonth);
    } else {
      // Example: 16th Feb to 15th Mar for March Payroll (month=3)
      endDate = new Date(year, month - 1, cycleStart - 1);
      startDate = new Date(year, month - 2, cycleStart);
    }

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    endDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    const actualCycleDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalCycleDays = periodType === 'fixed' ? fixedDays : actualCycleDays;

    const employee = await this.userRepository.findOne({ where: { id: employeeId } });
    const joiningDate = employee?.date_of_joining ? new Date(employee.date_of_joining) : null;
    if (joiningDate) joiningDate.setHours(0, 0, 0, 0);

    let effectiveCycleDays = actualCycleDays;
    if (joiningDate && joiningDate > startDate && joiningDate <= endDate) {
      effectiveCycleDays = Math.round((endDate.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    console.log(`[PayrollService] Emp ${employeeId}: Joining ${joiningDate?.toISOString()}, Cycle ${startDate.toISOString()} to ${endDate.toISOString()}, Effective Days: ${effectiveCycleDays}/${actualCycleDays}`);

    // Get Attendance Summary
    const attendance = await this.attendanceService.getCycleAttendanceSummary(
      employeeId,
      startDateStr,
      endDateStr,
    );

    console.log(`[PayrollService] Calc for Emp ${employeeId}: Period ${startDateStr} to ${endDateStr}. Attendance Summary: ${JSON.stringify(attendance.summary)}`);

    // Get Active Salary Structure
    const salaryStructure = await this.salaryStructureRepository.findOne({
      where: {
        employee_id: employeeId,
        effective_to: IsNull(),
      },
      order: { effective_from: 'DESC' },
    });

    // Get Reimbursements
    const reimbursements = await this.reimbursementRepository.find({
      where: {
        employee_id: employeeId,
        status: 'approved',
        date: Between(startDateStr, endDateStr),
      },
    });
    const totalReimbursement = reimbursements.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // Calculate Paid Days based on attendance records
    let paidDays = 0;
    if (attendance && attendance.days) {
      attendance.days.forEach(day => {
        let dayPaidValue = 0;
        const status = day.status;
        
        if (status === 'present' || status === 'paid_leave' || day.isHoliday || day.isWeekOff) {
          // Full pay for present, paid leave, holidays, or week-offs
          // Even if they are marked absent on a holiday/week-off, they get paid (standard policy)
          dayPaidValue = 1.0;
        } else if (status === 'half_day' || status === 'half_day_leave') {
          // Half pay for half days
          dayPaidValue = 0.5;
          // But if it's a holiday or week-off, they should get at least full pay
          if (day.isHoliday || day.isWeekOff) {
            dayPaidValue = 1.0;
          }
        }
        
        // Ensure that if it's a holiday/week-off but explicitly marked as unpaid_leave, it's 0
        if (status === 'unpaid_leave') {
          dayPaidValue = 0;
        }

        // If it's a pre-joining day, it's 0
        if (status === 'pre_joining') {
          dayPaidValue = 0;
        }

        if (dayPaidValue > 0) {
          console.log(`[PayrollService] Emp ${employeeId}: Date ${day.date} is PAID (${dayPaidValue}) - Status: ${status}, isHW: ${day.isHoliday || day.isWeekOff}`);
        }
        
        paidDays += dayPaidValue;
      });
    }

    const presentCount = Number(attendance.present || 0);
    const halfDayCount = Number(attendance.halfDay || 0);
    const holidayCount = Number(attendance.holiday || 0);
    const weekOffCount = Number(attendance.weekOff || 0);
    const paidLeaveCount = Number(attendance.paidLeave || 0);
    const halfDayLeaveCount = Number(attendance.halfDayLeave || 0);
    const unpaidLeaveCount = Number(attendance.unpaidLeave || 0);

    const lopDays = Math.max(0, effectiveCycleDays - paidDays);

    const basic = Number(salaryStructure?.basic || employee?.basic_salary || 0);
    const basicEarned = totalCycleDays > 0 ? (basic / totalCycleDays) * paidDays : 0;

    const hra = Number(salaryStructure?.hra || 0);
    const da = Number(salaryStructure?.da || 0);
    const bonus = Number(salaryStructure?.bonus || 0);
    const overtime = Number(salaryStructure?.overtime || 0);
    const incentive = Number(salaryStructure?.incentive || 0);

    const gross = basicEarned + hra + da + bonus + overtime + incentive;
    const net = gross + totalReimbursement;

    return {
      employee_id: employeeId,
      month,
      year,
      present_days: presentCount,
      week_off_days: weekOffCount,
      paid_holiday_days: holidayCount,
      half_days: halfDayCount,
      half_day_leave_days: halfDayLeaveCount,
      paid_leave_days: paidLeaveCount,
      unpaid_leave_days: unpaidLeaveCount,
      absent_days: Math.round(
        Math.max(
          0,
          lopDays -
            unpaidLeaveCount -
            halfDayCount * 0.5 -
            halfDayLeaveCount * 0.5,
        ),
      ),
      lop_days: Math.round(lopDays),
      basic_earned: Math.round(basicEarned),
      hra,
      da,
      bonus,
      overtime,
      incentive,
      gross_amount: Math.round(gross),
      reimbursement_amount: Math.round(totalReimbursement),
      net_payable: Math.round(net),
      status: 'pending' as const,
      created_by: userId,
    };
  }


  async updatePayroll(id: number, data: any) {
    console.log('Update Payroll - Received Data:', data);
    const payroll = await this.payrollRepository.findOne({ where: { id } });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    if (data.basic_earned !== undefined) payroll.basic_earned = data.basic_earned;
    if (data.hra !== undefined) payroll.hra = data.hra;
    if (data.da !== undefined) payroll.da = data.da;
    if (data.bonus !== undefined) payroll.bonus = data.bonus;
    if (data.overtime !== undefined) payroll.overtime = data.overtime;
    if (data.incentive !== undefined) payroll.incentive = data.incentive;
    if (data.present_days !== undefined) payroll.present_days = data.present_days;
    if (data.holiday_days !== undefined) payroll.paid_holiday_days = data.holiday_days;
    if (data.week_off_days !== undefined) payroll.week_off_days = data.week_off_days;
    if (data.half_days !== undefined) payroll.half_days = data.half_days;
    if (data.half_day_leave_days !== undefined) payroll.half_day_leave_days = data.half_day_leave_days;
    if (data.paid_leave_days !== undefined) payroll.paid_leave_days = data.paid_leave_days;
    if (data.absent_days !== undefined) payroll.absent_days = Math.round(data.absent_days);
    if (data.lop_days !== undefined) payroll.lop_days = Math.round(data.lop_days);
    if (data.unpaid_leave_days !== undefined) payroll.unpaid_leave_days = data.unpaid_leave_days;
    if (data.reimbursement_amount !== undefined) payroll.reimbursement_amount = data.reimbursement_amount;

    console.log('Update Payroll - Before Save:', payroll);

    // Recalculate gross and net
    payroll.gross_amount =
      Number(payroll.basic_earned) +
      Number(payroll.hra) +
      Number(payroll.da) +
      Number(payroll.bonus) +
      Number(payroll.overtime) +
      Number(payroll.incentive);
    
    payroll.net_payable = Number(payroll.gross_amount) + Number(payroll.reimbursement_amount);

    // If payroll was already paid, revert it to pending when edited
    // This allows re-payment and generation of an updated payslip
    if (payroll.status === 'paid') {
      payroll.status = 'pending';
    }

    return this.payrollRepository.save(payroll);
  }

  async getPayrollForMonth(month: number, year: number, userId: number) {
    // Get all payroll records for the month
    const payrollRecords = await this.payrollRepository.find({
      where: { month, year },
      relations: ['employee'],
      order: { created_at: 'DESC' },
    });

    return payrollRecords;
  }

  async markAsPaid(id: number) {
    const payroll = await this.payrollRepository.findOne({ where: { id } });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    payroll.status = 'paid';
    payroll.paid_at = new Date();
    return this.payrollRepository.save(payroll);
  }

  async getPayslip(employeeId: number, month: number, year: number) {
    const payroll = await this.payrollRepository.findOne({
      where: { employee_id: employeeId, month, year },
      relations: ['employee'],
    });

    if (!payroll) {
      throw new NotFoundException('Payslip not found for this month');
    }

    return {
      employee: payroll.employee,
      payroll,
      month_name: this.getMonthName(month),
      year,
    };
  }

  async getMyPayrollHistory(userId: number) {
    const payrollRecords = await this.payrollRepository.find({
      where: { employee_id: userId },
      order: { year: 'DESC', month: 'DESC' },
    });

    return payrollRecords.map((record) => ({
      ...record,
      month_name: this.getMonthName(record.month),
    }));
  }

  /**
   * Get payroll calculation preview for an employee
   * Shows breakdown of: present days, week offs, paid holidays, and total paid days
   * Used for preview/preview in Settings
   */
  async getPayrollPreview(employeeId: number, month: number, year: number) {
    const employee = await this.userRepository.findOne({
      where: { id: employeeId },
      relations: ['department'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Get salary cycle settings
    const salarySettings = await this.settingsService.getSalarySettings();
    const periodType = salarySettings.period_type || 'calendar';
    const fixedDays = salarySettings.fixed_days || 26;

    const cycleStart = Number(salarySettings.cycle_start_day) || 1;
    
    let startDate: Date;
    let endDate: Date;

    if (cycleStart === 1) {
      startDate = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      endDate = new Date(year, month - 1, lastDayOfMonth);
    } else {
      endDate = new Date(year, month - 1, cycleStart - 1);
      startDate = new Date(year, month - 2, cycleStart);
    }

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const actualCycleDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalCycleDays = periodType === 'fixed' ? fixedDays : actualCycleDays;

    const joiningDate = employee?.date_of_joining ? new Date(employee.date_of_joining) : null;
    if (joiningDate) joiningDate.setHours(0, 0, 0, 0);

    let effectiveCycleDays = actualCycleDays;
    if (joiningDate && joiningDate > startDate && joiningDate <= endDate) {
      effectiveCycleDays = Math.round((endDate.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Get Attendance Summary
    const attendance = await this.attendanceService.getCycleAttendanceSummary(
      employeeId,
      startDateStr,
      endDateStr,
    );

    const presentCount = Number(attendance.present || 0);
    const halfDayCount = Number(attendance.halfDay || 0);
    const holidayCount = Number(attendance.holiday || 0);
    const weekOffCount = Number(attendance.scheduledWeekOffs || 0);
    const paidLeaveCount = Number(attendance.paidLeave || 0);
    const halfDayLeaveCount = Number(attendance.halfDayLeave || 0);
    const unpaidLeaveCount = Number(attendance.unpaidLeave || 0);

    const totalPaidWorkingDays = presentCount + (halfDayCount * 0.5) + paidLeaveCount + (halfDayLeaveCount * 0.5);
    const totalPaidNonWorkingDays = holidayCount + weekOffCount;
    const paidDays = totalPaidWorkingDays + totalPaidNonWorkingDays;
    const lopDays = Math.max(0, effectiveCycleDays - paidDays);

    return {
      employeeId,
      employeeName: employee.name,
      month,
      monthName: this.getMonthName(month),
      year,
      totalCycleDays,
      presentDays: presentCount,
      halfDayDays: halfDayCount,
      halfDayLeaveDays: halfDayLeaveCount,
      paidLeaveDays: paidLeaveCount,
      unpaidLeaveDays: unpaidLeaveCount,
      weekOffDays: weekOffCount,
      paidHolidays: holidayCount,
      lopDays: lopDays,
      departmentId: employee.department_id,
      formula: `Basic ÷ ${totalCycleDays} × (Present + HalfDay*0.5 + PaidLeave + HalfDayLeave*0.5 + WeekOffs + Holidays)`,
      info: {
        totalDaysInMonth: totalCycleDays,
        present: presentCount,
        halfDay: halfDayCount,
        halfDayLeave: halfDayLeaveCount,
        paidLeave: paidLeaveCount,
        unpaidLeave: unpaidLeaveCount,
        weekOffs: weekOffCount,
        paidHolidays: holidayCount,
        lop: lopDays,
      },
    };
  }

  private normalizeHolidayDateString(value: any): string | null {
    if (!value) return null;
    const dateString = String(value).trim();
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  private calculateBasicEarned(salaryStructure: any, month: number, paidDays: number, totalDays: number) {
    const basicSalary = Number(salaryStructure.basic_salary) || 0;
    const perDayBasic = basicSalary / totalDays;
    return perDayBasic * paidDays;
  }

  private calculateGross(salaryStructure: any, month: number, paidDays: number, totalDays: number) {
    const basicEarned = this.calculateBasicEarned(salaryStructure, month, paidDays, totalDays);
    const hra = Number(salaryStructure.house_rent_allowance) || 0;
    const da = Number(salaryStructure.dearness_allowance) || 0;
    const bonus = Number(salaryStructure.bonus) || 0;
    const overtime = Number(salaryStructure.overtime) || 0;
    const incentive = Number(salaryStructure.incentive) || 0;

    return basicEarned + hra + da + bonus + overtime + incentive;
  }

  private calculateNetPayable(grossAmount: any, salaryStructure: any, attendanceStats: any) {
    const gross = Number(grossAmount);
    const pfDeduction = Number(salaryStructure.pf_deduction) || 0;
    const esiDeduction = Number(salaryStructure.esi_deduction) || 0;
    const tdsDeduction = Number(salaryStructure.tds_deduction) || 0;
    const professionalTax = Number(salaryStructure.professional_tax) || 0;
    const reimbursements = Number(attendanceStats.approvedReimbursements) || 0;

    const totalDeductions = pfDeduction + esiDeduction + tdsDeduction + professionalTax;
    return gross - totalDeductions + reimbursements;
  }

  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  /**
   * Calculate paid week off days for an employee based on their department's week off days
   */
  private async calculatePaidWeekOffs(
    departmentId: number | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      // Get department's week off days (0=Sunday, 1=Monday, ..., 6=Saturday)
      let weekOffDays: number[] = [];
      
      if (departmentId) {
        const department = await this.departmentRepository.findOne({
          where: { id: departmentId },
        });
        
        if (department && department.week_off_days) {
          // Parse week_off_days - could be array or JSON string
          if (Array.isArray(department.week_off_days)) {
            weekOffDays = department.week_off_days;
          } else if (typeof department.week_off_days === 'string') {
            try {
              weekOffDays = JSON.parse(department.week_off_days);
            } catch {
              weekOffDays = [];
            }
          }
        }
      }

      if (weekOffDays.length === 0) {
        console.log('No week off days configured for department');
        return 0;
      }

      // Count how many week off days fall within the range
      let paidWeekOffCount = 0;
      const weekOffDates: string[] = [];
      
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const dayOfWeek = cursor.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        
        if (weekOffDays.includes(dayOfWeek)) {
          paidWeekOffCount++;
          weekOffDates.push(cursor.toISOString().split('T')[0]);
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      console.log(`
📅 WEEK-OFF CALCULATION for Department ${departmentId}:
   Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}
   Week-Off Days: ${weekOffDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
   Occurring:
   ${weekOffDates.join(', ') || 'None'}
   Total Week-Offs: ${paidWeekOffCount} days
      `);
      return paidWeekOffCount;
    } catch (error) {
      console.error('Error calculating paid week offs:', error);
      return 0;
    }
  }

  /**
   * Calculate paid holidays for a given date range
   */
  private async calculatePaidHolidays(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch all active paid holidays within this date range from the Holiday Repository
      const holidays = await this.holidayRepository
        .createQueryBuilder('holiday')
        .where('holiday.date BETWEEN :startDate AND :endDate', {
          startDate: startDateStr,
          endDate: endDateStr,
        })
        .andWhere('holiday.type = :type', { type: 'paid' })
        .andWhere('holiday.is_active = :isActive', { isActive: true })
        .getMany();

      // Get configuration-based holidays from settings
      const holidaySettings = await this.settingsService.getHolidaySettings();
      const configHolidayDates = new Set<string>(
        (holidaySettings.paid_holidays || [])
          .map((value) => this.normalizeHolidayDateString(value))
          .filter(Boolean) as string[],
      );

      // Collect all holiday date strings
      const allHolidayDates = new Set<string>();
      
      // Add holidays from repository
      holidays.forEach((h) => {
        const dateKey = this.normalizeHolidayDateString(h.date);
        if (dateKey) allHolidayDates.add(dateKey);
      });
      
      // Add holidays from settings
      configHolidayDates.forEach((dateKey) => {
        if (dateKey) allHolidayDates.add(dateKey);
      });

      // Filter holidays that fall within the range
      const filteredHolidays = Array.from(allHolidayDates).filter((dateKey) => {
        return dateKey >= startDateStr && dateKey <= endDateStr;
      });

      console.log(`
🎉 PAID HOLIDAYS for range ${startDateStr} to ${endDateStr}:
   ${filteredHolidays.length > 0 ? filteredHolidays.join('\n   ') : 'No paid holidays'}
   Total: ${filteredHolidays.length} day(s)
      `);
      
      return filteredHolidays.length;
    } catch (error) {
      console.error('Error calculating paid holidays:', error);
      return 0;
    }
  }
}
