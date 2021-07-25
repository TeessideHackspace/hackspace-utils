import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { SesConnectionService } from './sesConnection.service';
import { SesConnection } from './sesConnection.model';
import { SetSesConnectionInput } from './setSesConnection.input';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class SesConnectionResolver {
  constructor(private readonly sesService: SesConnectionService) {}

  @Roles('admin')
  @Query((_returns) => SesConnection, { nullable: true })
  sesConnection() {
    return this.sesService.getConnection();
  }

  @Roles('admin')
  @Mutation((_returns) => SesConnection)
  setSesConnection(
    @Args('connection', { type: () => SetSesConnectionInput })
    connection: SetSesConnectionInput,
  ) {
    return this.sesService.setConnection(connection);
  }
}
