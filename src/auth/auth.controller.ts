import {
  Body,
  Controller,
  Get,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './DTOs/login-user.dto';
import { saveUserToSession } from 'src/helper/functions/save-user-to-session.function';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from 'src/helper/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

/**
 * This controller is responsible for handling authentication routes.
 */
@Controller('api/auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  /**
   * This endpoint is responsible for registering user in the program.
   *
   * @param registerUserDTO - Request Body Validator.
   * @param session - Session Object.
   * @returns Response object with success and message fields.
   */
  @Post('register')
  async register(
    @Body() registerUserDTO: RegisterUserDTO,
    @Session() session: Record<string, any>,
  ): Promise<{ success: boolean; message: string }> {
    const registeredUser = await this._authService.register(registerUserDTO);
    saveUserToSession(registeredUser, session);

    return {
      success: true,
      message: `Successfully registered user ${registeredUser.fullName}`,
    };
  }

  /**
   * This endpoint is responsible for signing in user in the program.
   *
   * @param loginUserDTO - Request Body Validator
   * @param session - Session object.
   * @returns Response object with success and message fields.
   */
  @Post('login')
  async login(
    @Body() loginUserDTO: LoginUserDTO,
    @Session() session: Record<string, any>,
  ): Promise<{ success: boolean; message: string }> {
    const loggedinUser = await this._authService.login(loginUserDTO);
    saveUserToSession(loggedinUser, session);

    return {
      success: true,
      message: `Successfully signed in user ${loggedinUser.fullName}`,
    };
  }

  @Get('currentUser')
  @UseGuards(AuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return {
      status: 'success',
      currentUser: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        money: user.money,
      },
    };
  }

  /**
   * This endpoint is responsible for signing out user from the application.
   * It must be protected by Auth guard.
   *
   * @param session - Session Object.
   * @returns Response object with success and message fields.
   */
  @Get('logout')
  @UseGuards(AuthGuard)
  logout(@Session() session: Record<string, any>) {
    const { fullName } = session.user; // Get name of the current user
    session.user = undefined; // Log out current user

    return {
      success: true,
      message: `Successfully logged out user ${fullName}`,
    };
  }
}
