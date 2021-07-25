import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesConnectionEntity } from './sesConnection.entity';
import { SesConnection } from './sesConnection.model';
import { SetSesConnectionInput } from './setSesConnection.input';

@Injectable()
export class SesConnectionService {
  constructor(
    @InjectRepository(SesConnectionEntity)
    private sesConnection: Repository<SesConnectionEntity>,
  ) {}

  async setConnection(
    connection: SetSesConnectionInput,
  ): Promise<SesConnection> {
    const existing = await this.getConnection();
    return await this.sesConnection.save({
      ...existing,
      ...connection,
    });
  }

  async getConnection(): Promise<SesConnection | undefined> {
    return this.sesConnection.findOne({});
  }
}
