import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { SalaryStructure } from './entities/salary-structure.entity';
import { Payroll } from './entities/payroll.entity';
import { SalarySettings } from './entities/salary-settings.entity';
import { Department } from '../departments/entities/department.entity';
import { Holiday } from '../holidays/entities/holiday.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalaryStructure, Payroll, SalarySettings, Department, Holiday])],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
