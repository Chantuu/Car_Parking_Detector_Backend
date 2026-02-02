import { LoginUserDTO } from './DTOs/login-user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { comparePassword } from 'src/helper/functions/compare-password.function';
import {
  emailAlreadyExistsErrorMessage,
  userWithEmailPasswordNotExistsErrorMessage,
} from 'src/helper/messages/messages.variables';
import { User } from 'src/users/user.entity';

/**
 * This service is responsible for handling authentication logic.
 */
@Injectable()
export class AuthService {
  constructor(private _usersService: UsersService) {}

  /**
   * This method is responsible for registering user in the application, which uses UserService.
   *
   * @param registerUserDTO - Validated request body containing user data.
   * @returns Newly registered user entity.
   * @throws BadRequestException when another user already has that email
   */
  async register(registerUserDTO: RegisterUserDTO): Promise<User> {
    const userExists = await this._usersService.findOneByEmail(
      registerUserDTO.email,
    );

    if (!userExists) {
      return this._usersService.create(registerUserDTO);
    } else {
      throw new BadRequestException(emailAlreadyExistsErrorMessage);
    }
  }

  /**
   * This method is responsible for signing in user in the application, which uses UsersService.
   *
   * @param loginUserDTO - Validated request body containing user data.
   * @returns Signed in user entity.
   * @throws BadRequestException when login credentials are invalid
   */
  async login(loginUserDTO: LoginUserDTO): Promise<User> {
    const userExists = await this._usersService.findOneByEmail(
      loginUserDTO.email,
    );

    // If user with that email is found and password matches
    if (
      userExists &&
      (await comparePassword(loginUserDTO.password, userExists.passwordHashed))
    ) {
      return userExists;
    } else {
      throw new BadRequestException(userWithEmailPasswordNotExistsErrorMessage);
    }
  }
}
