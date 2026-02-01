import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDTO } from 'src/auth/DTOs/register-user.dto';
import { hashPassword } from 'src/helper/functions/hash-password.function';
import { userIdErrorMessage } from 'src/helper/messages/messages.variables';

/**
 * This service is responsible for managing user entities.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private _userRepository: Repository<User>,
  ) {}

  /**
   * This method tries to find User entity based on it's id (UUID).
   *
   * @param userId - Id (UUID) of the desired user.
   * @returns Promise containing user entity or null
   */
  findOne(userId: string): Promise<User | null> {
    return this._userRepository.findOne({
      where: { id: userId },
      relations: { paymentCard: true, reservations: true },
    });
  }

  /**
   * This method tries to find User entity based on it's email.
   *
   * @param userEmail - Email of the desired user.
   * @returns Promise containing user entity or null
   */
  findOneByEmail(userEmail: string): Promise<User | null> {
    return this._userRepository.findOne({
      where: { email: userEmail },
      relations: { paymentCard: true, reservations: true },
    });
  }

  /**
   * This method is used to save updated user entity to update corresponding
   * data in the database.
   *
   * @param user - Updated user entity to be saved.
   * @returns Promise containing saved user entity
   */
  saveUpdatedUser(user: User) {
    return this._userRepository.save(user);
  }

  /**
   * This method is used to create new user entity and save corresponding data
   * to the database.
   *
   * @param registerUserDTO - Validated user data.
   * @returns Promise containing newly created user entity
   */
  async create(registerUserDTO: RegisterUserDTO): Promise<User> {
    const newUser = this._userRepository.create({
      fullName: registerUserDTO.fullName,
      email: registerUserDTO.email,
      passwordHashed: await hashPassword(registerUserDTO.password), // Hash plain text password
    });
    return this._userRepository.save(newUser);
  }

  /**
   * This method is responsible for deleting user entity based on it's id (UUID).
   *
   * @param userId - Id (UUID) of the desired User Entity to be deleted.
   * @returns Promise containing deleted user
   */
  async delete(userId: string): Promise<User> {
    const foundUser = await this.findOne(userId);

    if (foundUser) {
      const deletedUsers = await this._userRepository.remove([foundUser]);
      return deletedUsers[0];
    } else {
      throw new BadRequestException(userIdErrorMessage);
    }
  }
}
