import { User } from './user.entity';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Module } from '@nestjs/common';
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserResolver],
})
export class UsersModule {}
