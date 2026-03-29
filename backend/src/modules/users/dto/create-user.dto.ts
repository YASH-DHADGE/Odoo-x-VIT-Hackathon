import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsBoolean()
  @IsOptional()
  isManagerApprover?: boolean;
}
