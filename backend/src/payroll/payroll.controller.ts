import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
  ParseIntPipe,
  Injectable,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  private ensureSelfOrManager(requestUser: any, employeeId: string) {
    if (requestUser?.role === 'employee' && String(requestUser.userId) !== String(employeeId)) {
      throw new ForbiddenException('You can only access your own payslip');
    }
  }

  @Get()
  @Roles('superadmin', 'hr')
  getPayroll(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    return this.payrollService.getPayrollForMonth(
      parseInt(month as any),
      parseInt(year as any),
      req.user.userId,
    );
  }

  @Post('/sync')
  @Roles('superadmin', 'hr')
  syncPayroll(
    @Body() data: { month: number; year: number },
    @Request() req,
  ) {
    return this.payrollService.bulkSync(data.month, data.year, req.user.userId);
  }

  @Post('/calculate')
  @Roles('superadmin', 'hr')
  calculatePayroll(
    @Body() data: {
      employeeId: string;
      month: number;
      year: number;
    },
    @Request() req,
  ) {
    return this.payrollService.calculatePayroll(
      Number(data.employeeId),
      data.month,
      data.year,
      req.user.userId,
    );
  }

  @Put(':id/mark-paid')
  @Roles('superadmin', 'hr')
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.markAsPaid(id);
  }

  @Put(':id')
  @Roles('superadmin', 'hr')
  updatePayroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.payrollService.updatePayroll(id, data);
  }

  @Get(':employeeId/payslip')
  @Roles('superadmin', 'hr', 'employee')
  getPayslip(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    this.ensureSelfOrManager(req.user, String(employeeId));
    return this.payrollService.getPayslip(
      employeeId,
      parseInt(month as any),
      parseInt(year as any),
    );
  }

  @Get('preview')
  @Roles('superadmin', 'hr')
  async getPayrollPreview(
    @Query('employeeId') employeeId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    /**
     * Calculate payroll preview with breakdown of:
     * - Week offs count for the employee's department
     * - Paid holidays count for the month
     * - Formula showing: Basic ÷ Days × (Present + WeekOffs + Holidays) = Net
     */
    return this.payrollService.getPayrollPreview(
      Number(employeeId),
      Number(month),
      Number(year),
    );
  }

  @Get('my-history')
  @Roles('superadmin', 'hr', 'employee')
  getMyPayrollHistory(@Request() req) {
    return this.payrollService.getMyPayrollHistory(req.user.userId);
  }
}
