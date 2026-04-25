import { 
  Controller, 
  Get, 
  Post, 
  Request, 
  Put, 
  Body, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  ForbiddenException, 
  InternalServerErrorException, 
  ParseIntPipe, 
} from '@nestjs/common'; 
import { UserService } from './user.service'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/decorators/roles.decorator'; 

@Controller('employees') 
@UseGuards(JwtAuthGuard, RolesGuard) 
export class UserController { 
  constructor(private userService: UserService) { 
    console.log('UserController initialized'); 
  } 

  private ensureOwnRecordOrAllowed(requestUser: any, employeeId: string) { 
    if (requestUser?.role === 'employee' && String(requestUser.userId) !== String(employeeId)) { 
      throw new ForbiddenException('You can only access your own employee data'); 
    } 
  } 

  // Legacy endpoints for backward compatibility 
  @Get('profile') 
  async getProfile(@Request() req) { 
    console.log('UserController: getProfile request received for user:', req.user?.userId); 
    return this.userService.findOne(req.user.userId); 
  } 

  @Put('profile') 
  async updateProfile(@Request() req, @Body() data: any) { 
    console.log('UserController: updateProfile request received for user:', req.user?.userId); 
    console.log('Payload:', data); 
    try { 
      const result = await this.userService.updateProfile(req.user.userId, data); 
      console.log('UserController: updateProfile successful'); 
      return result; 
    } catch (error) { 
      console.error('UserController: updateProfile failed:', (error as any).message); 
      throw error; 
    } 
  } 

  // Employee management endpoints 
  @Get() 
  @Roles('superadmin', 'hr') 
  async getEmployees( 
    @Query('department_id') deptId?: string, 
    @Query('branch_id') branchId?: string, 
    @Query('role') role?: string, 
    @Query('search') search?: string, 
    @Query('page') page?: number, 
    @Query('limit') limit?: number, 
  ) { 
    return this.userService.findEmployees({ 
      department_id: deptId ? parseInt(deptId, 10) : undefined, 
      branch_id: branchId ? parseInt(branchId, 10) : undefined, 
      role, 
      search, 
      page: page ? parseInt(page as any) : undefined, 
      limit: limit ? parseInt(limit as any) : undefined, 
    }); 
  } 

  @Get('next-id') 
  @Roles('superadmin', 'hr') 
  async getNextEmployeeId() { 
    return this.userService.getNextEmployeeId(); 
  } 

  @Get(':id') 
  @Roles('superadmin', 'hr', 'employee') 
  async getEmployee(@Param('id', ParseIntPipe) id: number, @Request() req) { 
    this.ensureOwnRecordOrAllowed(req.user, String(id)); 
    return this.userService.findOne(id); 
  } 

  @Post()
  @Roles('superadmin', 'hr')
  async createEmployee(@Body() employeeData: any, @Request() req) {
    try {
      return await this.userService.createEmployee(employeeData, req.user);
    } catch (error) { 
      console.error('Failed to create employee', { 
        payload: employeeData, 
        error: (error as any)?.message || error, 
      }); 
      throw new InternalServerErrorException((error as any)?.message || 'Unable to create employee'); 
    } 
  } 

  @Put(':id')
  @Roles('superadmin', 'hr')
  async updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @Request() req
  ) {
    return this.userService.updateProfile(id, data, req.user);
  } 

  @Delete(':id') 
  @Roles('superadmin') 
  async deleteEmployee(@Param('id', ParseIntPipe) id: number) { 
    return this.userService.deleteEmployee(id); 
  } 

  @Get(':id/holidays') 
  @Roles('superadmin', 'hr', 'employee') 
  async getEmployeeHolidays( 
    @Param('id', ParseIntPipe) id: number, 
    @Query('year') year: number, 
    @Request() req, 
  ) { 
    this.ensureOwnRecordOrAllowed(req.user, String(id)); 
    return this.userService.getEmployeeHolidays(id, parseInt(year as any)); 
  } 

  @Get(':id/salary') 
  @Roles('superadmin', 'hr', 'employee') 
  async getEmployeeSalary(@Param('id', ParseIntPipe) id: number, @Request() req) { 
    this.ensureOwnRecordOrAllowed(req.user, String(id)); 
    return this.userService.getEmployeeSalary(id); 
  } 

  @Get(':id/attendance') 
  @Roles('superadmin', 'hr', 'employee') 
  async getEmployeeAttendance( 
    @Param('id', ParseIntPipe) id: number, 
    @Query('month') month: number, 
    @Query('year') year: number, 
    @Request() req, 
  ) { 
    this.ensureOwnRecordOrAllowed(req.user, String(id)); 
    return this.userService.getEmployeeAttendance(id, Number(month), Number(year)); 
  } 

  @Get('all') 
  @Roles('superadmin', 'hr') 
  async getAllUsers() { 
    return this.userService.findAll(); 
  } 
 }