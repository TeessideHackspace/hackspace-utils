import { Module } from '@nestjs/common';
import { GocardlessConnectionModule } from './gocardless/gocardlessConnection.module';
import { SesConnectionModule } from './sesConnection/sesConnection.module';
@Module({
  imports: [GocardlessConnectionModule, SesConnectionModule],
  providers: [],
  exports: [GocardlessConnectionModule, SesConnectionModule],
})
export class AdminModule {}
