import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from './settings.entity';

@Injectable()
export class SettingsService {
  // In-memory cache for performance
  private settingsCache: Map<string, any> = new Map();
  private cacheLoaded = false;

  constructor(
    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,
  ) {
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    const defaultSettings = [
      { key: 'salary_period_type', value: 'calendar', type: 'text' },
      { key: 'salary_fixed_days', value: '26', type: 'number' },
      { key: 'salary_cycle_start_day', value: '1', type: 'number' },
      { key: 'salary_cycle_end_day', value: '31', type: 'number' },
      { key: 'salary_pay_day', value: '5', type: 'number' },
      { key: 'salary_pay_month', value: 'next', type: 'text' },
      { key: 'salary_overtime_rate', value: '1.5', type: 'number' },
      { key: 'salary_holiday_policy', value: 'paid', type: 'text' },
      { key: 'holiday_week_off_days', value: '[]', type: 'json' },
      { key: 'holiday_paid_holidays', value: '[]', type: 'json' },
      { key: 'holiday_default_type', value: 'paid', type: 'text' },
    ];

    for (const setting of defaultSettings) {
      const exists = await this.settingsRepository.findOne({ where: { key: setting.key } });
      if (!exists) {
        await this.settingsRepository.save({
          key: setting.key,
          value: setting.value,
          type: setting.type,
          is_system: true,
        });
      }
    }
  }

  private async loadCacheFromDb() {
    if (this.cacheLoaded) return;
    const all = await this.settingsRepository.find();
    this.settingsCache.clear();
    all.forEach((s) => {
      let parsedValue: any = s.value;
      if (s.type === 'json') {
        try {
          parsedValue = JSON.parse(s.value || '[]');
        } catch {
          parsedValue = [];
        }
      } else if (s.type === 'number') {
        parsedValue = Number(s.value);
      }
      this.settingsCache.set(s.key, parsedValue);
    });
    this.cacheLoaded = true;
  }

  async getSettingValue(key: string, defaultValue?: any) {
    await this.loadCacheFromDb();
    return this.settingsCache.has(key) ? this.settingsCache.get(key) : defaultValue;
  }

  async setSettingValue(key: string, value: any, type: string = 'text', userId?: string) {
    await this.loadCacheFromDb();
    
    let stringValue = String(value);
    if (type === 'json') {
      stringValue = JSON.stringify(value);
    }

    let existing = await this.settingsRepository.findOne({ where: { key } });
    if (existing) {
      existing.value = stringValue;
      existing.type = type;
      await this.settingsRepository.save(existing);
    } else {
      await this.settingsRepository.save({ key, value: stringValue, type, is_system: false });
    }

    this.settingsCache.set(key, value);
    return value;
  }

  async getSalarySettings() {
    const periodType = await this.getSettingValue('salary_period_type', 'calendar');
    const fixedDays = await this.getSettingValue('salary_fixed_days', 26);
    const cycleStartDay = await this.getSettingValue('salary_cycle_start_day', 1);
    const cycleEndDay = await this.getSettingValue('salary_cycle_end_day', 31);
    const payDay = await this.getSettingValue('salary_pay_day', 5);
    const payMonth = await this.getSettingValue('salary_pay_month', 'next');
    const overtimeRate = await this.getSettingValue('salary_overtime_rate', 1.5);
    const holidayPolicy = await this.getSettingValue('salary_holiday_policy', 'paid');

    return {
      period_type: periodType,
      fixed_days: fixedDays,
      cycle_start_day: cycleStartDay,
      cycle_end_day: cycleEndDay,
      pay_day: payDay,
      pay_month: payMonth,
      overtime_rate: overtimeRate,
      holiday_policy: holidayPolicy,
    };
  }

  async updateSalarySettings(settings: any, userId?: string) {
    await this.setSettingValue('salary_period_type', settings.period_type, 'text', userId);
    await this.setSettingValue('salary_fixed_days', settings.fixed_days, 'number', userId);
    await this.setSettingValue('salary_cycle_start_day', settings.cycle_start_day, 'number', userId);
    await this.setSettingValue('salary_cycle_end_day', settings.cycle_end_day, 'number', userId);
    await this.setSettingValue('salary_pay_day', settings.pay_day, 'number', userId);
    await this.setSettingValue('salary_pay_month', settings.pay_month, 'text', userId);
    await this.setSettingValue('salary_overtime_rate', settings.overtime_rate, 'number', userId);
    await this.setSettingValue('salary_holiday_policy', settings.holiday_policy, 'text', userId);

    return this.getSalarySettings();
  }

  async getHolidaySettings() {
    const weekOffDays = await this.getSettingValue('holiday_week_off_days', [0, 6]);
    const paidHolidays = await this.getSettingValue('holiday_paid_holidays', []);
    const defaultHolidayType = await this.getSettingValue('holiday_default_type', 'paid');

    return {
      week_off_days: weekOffDays,
      paid_holidays: paidHolidays,
      default_type: defaultHolidayType,
    };
  }

  async updateHolidaySettings(settings: any, userId?: string) {
    await this.setSettingValue('holiday_week_off_days', settings.week_off_days, 'json', userId);
    await this.setSettingValue('holiday_paid_holidays', settings.paid_holidays || [], 'json', userId);
    await this.setSettingValue('holiday_default_type', settings.default_type, 'text', userId);

    return this.getHolidaySettings();
  }

  async getAllSettings() {
    await this.loadCacheFromDb();
    return Array.from(this.settingsCache.entries()).map(([key, value]) => ({ key, value }));
  }
}
