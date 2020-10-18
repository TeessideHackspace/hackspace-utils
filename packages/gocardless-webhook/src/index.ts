import express from 'express';
import bodyParser from 'body-parser';
import { GocardlessWebhookService } from './service';

const service = new GocardlessWebhookService(
  process.env.KEYCLOAK_URL!,
  process.env.KEYCLOAK_USERNAME!,
  process.env.KEYCLOAK_PASSWORD!,
  process.env.GOCARDLESS_KEY!,
  process.env.GOCARDLESS_REDIRECT!,
  process.env.GOCARDLESS_WEBHOOK_SECRET!,
);

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  return service.verifyWebhook(req, res, next);
});
app.post('/gocardless_webhook', (req, res) => {
  return service.handleWebhook(req, res);
});
app.listen(process.env.PORT || 3000);

module.exports = app;
