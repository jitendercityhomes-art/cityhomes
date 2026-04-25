import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepo.find();
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(data: Partial<Branch>): Promise<Branch> {
    const base = data.name?.replace(/\s+/g, '').toLowerCase().slice(0, 3) || 'brn';
    const pattern = `${base}%`;
    const count = await this.branchRepo.createQueryBuilder('branch')
      .where('branch.branch_code LIKE :pattern', { pattern })
      .getCount();
    const branchCode = `${base}${String(count + 1).padStart(2, '0')}`;

    const branch = this.branchRepo.create({
      ...data,
      branch_code: branchCode,
    });
    return this.branchRepo.save(branch);
  }

  async update(id: number, data: Partial<Branch>): Promise<Branch> {
    await this.branchRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const branch = await this.branchRepo.findOne({ where: { id }, relations: ['employees'] });
    if (!branch) throw new NotFoundException('Branch not found');
    
    if (branch.employees && branch.employees.length > 0) {
      throw new ConflictException(`Cannot delete branch. It has ${branch.employees.length} assigned employees. Please move or remove them first.`);
    }
    await this.branchRepo.delete(id);
  }
}
