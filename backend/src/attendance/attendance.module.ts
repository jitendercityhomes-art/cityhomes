import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceCron } from './attendance.cron';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceSettings } from '../entities/attendance-settings.entity';
import { User } from '../entities/user.entity';
import { Branch } from '../branches/branch.entity';
import { Holiday } from '../holidays/entities/holiday.entity';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { Department } from '../departments/entities/department.entity';
import { SettingsModule } from '../settings/settings.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { PayrollModule } from '../payroll/payroll.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, AttendanceSettings, User, Branch, Holiday, LeaveRequest, Department]), 
    SettingsModule,
    FileStorageModule,
    forwardRef(() => PayrollModule),
  ],
  providers: [AttendanceService, AttendanceCron],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
