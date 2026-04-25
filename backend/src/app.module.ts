import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { UserModule } from './user/user.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { DepartmentsModule } from './departments/departments.module';
import { HolidaysModule } from './holidays/holidays.module';
import { SalaryModule } from './salary/salary.module';
import { SettingsModule } from './settings/settings.module';
import { BranchesModule } from './branches/branches.module';
import { ReimbursementsModule } from './reimbursements/reimbursements.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollModule } from './payroll/payroll.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cityhomes_hrms',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: false,
      ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false,
      } : false,
    }),
    AuthModule,
    AttendanceModule,
    UserModule,
    FileStorageModule,
    DepartmentsModule,
    HolidaysModule,
    SalaryModule,
    SettingsModule,
    BranchesModule,
    ReimbursementsModule,
    ActivityLogModule,
    LeavesModule,
    PayrollModule,
    OtpModule,
  ],
})
export class AppModule {}
