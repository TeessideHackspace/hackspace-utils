import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address/address.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUserBySub(sub: string): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { sub },
      relations: ['address'],
    });
    if (!user) {
      const newUser = this.usersRepository.create({
        sub,
      });
      user = await this.usersRepository.save(newUser);
    }
    return user;
  }

  async getUserByGocardlessId(gocardlessId: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({
      where: { gocardlessId },
    });
  }

  async updateUserBySub(sub: string, user: Partial<User>): Promise<User> {
    const result = await this.getUserBySub(sub);
    return this.usersRepository.save({ ...result, ...user });
  }

  async updateUserAddress(sub: string, address: Partial<Address>) {
    let user = await this.getUserBySub(sub);
    user.address = await this.addressRepository.save({
      ...(user.address || new Address()),
      ...address,
    });
    return this.usersRepository.save(user);
  }
}
