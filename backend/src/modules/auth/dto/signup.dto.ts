import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
