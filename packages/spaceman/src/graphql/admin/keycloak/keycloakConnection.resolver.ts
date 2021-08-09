import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { SetKeycloakConnectionInput } from './setKeycloakConnection.input';
import { KeycloakConnection } from './keycloakConnection.model';
import { KeycloakConnectionService } from './keycloakConnection.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class KeycloakConnectionResolver {
  constructor(private readonly keycloakService: KeycloakConnectionService) {}

  @Roles('admin')
  @Query((_returns) => KeycloakConnection, { nullable: true })
  keycloakConnection() {
    return this.keycloakService.getConnection();
  }

  @Roles('admin')
  @Mutation((_returns) => KeycloakConnection)
  setKeycloakConnection(
    @Args('input', { type: () => SetKeycloakConnectionInput })
    connection: SetKeycloakConnectionInput,
  ) {
    return this.keycloakService.setConnection(connection);
  }
}
