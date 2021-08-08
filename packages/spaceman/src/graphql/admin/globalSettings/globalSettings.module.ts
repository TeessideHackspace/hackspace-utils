import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalSettingsEntity } from './globalSettings.entity';
import { GlobalSettingsResolver } from './globalSettings.resolver';
import { GlobalSettingsService } from './globalSettings.service';
@Module({
  imports: [TypeOrmModule.forFeature([GlobalSettingsEntity])],
  providers: [GlobalSettingsService, GlobalSettingsResolver],
  exports: [GlobalSettingsService],
})
export class GlobalSettingsModule {}
