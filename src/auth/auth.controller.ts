import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './DTOs/login-user.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDTO: RegisterUserDTO) {
    const result = await this._authService.register(registerUserDTO);
    return {
      success: true,
      message: `Successfully registered user ${result.fullName}`,
    };
  }

  @Post('login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    const result = await this._authService.login(loginUserDTO);
    return {
      success: true,
      message: `Successfully signed in user ${result.fullName}`,
    };
  }
}
