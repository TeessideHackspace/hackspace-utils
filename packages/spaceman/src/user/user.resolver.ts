import { UsersService } from './users.service';
import { User } from './user.model';
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((_returns) => User)
  me() {
    this.usersService.findOne('1');
  }
}
