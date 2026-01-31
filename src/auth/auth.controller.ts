import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './DTOs/login-user.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDTO: RegisterUserDTO) {
    return await this._authService.register(registerUserDTO);
  }

  @Post('login')
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return await this._authService.login(loginUserDTO);
  }
}
