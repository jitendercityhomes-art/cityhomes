import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  @Roles('superadmin')
  create(@Body() createHolidayDto: CreateHolidayDto, @Request() req) {
    return this.holidaysService.create(createHolidayDto, req.user.userId);
  }

  @Get()
  async findAll(@Query('year') year?: string, @Query('nested') nested?: boolean) {
    const holidays = await this.holidaysService.findAll(year ? parseInt(year) : undefined);
    if (nested) {
      return this.holidaysService.convertToNestedFormat(holidays);
    }
    return holidays;
  }

  @Get('/employee/:id')
  getEmployeeHolidays(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year: number,
  ) {
    return this.holidaysService.getHolidaysForEmployee(id, parseInt(year as any));
  }

  @Get('/format/nested')
  async getNestedHolidays(@Query('year') year?: number) {
    const holidays = await this.holidaysService.findAll(year ? parseInt(year as any) : undefined);
    return this.holidaysService.convertToNestedFormat(holidays);
  }

  @Patch(':id')
  @Roles('superadmin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ) {
    return this.holidaysService.update(id, updateHolidayDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.holidaysService.remove(id);
  }
}
