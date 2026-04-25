import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollRun } from './entities/payroll-run.entity';
import { User } from '../entities/user.entity';
import { Holiday } from '../holidays/entities/holiday.entity';
import { Department } from '../departments/entities/department.entity';
import { Reimbursement } from '../reimbursements/entities/reimbursement.entity';
import { SalaryStructure } from '../salary/entities/salary-structure.entity';
import { SettingsModule } from '../settings/settings.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayrollRun,
      User,
      Holiday,
      Department,
      Reimbursement,
      SalaryStructure,
    ]),
    SettingsModule,
    forwardRef(() => AttendanceModule),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
