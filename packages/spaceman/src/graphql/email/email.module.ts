import { Module } from '@nestjs/common';
import { GlobalSettingsModule } from '../admin/globalSettings/globalSettings.module';
import { SesConnectionModule } from '../admin/sesConnection/sesConnection.module';
import { EmailService } from './email.service';
@Module({
  imports: [SesConnectionModule, GlobalSettingsModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
