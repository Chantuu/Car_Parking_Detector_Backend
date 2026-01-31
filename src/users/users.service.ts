import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDTO } from 'src/auth/DTOs/register-user.dto';
import { hashPassword } from 'src/helper/functions/hash-password.function';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private _userRepository: Repository<User>,
  ) {}

  findOne(userId: string) {
    return this._userRepository.findOne({ where: { id: userId } });
  }

  findOneByEmail(userEmail: string) {
    return this._userRepository.findOne({ where: { email: userEmail } });
  }

  async create(registerUserDTO: RegisterUserDTO) {
    const newUser = this._userRepository.create({
      fullName: registerUserDTO.fullName,
      email: registerUserDTO.email,
      passwordHashed: await hashPassword(registerUserDTO.password),
    });
    return this._userRepository.save(newUser);
  }

  async delete(userId: string) {
    const foundUser = await this.findOne(userId);

    if (foundUser) {
      return this._userRepository.remove([foundUser]);
    } else {
      throw new BadRequestException(
        'No user was found with that id. Please input correct id!',
      );
    }
  }
}
