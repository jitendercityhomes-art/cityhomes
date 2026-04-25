import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../departments/entities/department.entity';
import { Holiday } from '../holidays/entities/holiday.entity';

@Controller('salary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalaryController {
  constructor(
    private readonly salaryService: SalaryService,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
  ) {}

  private ensureSelfOrManager(requestUser: any, employeeId: string) {
    if (requestUser?.role === 'employee' && String(requestUser.userId) !== String(employeeId)) {
      throw new ForbiddenException('You can only access your own salary records');
    }
  }

  @Get('settings')
  @Roles('superadmin', 'hr')
  async getSettings() {
    return this.salaryService.getSettings();
  }

  @Put('settings')
  @Roles('superadmin')
  async updateSettings(@Body() data: any, @Request() req) {
    return this.salaryService.updateSettings(data, req.user.userId);
  }

  @Post()
  @Roles('superadmin')
  async setSalary(@Body() data: any, @Request() req) {
    return this.salaryService.setSalary(data, req.user.userId);
  }

  @Get(':employeeId')
  @Roles('superadmin', 'hr', 'employee')
  getCurrentSalary(@Param('employeeId', ParseIntPipe) employeeId: number, @Request() req) {
    this.ensureSelfOrManager(req.user, String(employeeId));
    return this.salaryService.getCurrentSalary(employeeId);
  }

  @Get(':employeeId/history')
  @Roles('superadmin', 'hr', 'employee')
  getSalaryHistory(@Param('employeeId', ParseIntPipe) employeeId: number, @Request() req) {
    this.ensureSelfOrManager(req.user, String(employeeId));
    return this.salaryService.getSalaryHistory(employeeId);
  }

  @Patch(':id')
  @Roles('superadmin')
  updateSalary(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    return this.salaryService.updateSalary(id, updateSalaryDto);
  }

  @Post('/calculate')
  @Roles('superadmin', 'hr')
  async calculatePayroll(
    @Body() data: { employeeId: string; attendanceStats: any },
  ) {
    const salary = await this.salaryService.getCurrentSalary(Number(data.employeeId));
    return this.salaryService.calculatePayrollFromSalaryStructure(
      salary,
      data.attendanceStats,
    );
  }

  @Get('/preview-weekoffs')
  @Roles('superadmin', 'hr')
  async previewWeekOffs(
    @Query('departmentId') departmentId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const deptId = Number(departmentId);
    const monthNum = Number(month);
    const yearNum = Number(year);

    // Get department's week off days
    let weekOffDays: number[] = [];
    if (deptId) {
      const department = await this.departmentRepository.findOne({
        where: { id: deptId },
      });
      if (department && department.week_off_days) {
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

    // Count week offs in the month
    const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate();
    let weekOffCount = 0;
    const weekOffDates: string[] = [];

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentDate = new Date(yearNum, monthNum - 1, day);
      const dayOfWeek = currentDate.getDay();
      
      if (weekOffDays.includes(dayOfWeek)) {
        weekOffCount++;
        weekOffDates.push(currentDate.toISOString().split('T')[0]);
      }
    }

    // Count paid holidays in the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    const holidays = await this.holidayRepository
      .createQueryBuilder('holiday')
      .where('holiday.date BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .andWhere('holiday.type = :type', { type: 'paid' })
      .andWhere('holiday.is_active = :isActive', { isActive: true })
      .getMany();

    return {
      departmentId: deptId,
      month: monthNum,
      year: yearNum,
      totalDaysInMonth,
      weekOffDays,
      weekOffCount,
      weekOffDates,
      paidHolidayCount: holidays.length,
      paidHolidays: holidays.map(h => ({
        date: h.date,
        name: h.name,
      })),
    };
  }
}
