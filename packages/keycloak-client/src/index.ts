import KcAdminClient from 'keycloak-admin';

export interface User {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  attributes?: UserAttributes;
}

export interface UserAttributes {
  nickName?: string | string[];
  gocardless?: string | string[];
}

export class Keycloak {
  private keycloak: KcAdminClient;
  constructor(
    keycloakBaseUrl: string,
    private keycloakUsername: string,
    private keycloakPassword: string,
  ) {
    this.keycloak = new KcAdminClient({
      baseUrl: keycloakBaseUrl,
    });
  }

  private async reauth() {
    return await this.keycloak.auth({
      username: this.keycloakUsername,
      password: this.keycloakPassword,
      grantType: 'password',
      clientId: 'admin-cli',
    });
  }

  async getUser(id: string): Promise<User> {
    await this.reauth();
    return this.keycloak.users.findOne({ id });
  }

  async setUserAttributes(
    id: string,
    attributes: UserAttributes,
  ): Promise<void> {
    await this.reauth();
    const user = await this.keycloak.users.findOne({ id });
    user.attributes = { ...user.attributes, ...attributes };
    return this.keycloak.users.update({ id }, user);
  }

  async deleteClientRole(userId: string, clientId: string, role: string) {
    return this.keycloak.users.delClientRoleMappings(
      await this.getRoleChangeObject(userId, clientId, role),
    );
  }

  async addClientRole(userId: string, clientId: string, role: string) {
    return this.keycloak.users.addClientRoleMappings(
      await this.getRoleChangeObject(userId, clientId, role),
    );
  }

  async getUsersWithRole(clientId: string, roleName: string) {
    await this.reauth();
    const clients = await this.keycloak.clients.find({ clientId });
    return this.keycloak.clients.findUsersWithRole({
      id: clients[0].id!,
      roleName,
    });
  }
  private async getRoleChangeObject(
    id: string,
    clientId: string,
    roleName: string,
  ) {
    await this.reauth();
    const clients = await this.keycloak.clients.find({
      clientId,
    });
    const client = clients[0];
    const role = await this.keycloak.clients.findRole({
      id: client.id!,
      roleName: roleName,
    });
    return {
      id,
      clientUniqueId: clients[0].id!,
      roles: [
        {
          id: role.id!,
          name: roleName,
        },
      ],
    };
  }
}
