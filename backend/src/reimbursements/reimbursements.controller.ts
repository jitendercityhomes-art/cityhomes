import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ReimbursementsService } from './reimbursements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reimbursements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReimbursementsController {
  constructor(private readonly reimbursementsService: ReimbursementsService) {}

  @Post()
  @Roles('superadmin', 'hr', 'employee')
  create(@Body() data: any, @Request() req) {
    return this.reimbursementsService.create(data, req.user.userId);
  }

  @Get()
  @Roles('superadmin', 'hr')
  findAll(@Query('status') status?: string) {
    return this.reimbursementsService.findAll(status);
  }

  @Get('my')
  @Roles('employee')
  findMy(@Request() req) {
    return this.reimbursementsService.findByEmployee(req.user.userId);
  }

  @Put(':id/approve')
  @Roles('superadmin', 'hr')
  approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.reimbursementsService.approve(id, Number(req.user.userId));
  }

  @Put(':id/reject')
  @Roles('superadmin', 'hr')
  reject(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.reimbursementsService.reject(id, Number(req.user.userId));
  }

  @Delete(':id')
  @Roles('employee')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.reimbursementsService.remove(id, Number(req.user.userId));
  }
}
