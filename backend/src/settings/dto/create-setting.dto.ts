import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { SettingType } from '../entities/setting.entity';

export class CreateSettingDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsOptional()
  @IsEnum(SettingType)
  type?: SettingType;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
