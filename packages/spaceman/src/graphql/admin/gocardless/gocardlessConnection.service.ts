import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SetGocardlessConnectionInput } from './setGocardlessConnection.input';
import { GocardlessConnection } from './gocardlessConnection.model';
import { GocardlessConnectionEntity } from './gocardlessConnection.entity';

@Injectable()
export class GocardlessConnectionService {
  constructor(
    @InjectRepository(GocardlessConnectionEntity)
    private gocardlessSettings: Repository<GocardlessConnectionEntity>,
  ) {}

  async setConnection(
    connection: SetGocardlessConnectionInput,
  ): Promise<GocardlessConnection> {
    const existing = await this.getConnection();
    return await this.gocardlessSettings.save({
      ...existing,
      ...connection,
    });
  }

  async getConnection(): Promise<GocardlessConnection | undefined> {
    return this.gocardlessSettings.findOne({});
  }
}
