import { User } from './user.entity';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Module } from '@nestjs/common';
import { GocardlessModule } from '../gocardless/gocardless.module';
import { MandateResolver } from './mandate.resolver';
import { Address } from './address/address.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Address]), GocardlessModule],
  providers: [UsersService, UserResolver, MandateResolver],
})
export class UsersModule {}
