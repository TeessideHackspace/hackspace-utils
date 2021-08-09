import { Module } from '@nestjs/common';
import { KeycloakConnectionModule } from '../admin/keycloak/keycloakConnection.module';
import { KeycloakService } from './keycloak.service';
@Module({
  imports: [KeycloakConnectionModule],
  providers: [KeycloakService],
  exports: [KeycloakService],
})
export class KeycloakModule {}
