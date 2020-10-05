import { MatrixClient } from 'matrix-bot-sdk';
import { Keycloak } from '@teessidehackspace/keycloak-client';

export interface ControlledRoomConfig {
  id: string;
  label: string;
  required_role: string;
  role_client: string;
}
export interface Config {
  room_access: {
    server_name: string;
    default_room: string;
    poll_frequency: number;
    whitelist_users: string[];
    controlled_rooms: ControlledRoomConfig[];
  };
}

export class RoomAccessService {
  private keycloak: Keycloak;

  constructor(
    private config: Config,
    private client: MatrixClient,
    keycloakBaseUrl: string,
    keycloakUsername: string,
    keycloakPassword: string,
  ) {
    this.keycloak = new Keycloak(
      keycloakBaseUrl,
      keycloakUsername,
      keycloakPassword,
    );
  }

  async roomAccessHandler() {
    for (let room of this.config.room_access.controlled_rooms) {
      const roomId = `${room.id}:${this.config.room_access}`;
      const usersInRoom = await this.client.getJoinedRoomMembers(roomId);
      const idsInRoom = usersInRoom.map((x) => x.match(/@(.+?):/)[1]);
      const usersWithPerm = await this.keycloak.getUsersWithRole(
        room.role_client,
        room.required_role,
      );
      const allowedUsers = usersWithPerm.map((x) => x.username);

      this.getUsersToInvite(idsInRoom, allowedUsers).forEach((x) =>
        this.client.inviteUser(x, roomId),
      );
      this.getUsersToKick(idsInRoom, allowedUsers).forEach((x) =>
        this.client.kickUser(x, roomId),
      );
    }
  }

  private getUsersToKick(usersInRoom: string[], usersWithPermission: string[]) {
    return usersInRoom
      .filter((user) => !usersWithPermission.includes(user))
      .filter((user) => !this.config.room_access.whitelist_users.includes(user))
      .filter((user) => !user.startsWith('slack_'))
      .map((user) => `@${user}:${this.config.room_access.server_name}`);
  }

  private getUsersToInvite(
    usersInRoom: string[],
    usersWithPermission: string[],
  ) {
    return usersWithPermission
      .filter((x) => !usersInRoom.includes(x))
      .map((user) => `@${user}:${this.config.room_access.server_name}`);
  }
}
