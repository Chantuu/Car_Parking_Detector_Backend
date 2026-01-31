import { LoginUserDTO } from './DTOs/login-user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { comparePassword } from 'src/helper/functions/compare-password.function';

@Injectable()
export class AuthService {
  constructor(private _usersService: UsersService) {}

  async register(registerUserDTO: RegisterUserDTO) {
    const userExists = await this._usersService.findOneByEmail(
      registerUserDTO.email,
    );

    if (!userExists) {
      return this._usersService.create(registerUserDTO);
    } else {
      throw new BadRequestException(
        'User with that email already exists. Please type new email!',
      );
    }
  }

  async login(loginUserDTO: LoginUserDTO) {
    const userExists = await this._usersService.findOneByEmail(
      loginUserDTO.email,
    );

    if (
      userExists &&
      (await comparePassword(loginUserDTO.password, userExists.passwordHashed))
    ) {
      return userExists;
    } else {
      throw new BadRequestException(
        'User does not exist with that email or password.',
      );
    }
  }
}
