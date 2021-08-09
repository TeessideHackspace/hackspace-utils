import { Injectable } from '@nestjs/common';
import { KeycloakConnectionService } from '../admin/keycloak/keycloakConnection.service';
import KcAdminClient from 'keycloak-admin';

export interface KeycloakUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class KeycloakService {
  constructor(private readonly keycloakConnection: KeycloakConnectionService) {}

  private async client() {
    const connection = await this.keycloakConnection.getConnection();
    if (!connection) {
      throw new Error('Keycloak is not configured');
    }
    const keycloak = new KcAdminClient({
      baseUrl: connection!.keycloakBaseUrl,
    });
    await keycloak.auth({
      username: connection!.keycloakAdminUsername,
      password: connection!.keycloakAdminPassword,
      grantType: 'password',
      clientId: 'admin-cli',
    });
    return keycloak;
  }

  async getUser(sub: string): Promise<KeycloakUser | undefined> {
    const client = await this.client();
    const user = await client.users.findOne({ id: sub });
    return {
      id: user.id!,
      username: user.username!,
      email: user.email!,
      firstName: user.firstName!,
      lastName: user.lastName!,
    };
  }

  async addRolesToUser(id: string, roles: string[]) {
    const client = await this.client();
    return client.users.addRealmRoleMappings({
      id,
      roles: await this.roleNamesToPayload(roles),
    });
  }

  async removeRolesFromUser(id: string, roles: string[]) {
    const client = await this.client();
    return client.users.delRealmRoleMappings({
      id,
      roles: await this.roleNamesToPayload(roles),
    });
  }

  private async roleNamesToPayload(roles: string[]) {
    const client = await this.client();
    const rolePromises = roles.map((name) =>
      client.roles.findOneByName({ name }),
    );
    const roleResults = await Promise.all(rolePromises);
    return roleResults.map((x) => {
      return {
        id: x.id!,
        name: x.name!,
      };
    });
  }
}
