import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalSettingsEntity } from './globalSettings.entity';
import { GlobalSettings } from './globalSettings.model';
import { GlobalSettingsInput } from './setGlobalSettings.input';

@Injectable()
export class GlobalSettingsService {
  constructor(
    @InjectRepository(GlobalSettingsEntity)
    private sesConnection: Repository<GlobalSettingsEntity>,
  ) {}

  async setGlobalSettings(
    connection: GlobalSettingsInput,
  ): Promise<GlobalSettings> {
    const existing = await this.getGlobalSettings();
    return await this.sesConnection.save({
      ...existing,
      ...connection,
    });
  }

  async getGlobalSettings(): Promise<GlobalSettings | undefined> {
    return this.sesConnection.findOne({});
  }
}
