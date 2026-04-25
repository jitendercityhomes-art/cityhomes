import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { SalaryStructure } from './entities/salary-structure.entity';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { SalarySettings } from './entities/salary-settings.entity';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(SalaryStructure)
    private salaryRepository: Repository<SalaryStructure>,
    @InjectRepository(SalarySettings)
    private settingsRepository: Repository<SalarySettings>,
  ) {}

  async getSettings() {
    let settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepository.create({});
      await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(data: any, userId: number) {
    const settings = await this.getSettings();
    Object.assign(settings, data);
    settings.updated_by = userId;
    return this.settingsRepository.save(settings);
  }

  async setSalary(data: any, userId: number) {
    const employeeId = data.employee_id;
    // Close any existing active salary structure for this employee
    await this.salaryRepository.update(
      { employee_id: employeeId, effective_to: null },
      { effective_to: new Date() },
    );

    // Calculate gross and net salary
    const { gross_salary, net_salary } = this.calculateSalary(data);

    // Create new salary structure
    const salaryStructure = this.salaryRepository.create({
      ...data,
      employee_id: employeeId,
      gross_salary,
      net_salary,
      created_by: userId,
      effective_from: data.effective_from ? new Date(data.effective_from) : new Date(),
    });

    return this.salaryRepository.save(salaryStructure);
  }

  async getCurrentSalary(employeeId: number) {
    const salary = await this.salaryRepository.findOne({
      where: {
        employee_id: employeeId,
        effective_to: null, // Currently active
      },
    });

    if (!salary) {
      throw new NotFoundException('No active salary structure found for this employee');
    }

    return salary;
  }

  async getSalaryHistory(employeeId: number) {
    return this.salaryRepository.find({
      where: { employee_id: employeeId },
      order: { effective_from: 'DESC' },
    });
  }

  async updateSalary(id: number, updateSalaryDto: UpdateSalaryDto) {
    const salary = await this.salaryRepository.findOne({ where: { id } });

    if (!salary) {
      throw new NotFoundException('Salary structure not found');
    }

    // Recalculate gross and net if any component changed
    const updatedData: any = { ...updateSalaryDto };
    if (this.hasSalaryComponents(updateSalaryDto)) {
      const updated: any = { ...salary, ...updateSalaryDto };
      const calculated = this.calculateSalary(updated);
      updatedData.gross_salary = calculated.gross_salary;
      updatedData.net_salary = calculated.net_salary;
    }

    await this.salaryRepository.update(id, updatedData);
    return this.salaryRepository.findOne({ where: { id } });
  }

  async calculatePayrollFromSalaryStructure(
    salaryStructure: SalaryStructure,
    attendanceStats: any,
  ) {
    const basicSalary = Number(salaryStructure.basic);
    const hra = Number(salaryStructure.hra);
    const da = Number(salaryStructure.da);
    const bonus = Number(salaryStructure.bonus);
    const overtime = Number(salaryStructure.overtime);
    const incentive = Number(salaryStructure.incentive);

    // Get cycle days
    const month = attendanceStats.month || new Date().getMonth() + 1;
    const year = attendanceStats.year || new Date().getFullYear();
    const totalDays = new Date(year, month, 0).getDate();

    // CORRECT FORMULA:
    // PaidDays = PresentDays + PaidWeekOffs + PaidHolidays
    const presentDays = attendanceStats.presentDays || 0;
    const paidWeekOffs = attendanceStats.weekOffDays || 0;
    const paidHolidays = attendanceStats.paidHolidays || 0;
    const paidDays = presentDays + paidWeekOffs + paidHolidays;
    const lopDays = Math.max(0, totalDays - paidDays);

    // Calculate earned basic based on paid days (not just present days)
    const perDayBasic = basicSalary / totalDays;
    const earnedBasic = perDayBasic * paidDays;

    // Gross salary calculation
    const grossSalary = earnedBasic + hra + da + bonus + overtime + incentive;

    // Deductions
    const pfDeduction = Number(salaryStructure.pf_deduction);
    const esiDeduction = Number(salaryStructure.esi_deduction);
    const tdsDeduction = Number(salaryStructure.tds_deduction);
    const professionalTax = Number(salaryStructure.professional_tax);

    const totalDeductions = pfDeduction + esiDeduction + tdsDeduction + professionalTax;

    // Net salary
    const netSalary = grossSalary - totalDeductions;

    console.log('Salary Calculation:', {
      month,
      year,
      totalDays,
      presentDays,
      paidWeekOffs,
      paidHolidays,
      paidDays,
      lopDays,
      basicSalary,
      earnedBasic,
      grossSalary,
      netSalary,
    });

    return {
      basicSalary,
      earnedBasic,
      hra,
      da,
      bonus,
      overtime,
      incentive,
      grossSalary,
      pfDeduction,
      esiDeduction,
      tdsDeduction,
      professionalTax,
      totalDeductions,
      netSalary,
      presentDays,
      paidWeekOffs,
      paidHolidays,
      paidDays,
      lopDays,
      formula: `₹${basicSalary} ÷ ${totalDays} × (${presentDays} present + ${paidWeekOffs} weekoffs + ${paidHolidays} holiday) = ₹${earnedBasic.toFixed(2)}`,
    };
  }

  private calculateSalary(data: any) {
    const basic = Number(data.basic) || 0;
    const hra = Number(data.hra) || 0;
    const da = Number(data.da) || 0;
    const bonus = Number(data.bonus) || 0;
    const overtime = Number(data.overtime) || 0;
    const incentive = Number(data.incentive) || 0;

    const grossSalary = basic + hra + da + bonus + overtime + incentive;

    const pfDeduction = Number(data.pf_deduction) || 0;
    const esiDeduction = Number(data.esi_deduction) || 0;
    const tdsDeduction = Number(data.tds_deduction) || 0;
    const professionalTax = Number(data.professional_tax) || 0;

    const totalDeductions = pfDeduction + esiDeduction + tdsDeduction + professionalTax;
    const netSalary = grossSalary - totalDeductions;

    return { gross_salary: grossSalary, net_salary: netSalary };
  }

  private hasSalaryComponents(dto: UpdateSalaryDto): boolean {
    return Object.keys(dto).some(key => 
      key !== 'effective_from' && dto[key] !== undefined
    );
  }
}
