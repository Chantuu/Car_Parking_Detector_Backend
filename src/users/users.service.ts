import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private _userRepository: Repository<User>,
  ) {}

  findOne(userId: string) {
    return this._userRepository.findOne({ where: { id: userId } });
  }

  create(user: User) {
    const newUser = this._userRepository.create(user);
    return this._userRepository.save(newUser);
  }

  async delete(userId: string) {
    const foundUser = await this.findOne(userId);

    if (foundUser) {
      return this._userRepository.remove([foundUser]);
    } else {
      throw new Error(
        'No user was found with that id. Please input correct id!',
      );
    }
  }
}
