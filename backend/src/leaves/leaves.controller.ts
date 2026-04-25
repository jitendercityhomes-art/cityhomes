import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  createLeave(@Body() createLeaveDto: CreateLeaveDto, @Request() req) {
    return this.leavesService.createLeave(req.user.userId, createLeaveDto);
  }

  @Get()
  getLeaves(
    @Query('status') status?: string,
    @Query('employee_id') employeeId?: string,
  ) {
    return this.leavesService.findAll({
      status,
      employee_id: employeeId ? Number(employeeId) : undefined,
    });
  }

  @Get('pending')
  @Roles('superadmin', 'hr')
  getPendingLeaves() {
    return this.leavesService.getPendingLeaves();
  }

  @Get(':id')
  getLeave(@Param('id', ParseIntPipe) id: number) {
    return this.leavesService.findOne(id);
  }

  @Post(':id/approve')
  @Roles('superadmin', 'hr')
  approveLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body('leave_type') leaveType: string,
    @Request() req,
  ) {
    return this.leavesService.approveLeave(id, Number(req.user.userId), leaveType);
  }

  @Post(':id/reject')
  @Roles('superadmin', 'hr')
  rejectLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.leavesService.rejectLeave(id, Number(req.user.userId), body.reason);
  }

  @Delete(':id')
  @Roles('employee')
  removeLeave(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.leavesService.removeLeave(id, Number(req.user.userId));
  }
}
