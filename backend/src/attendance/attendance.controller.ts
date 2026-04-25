import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PunchInDto } from './dto/punch-in.dto';
import { PunchOutDto } from './dto/punch-out.dto';
import { EditAttendanceDto } from './dto/edit-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('punch-in')
  @Roles('superadmin', 'hr', 'employee')
  punchIn(@Request() req, @Body() dto: PunchInDto) {
    return this.attendanceService.punchIn(Number(req.user.userId), dto);
  }

  @Post('punch-out')
  @Roles('superadmin', 'hr', 'employee')
  punchOut(@Request() req, @Body() dto: PunchOutDto) {
    return this.attendanceService.punchOut(Number(req.user.userId), dto);
  }

  @Get('today')
  @Roles('superadmin', 'hr', 'employee')
  getToday(@Request() req) {
    return this.attendanceService.getTodayStatus(Number(req.user.userId));
  }

  @Get('my')
  @Roles('superadmin', 'hr', 'employee')
  getMyAttendance(
    @Request() req,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.attendanceService.getMonthlyAttendance(Number(req.user.userId), month, year);
  }

  @Get('live')
  @Roles('superadmin', 'hr')
  getLive(@Query('date') date?: string) {
    return this.attendanceService.getLiveAttendance(date);
  }

  @Get('employee/:id')
  @Roles('superadmin', 'hr')
  getEmployeeAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.attendanceService.getMonthlyAttendance(id, month, year);
  }

  @Get('summary')
  @Roles('superadmin', 'hr', 'employee')
  getAttendanceSummary(
    @Query('employeeId', ParseIntPipe) employeeId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getCycleAttendanceSummary(employeeId, startDate, endDate);
  }

  @Put('employee/:id/date/:date')
  @Roles('superadmin', 'hr')
  editEmployeeAttendanceByDate(
    @Param('id', ParseIntPipe) id: number,
    @Param('date') date: string,
    @Body() dto: EditAttendanceDto,
    @Request() req,
  ) {
    return this.attendanceService.upsertEmployeeAttendanceForDate(
      id,
      date,
      dto,
      Number(req.user.userId),
    );
  }

  @Put(':id/edit')
  @Roles('superadmin', 'hr')
  edit(@Param('id', ParseIntPipe) id: number, @Body() dto: EditAttendanceDto, @Request() req) {
    return this.attendanceService.editAttendance(id, dto, req.user.userId);
  }
}
