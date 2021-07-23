import { UsersService } from './users.service';
import { User } from './user.model';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GocardlessService } from '../gocardless/gocardless.service';
import { Sub } from '../decorators/sub.decorator';
import { SetAddressInput } from './dto/setAddress.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly gocardlessService: GocardlessService,
  ) {}

  @Query((_returns) => User)
  me(@Sub() sub: string) {
    return this.usersService.getUserBySub(sub);
  }

  @Roles('admin')
  @Query((_returns) => [User])
  users(@Sub() _sub: string) {
    return [];
  }

  @Mutation((_returns) => User)
  setNickname(
    @Sub() sub: string,
    @Args('nickname', { type: () => String, nullable: true }) nickname?: string,
  ) {
    return this.usersService.updateUserBySub(sub, { nickname });
  }

  @Mutation((_returns) => User)
  setAddress(
    @Sub() sub: string,
    @Args('address', { type: () => SetAddressInput }) address: SetAddressInput,
  ) {
    return this.usersService.updateUserAddress(sub, address);
  }

  @ResolveField()
  async mandate(@Parent() user: User) {
    return this.gocardlessService.getMandate(user.gocardlessId);
  }
}
