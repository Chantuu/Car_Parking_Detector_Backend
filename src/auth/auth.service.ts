import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDTO } from './DTOs/register-user.dto';

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
}
