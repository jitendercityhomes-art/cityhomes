import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto, userId: number) {
    // Check if department with same name exists
    const existing = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }

    const base = createDepartmentDto.name.replace(/\s+/g, '').toLowerCase().slice(0, 3);
    const pattern = `${base}%`;
    const count = await this.departmentRepository.createQueryBuilder('department')
      .where('department.department_code LIKE :pattern', { pattern })
      .getCount();
    const departmentCode = `${base}${String(count + 1).padStart(2, '0')}`;

    // Set default week_off_days based on department name
    let defaultWeekOffDays: number[] = [0]; // Default: Sunday only
    const deptName = createDepartmentDto.name.toLowerCase();
    if (deptName.includes('it') || deptName.includes('information technology')) {
      defaultWeekOffDays = [0, 6]; // Saturday and Sunday for IT
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      week_off_days: createDepartmentDto.week_off_days || defaultWeekOffDays,
      department_code: departmentCode,
      created_by: userId,
    });

    return this.departmentRepository.save(department);
  }

  async findAll() {
    return this.departmentRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id, is_active: true },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);

    // Check for duplicate name if name is being updated
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existing = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existing) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: number) {
    // Ensure department exists before deleting
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['employees']
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (department.employees && department.employees.length > 0) {
      throw new ConflictException(`Cannot delete department. It has ${department.employees.length} assigned employees. Please move or remove them first.`);
    }

    // Hard delete from DB (remove row entirely)
    const result = await this.departmentRepository.delete(id);
    console.log(`Department ${id} deleted`, result);
    return result;
  }

  async getWeekOffNames(weekOffDays: number[]): Promise<string[]> {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekOffDays.map(dayIndex => dayNames[dayIndex]);
  }
}
