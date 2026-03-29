import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsBoolean()
  @IsOptional()
  isManagerApprover?: boolean;
}
