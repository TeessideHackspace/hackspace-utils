import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { SetGocardlessConnectionInput } from './setGocardlessConnection.input';
import { GocardlessConnection } from './gocardlessConnection.model';
import { GocardlessConnectionService } from './gocardlessConnection.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class GocardlessConnectionResolver {
  constructor(
    private readonly gocardlessService: GocardlessConnectionService,
  ) {}

  @Roles('admin')
  @Query((_returns) => GocardlessConnection, { nullable: true })
  gocardlessConnection() {
    return this.gocardlessService.getConnection();
  }

  @Roles('admin')
  @Mutation((_returns) => GocardlessConnection)
  setGocardlessConnection(
    @Args('connection', { type: () => SetGocardlessConnectionInput })
    connection: SetGocardlessConnectionInput,
  ) {
    return this.gocardlessService.setConnection(connection);
  }
}
