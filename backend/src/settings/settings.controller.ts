import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('salary')
  @Roles('superadmin', 'hr', 'employee')
  getSalarySettings() {
    return this.settingsService.getSalarySettings();
  }

  @Put('salary')
  @Roles('superadmin')
  updateSalarySettings(@Body() settings: any, @Request() req) {
    return this.settingsService.updateSalarySettings(settings, req.user.userId);
  }

  @Get('holidays/config')
  @Roles('superadmin', 'hr', 'employee')
  getHolidaySettings() {
    return this.settingsService.getHolidaySettings();
  }

  @Put('holidays/config')
  @Roles('superadmin')
  updateHolidaySettings(@Body() settings: any, @Request() req) {
    return this.settingsService.updateHolidaySettings(settings, req.user.userId);
  }

  @Get('all')
  @Roles('superadmin')
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }
}
