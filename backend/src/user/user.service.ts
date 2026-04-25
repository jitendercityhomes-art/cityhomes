import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { OtpService } from '../otp/otp.service';
import { FileStorageService } from '../file-storage/file-storage.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private otpService: OtpService,
    private fileStorageService: FileStorageService,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'email', 'name', 'phone', 'role', 'profileImage', 'isActive', 'createdAt'],
    });
  }

  async findOne(id: number) {
    console.log(`UserService: findOne called for ID: ${id} (type: ${typeof id})`);
    if (!id || isNaN(id)) {
      console.error(`UserService: Invalid ID provided to findOne: ${id}`);
      throw new NotFoundException('Invalid user ID');
    }
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['department', 'branch'],
    });

    if (!user) {
      console.error(`UserService: User not found for ID: ${id}`);
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async createEmployee(employeeData: Partial<User>, creator?: any) {
    try {
      console.log('createEmployee called with', JSON.stringify(employeeData));
      
      const isSuperAdmin = creator?.role === 'superadmin';

      // Check if email already exists
      const existing = await this.findByEmail(employeeData.email);
      if (existing) {
        throw new ConflictException('Email already registered');
      }

      // Generate employee ID
      const employeeId = await this.generateEmployeeId();

      // Use provided password or generate random
      const password = employeeData.password || this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

const normalizeRole = (value: string) => {
      if (!value) return UserRole.EMPLOYEE;
      const r = String(value).trim().toLowerCase();
      if (['superadmin', 'super admin', 'super-admin', 'super_admin'].includes(r)) return UserRole.SUPERADMIN;
      if (['hr', 'hr manager', 'hr_manager', 'hr-manager', 'admin'].includes(r)) return UserRole.HR;
      if (['employee', 'emp'].includes(r)) return UserRole.EMPLOYEE;
      return UserRole.EMPLOYEE;
    };

    const parseIntSafe = (val: any): number | undefined => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'number') return val;
      const normalized = String(val).trim();
      if (!normalized) return undefined;
      const num = Number(normalized);
      return Number.isNaN(num) ? undefined : num;
    };

    // Prepare data
    const data: Partial<User> = {
      name: (employeeData as any).name,
      email: (employeeData as any).email,
      phone: (employeeData as any).phone,
      designation: (employeeData as any).designation || (employeeData as any).role,
      gender: (employeeData as any).gender,
      address: String((employeeData as any).address || (employeeData as any).loc || '').trim() || undefined,
      basic_salary: isSuperAdmin ? ((employeeData as any).basic_salary ? parseFloat((employeeData as any).basic_salary) : (employeeData as any).basicSalary ? parseFloat((employeeData as any).basicSalary) : 0) : 0,
      date_of_birth: (employeeData as any).date_of_birth ? new Date((employeeData as any).date_of_birth) : (employeeData as any).dateOfBirth ? new Date((employeeData as any).dateOfBirth) : undefined,
      date_of_joining: (employeeData as any).date_of_joining ? new Date((employeeData as any).date_of_joining) : (employeeData as any).dateOfJoining ? new Date((employeeData as any).dateOfJoining) : undefined,
      department_id: parseIntSafe((employeeData as any).department_id || (employeeData as any).departmentId),
      branch_id: parseIntSafe((employeeData as any).branch || (employeeData as any).branch_id || (employeeData as any).branchId),
      employee_id: employeeId || (employeeData as any).employee_id,
      password: hashedPassword,
      role: normalizeRole((employeeData as any).systemRole || (employeeData as any).system_role || (employeeData as any).role),
      isActive: true,
      salary_structure_id: isSuperAdmin ? parseIntSafe((employeeData as any).salary_structure_id || (employeeData as any).salaryStructureId) : null,
    };

    // Handle Image Uploads to Cloudinary for new employee
    if ((employeeData as any).profileImage && (employeeData as any).profileImage.startsWith('data:image')) {
      try {
        data.profileImage = await this.fileStorageService.uploadBase64(
          (employeeData as any).profileImage,
          'profiles',
          `profile-new-${Date.now()}`,
        );
      } catch (err) {
        console.error('Failed to upload profile image to Cloudinary during creation:', err);
      }
    }

    if ((employeeData as any).passbook_photo_url && (employeeData as any).passbook_photo_url.startsWith('data:image')) {
      try {
        data.passbook_photo_url = await this.fileStorageService.uploadBase64(
          (employeeData as any).passbook_photo_url,
          'documents',
          `passbook-new-${Date.now()}`,
        );
      } catch (err) {
        console.error('Failed to upload passbook photo to Cloudinary during creation:', err);
      }
    }

      // Create employee
      const employee = this.usersRepository.create(data);
      const saved = await this.usersRepository.save(employee);
      const created = await this.findOne(saved.id);

      // Return employee with plain password for display
      return {
        ...created,
        password: password, // Return plain password (only on creation)
      };
    } catch (error) {
      console.error('createEmployee failed', error);
      throw error;
    }
  }

  async updateProfile(id: number, data: Partial<User>, creator?: any) {
    console.log(`UserService: updateProfile called for user ${id} with data:`, data);
    
    const isSuperAdmin = creator?.role === 'superadmin';

    const parseIntSafe = (val: any): number | undefined => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'number') return val;
      const normalized = String(val).trim();
      if (!normalized) return undefined;
      const num = Number(normalized);
      return Number.isNaN(num) ? undefined : num;
    };

    const cleanData: Partial<User> = {
      ...data,
      department_id: parseIntSafe((data as any).department_id || (data as any).departmentId),
      branch_id: parseIntSafe((data as any).branch_id || (data as any).branch || (data as any).branchId),
    };

    // Filter out any properties that are not part of the User entity to prevent errors
    const userEntityProperties = [
      'name', 'email', 'phone', 'role', 'designation', 'gender', 'basic_salary',
      'employment_type', 'date_of_birth', 'date_of_joining', 'marital_status',
      'blood_group', 'emergency_contact_name', 'emergency_contact_phone',
      'bank_name', 'bank_account', 'bank_ifsc', 'bank_branch', 'bank_account_holder',
      'upi_id', 'pan_number', 'aadhaar_number',
      'passbook_photo_url', 'uan_number', 'address', 'department_id', 'branch_id',
      'profileImage', 'isActive', 'salary_structure_id'
    ];

    const filteredData: Partial<User> = {};
    for (const key of userEntityProperties) {
      if (cleanData.hasOwnProperty(key) && cleanData[key] !== undefined) {
        // Restriction: Only superadmin can update basic_salary and salary_structure_id
        if ((key === 'basic_salary' || key === 'salary_structure_id') && !isSuperAdmin) {
          continue; // Skip these fields if not superadmin
        }

        // Convert empty strings to null for nullable fields
        if (cleanData[key] === '') {
          filteredData[key] = null;
        } else {
          filteredData[key] = cleanData[key];
        }
      }
    }
    
    console.log(`UserService: updateProfile filtered data for user ${id}:`, filteredData);

    try {
      const user = await this.findOne(id);
      if (!user) throw new NotFoundException(`User with ID ${id} not found`);

      // Handle Image Uploads to Cloudinary
      if (filteredData.profileImage && filteredData.profileImage.startsWith('data:image')) {
        try {
          filteredData.profileImage = await this.fileStorageService.uploadBase64(
            filteredData.profileImage,
            'profiles',
            `profile-${id}-${Date.now()}`,
          );
        } catch (err) {
          console.error('Failed to upload profile image to Cloudinary:', err);
        }
      }

      if (filteredData.passbook_photo_url && filteredData.passbook_photo_url.startsWith('data:image')) {
        try {
          filteredData.passbook_photo_url = await this.fileStorageService.uploadBase64(
            filteredData.passbook_photo_url,
            'documents',
            `passbook-${id}-${Date.now()}`,
          );
        } catch (err) {
          console.error('Failed to upload passbook photo to Cloudinary:', err);
        }
      }

      // Email change flow: Check if OTP was verified for the new email
      if (filteredData.email && filteredData.email !== user.email) {
        const isEmailVerified = await this.otpService.isVerified(id, 'email_change', filteredData.email);
        if (!isEmailVerified) {
          throw new BadRequestException('Email verification required. Please verify OTP sent to the new email.');
        }
      }

      if (Object.keys(filteredData).length > 0) {
        // Merge the filtered data into the existing user entity
        Object.assign(user, filteredData);
        await this.usersRepository.save(user);
        console.log(`UserService: Successfully updated user ${id}`);
      }
      return this.findOne(id);
    } catch (error) {
      console.error(`UserService: updateProfile failed for user ${id}:`, error);
      throw error;
    }
  }

  async deleteEmployee(id: number) {
    return this.usersRepository.delete(id);
  }

  async softDelete(id: number) {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async getEmployeeHolidays(employeeId: number, year: number) {
    // This will call holidays service - implemented via controller
    const employee = await this.findOne(employeeId);
    return { employeeId, departmentId: employee.department_id, year };
  }

  async getEmployeeSalary(employeeId: number) {
    // Get current salary structure for employee
    const employee = await this.findOne(employeeId);
    return { employeeId, salary_structure_id: employee.salary_structure_id };
  }

  async getEmployeeAttendance(employeeId: number, month: number, year: number) {
    // Get attendance records for employee
    return { employeeId, month, year };
  }

  async getNextEmployeeId(): Promise<string> {
    return this.generateEmployeeId();
  }

  private async generateEmployeeId(): Promise<string> {
    // Generate next unique employee id based on existing rows.
    const count = await this.usersRepository.count();
    const nextNum = count + 1;
    return `EMP${String(nextNum).padStart(3, '0')}`;
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async findEmployees(filters?: {
    department_id?: number;
    branch_id?: number;
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    console.log('UserService: findEmployees called with filters:', filters);
    const query = this.usersRepository.createQueryBuilder('user');
    query.leftJoinAndSelect('user.department', 'department');
    query.leftJoinAndSelect('user.branch', 'branch');
    query.where('user.isActive = :isActive', { isActive: true });

    if (filters?.department_id) {
      query.andWhere('user.departmentId = :deptId', { deptId: filters.department_id });
    }

    if (filters?.branch_id) {
      query.andWhere('user.branchId = :branchId', { branchId: filters.branch_id });
    }

    if (filters?.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters?.search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    const page = filters?.page;
    const limit = filters?.limit;
    if (limit != null) {
      const currentPage = page || 1;
      query.skip((currentPage - 1) * limit).take(limit);
    }

    try {
      const employees = await query.getMany();
      return employees;
    } catch (err) {
      console.error('UserService: findEmployees query failed:', err);
      throw err;
    }
  }
}
