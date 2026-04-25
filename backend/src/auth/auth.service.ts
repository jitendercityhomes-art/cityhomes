import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const role = user.role;
    const payload = { email: user.email, sub: user.id, role };
    console.log('AuthService: login successful for user:', user.email, 'ID:', user.id);
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        systemRole: role,
        profileImage: user.profileImage,
        empId: user.id, // For employee panel lookup
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      phone: registerDto.phone,
      role: registerDto.role || UserRole.EMPLOYEE,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.login(savedUser);
  }

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'email', 'name', 'phone', 'role', 'profileImage', 'isActive', 'createdAt'],
    });
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'phone', 'role', 'profileImage', 'isActive', 'createdAt'],
    });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if OTP was verified for password change
    const isVerified = await this.otpService.isVerified(userId, 'password_change');
    if (!isVerified) {
      throw new Error('OTP verification required for password change');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password does not match');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
    return { message: 'Password changed successfully' };
  }
}
