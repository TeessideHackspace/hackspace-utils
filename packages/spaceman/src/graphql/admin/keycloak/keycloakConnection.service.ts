import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SetKeycloakConnectionInput } from './setKeycloakConnection.input';
import { KeycloakConnection } from './keycloakConnection.model';
import { KeycloakConnectionEntity } from './keycloakConnection.entity';

@Injectable()
export class KeycloakConnectionService {
  constructor(
    @InjectRepository(KeycloakConnectionEntity)
    private keycloakSettings: Repository<KeycloakConnectionEntity>,
  ) {}

  async setConnection(
    input: SetKeycloakConnectionInput,
  ): Promise<KeycloakConnection> {
    const existing = await this.getConnection();
    return await this.keycloakSettings.save({
      ...existing,
      ...input,
    });
  }

  async getConnection(): Promise<KeycloakConnection | undefined> {
    return this.keycloakSettings.findOne({});
  }
}
