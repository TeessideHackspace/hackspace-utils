import express = require('express');
import bodyParser = require('body-parser');
import { GocardlessWebhookService } from './service';

const service = new GocardlessWebhookService(
  process.env.KEYCLOAK_URL,
  process.env.KEYCLOAK_USERNAME,
  process.env.KEYCLOAK_PASSWORD,
  process.env.GOCARDLESS_KEY,
  process.env.GOCARDLESS_REDIRECT,
  process.env.GOCARDLESS_WEBHOOK_SECRET,
);

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  return service.verifyWebhook(req, res, next);
});
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({});
});
app.post('/gocardless_webhook', service.handleWebhook);
app.listen(process.env.PORT || 3000);
