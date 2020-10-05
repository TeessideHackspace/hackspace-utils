import * as express from 'express';
import * as bodyParser from 'body-parser';
import { AuthService } from './service';

const PORT = process.env.PORT || 3000;
const TOKEN_ENDPOINT = process.env.TOKEN_ENDPOINT;

const authService = new AuthService(TOKEN_ENDPOINT);

const app = express();
app.use(bodyParser.json());

app.post('/user', authService.userHandler);
app.post('/superuser', authService.superuserHandler);
app.post('/acl', authService.aclhandler);

app.listen(PORT);
