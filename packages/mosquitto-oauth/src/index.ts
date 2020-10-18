import express = require('express');
import bodyParser = require('body-parser');
import { AuthService } from './service';

const authService = new AuthService(process.env.TOKEN_ENDPOINT!);

const app = express();
app.use(bodyParser.json());

app.post('/user', (req, res) => authService.userHandler(req, res));
app.post('/superuser', (req, res) => authService.superuserHandler(req, res));
app.post('/acl', (req, res) => authService.aclhandler(req, res));

app.listen(process.env.PORT || 3000);
