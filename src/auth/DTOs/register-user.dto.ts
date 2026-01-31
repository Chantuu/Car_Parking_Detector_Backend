import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterUserDTO {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
