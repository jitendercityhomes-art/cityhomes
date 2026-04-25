import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp } from './entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async generateOtp(userId: number, type: string, targetValue?: string): Promise<string> {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiry

    // Delete any existing unverified OTPs of same type for this user
    await this.otpRepository.delete({ userId, type, isVerified: false });

    const newOtp = this.otpRepository.create({
      userId,
      type,
      otp,
      targetValue,
      expiresAt,
    });

    await this.otpRepository.save(newOtp);
    
    // VERY VISIBLE OTP LOG FOR DEVELOPMENT
    console.log('\n' + '='.repeat(50));
    console.log('       🔐 CITY HOMES OTP VERIFICATION 🔐       ');
    console.log('='.repeat(50));
    console.log(`  TYPE:   ${type.toUpperCase()}`);
    console.log(`  USER ID: ${userId}`);
    console.log(`  TARGET: ${targetValue || 'Registered Email/Phone'}`);
    console.log(`\n  >>> YOUR OTP CODE: ${otp} <<<  `);
    console.log('='.repeat(50) + '\n');
    
    return otp;
  }

  async verifyOtp(userId: number, type: string, otp: string): Promise<Otp> {
    const foundOtp = await this.otpRepository.findOne({
      where: {
        userId,
        type,
        otp,
        isVerified: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!foundOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    foundOtp.isVerified = true;
    return this.otpRepository.save(foundOtp);
  }

  async isVerified(userId: number, type: string, targetValue?: string): Promise<boolean> {
    const where: any = {
      userId,
      type,
      isVerified: true,
    };
    if (targetValue) {
      where.targetValue = targetValue;
    }

    const foundOtp = await this.otpRepository.findOne({
      where,
      order: { updatedAt: 'DESC' },
    });

    if (!foundOtp) return false;

    // Check if verification is still fresh (e.g., within 10 minutes)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
    
    return foundOtp.updatedAt > tenMinutesAgo;
  }
}
