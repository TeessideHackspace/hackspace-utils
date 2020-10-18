import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  LogLevel,
  LogService,
} from 'matrix-bot-sdk';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { RoomAccessService, Config } from './room_access';

LogService.setLevel(LogLevel.INFO);

const storage = new SimpleFsStorageProvider('/data/spacebot.json');
const client = new MatrixClient(
  process.env.MATRIX_HOMESERVER!,
  process.env.SPACEBOT_TOKEN!,
  storage,
);
AutojoinRoomsMixin.setupOnClient(client);

const config: Config = safeLoad(
  readFileSync('/config/config.yml', 'utf8'),
) as Config;
const roomService = new RoomAccessService(
  config,
  client,
  process.env.KEYCLOAK_URL!,
  process.env.KEYCLOAK_USERNAME!,
  process.env.KEYCLOAK_PASSWORD!,
);

setInterval(async () => {
  await roomService.roomAccessHandler();
}, config.room_access.poll_frequency);

client.start().then(() => console.log('Client started!'));
