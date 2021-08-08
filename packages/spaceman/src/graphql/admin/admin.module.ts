import { Module } from '@nestjs/common';
import { GlobalSettingsModule } from './globalSettings/globalSettings.module';
import { GocardlessConnectionModule } from './gocardless/gocardlessConnection.module';
import { SesConnectionModule } from './sesConnection/sesConnection.module';
@Module({
  imports: [
    GocardlessConnectionModule,
    SesConnectionModule,
    GlobalSettingsModule,
  ],
  providers: [],
  exports: [
    GocardlessConnectionModule,
    SesConnectionModule,
    GlobalSettingsModule,
  ],
})
export class AdminModule {}
