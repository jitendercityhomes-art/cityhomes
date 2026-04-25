import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './branch.entity';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.findOne(id);
  }

  @Post()
  async create(@Body() branchData: Partial<Branch>) {
    return this.branchesService.create(branchData);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() branchData: Partial<Branch>) {
    return this.branchesService.update(id, branchData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.remove(id);
  }
}
