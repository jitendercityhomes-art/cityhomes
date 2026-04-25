import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reimbursement } from './entities/reimbursement.entity';
import { FileStorageService } from '../file-storage/file-storage.service';
import { PayrollService } from '../payroll/payroll.service';

@Injectable()
export class ReimbursementsService {
  constructor(
    @InjectRepository(Reimbursement)
    private reimbursementRepository: Repository<Reimbursement>,
    private fileStorageService: FileStorageService,
    private payrollService: PayrollService,
  ) {}

  async create(data: any, employeeId: number) {
    let receiptUrl = data.receipt_url;

    if (receiptUrl && receiptUrl.startsWith('data:image')) {
      try {
        receiptUrl = await this.fileStorageService.uploadBase64(
          receiptUrl,
          'reimbursements',
          `receipt-${employeeId}-${Date.now()}`,
        );
      } catch (err) {
        console.error('Failed to upload reimbursement receipt to Cloudinary:', err);
      }
    }

    const reimbursement = this.reimbursementRepository.create({
      ...data,
      description: data.description || data.title,
      receipt_url: receiptUrl,
      employee_id: employeeId,
      status: 'pending',
    });
    return this.reimbursementRepository.save(reimbursement);
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    const results = await this.reimbursementRepository.find({
      where,
      relations: ['employee'],
      order: { created_at: 'DESC' },
    });
    return results.map(r => ({
      ...r,
      title: r.description || r.category,
      date: r.date || (r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : null),
      submitted_date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : null,
      receipt: r.receipt_url
    }));
  }

  async findByEmployee(employeeId: number) {
    const results = await this.reimbursementRepository.find({
      where: { employee_id: employeeId },
      order: { created_at: 'DESC' },
    });
    return results.map(r => ({
      ...r,
      title: r.description || r.category,
      date: r.date || (r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : null),
      submitted_date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : null,
      receipt: r.receipt_url
    }));
  }

  async findOne(id: number) {
    const reimbursement = await this.reimbursementRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!reimbursement) {
      throw new NotFoundException('Reimbursement not found');
    }
    return reimbursement;
  }

  async approve(id: number, approvedBy: number) {
    const reimbursement = await this.findOne(id);
    reimbursement.status = 'approved';
    reimbursement.approved_by = approvedBy;
    const saved = await this.reimbursementRepository.save(reimbursement);
    
    // Trigger payroll update
    try {
      await this.payrollService.syncEmployeePayrollByDate(reimbursement.employee_id, reimbursement.date, approvedBy);
    } catch (err) {
      console.error('Failed to sync payroll after reimbursement approval:', err);
    }
    
    return saved;
  }

  async reject(id: number, approvedBy: number) {
    const reimbursement = await this.findOne(id);
    const wasApproved = reimbursement.status === 'approved';
    reimbursement.status = 'rejected';
    reimbursement.approved_by = approvedBy;
    const saved = await this.reimbursementRepository.save(reimbursement);
    
    if (wasApproved) {
      try {
        await this.payrollService.syncEmployeePayrollByDate(reimbursement.employee_id, reimbursement.date, approvedBy);
      } catch (err) {
        console.error('Failed to sync payroll after reimbursement rejection:', err);
      }
    }
    
    return saved;
  }

  async remove(id: number, employeeId: number) {
    const reimbursement = await this.reimbursementRepository.findOne({
      where: { id, employee_id: employeeId },
    });
    if (!reimbursement) {
      throw new NotFoundException('Reimbursement not found or unauthorized');
    }
    if (reimbursement.status !== 'pending') {
      throw new Error('Only pending reimbursements can be deleted');
    }
    return this.reimbursementRepository.remove(reimbursement);
  }

  async getApprovedTotalForMonth(employeeId: string, month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const query = this.reimbursementRepository.createQueryBuilder('reimbursement');
    query.where('reimbursement.employee_id = :employeeId', { employeeId });
    query.andWhere('reimbursement.status = :status', { status: 'approved' });
    query.andWhere('reimbursement.date >= :startDate', { startDate });
    query.andWhere('reimbursement.date <= :endDate', { endDate });

    const result = await query.select('SUM(reimbursement.amount)', 'total').getRawOne();
    return Number(result.total) || 0;
  }
}
