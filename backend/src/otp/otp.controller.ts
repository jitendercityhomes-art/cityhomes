import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('otp')
@UseGuards(JwtAuthGuard)
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('send')
  async sendOtp(@Request() req, @Body() body: { type: string; targetValue?: string }) {
    if (!body.type) {
      throw new BadRequestException('OTP type is required');
    }
    
    await this.otpService.generateOtp(req.user.userId, body.type, body.targetValue);
    return { message: 'OTP sent successfully' };
  }

  @Post('verify')
  async verifyOtp(@Request() req, @Body() body: { type: string; otp: string }) {
    if (!body.type || !body.otp) {
      throw new BadRequestException('Type and OTP are required');
    }

    await this.otpService.verifyOtp(req.user.userId, body.type, body.otp);
    return { message: 'OTP verified successfully' };
  }
}
