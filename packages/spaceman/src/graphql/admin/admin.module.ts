import { Module } from '@nestjs/common';
import { GlobalSettingsModule } from './globalSettings/globalSettings.module';
import { KeycloakConnectionModule } from './keycloak/keycloakConnection.module';
import { GocardlessConnectionModule } from './gocardless/gocardlessConnection.module';
import { SesConnectionModule } from './sesConnection/sesConnection.module';
@Module({
  imports: [
    GocardlessConnectionModule,
    KeycloakConnectionModule,
    SesConnectionModule,
    GlobalSettingsModule,
  ],
  providers: [],
  exports: [
    GocardlessConnectionModule,
    KeycloakConnectionModule,
    SesConnectionModule,
    GlobalSettingsModule,
  ],
})
export class AdminModule {}
