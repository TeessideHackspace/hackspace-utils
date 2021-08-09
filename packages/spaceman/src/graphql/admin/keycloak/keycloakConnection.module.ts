import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectionEntity } from './keycloakConnection.entity';
import { KeycloakConnectionResolver } from './keycloakConnection.resolver';
import { KeycloakConnectionService } from './keycloakConnection.service';
@Module({
  imports: [TypeOrmModule.forFeature([KeycloakConnectionEntity])],
  providers: [KeycloakConnectionService, KeycloakConnectionResolver],
  exports: [KeycloakConnectionService],
})
export class KeycloakConnectionModule {}
