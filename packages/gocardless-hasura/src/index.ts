import * as express from 'express';
import * as bodyParser from 'body-parser';
import { GocardlessService } from './service';

const service = new GocardlessService(
  process.env.KEYCLOAK_URL,
  process.env.KEYCLOAK_USERNAME,
  process.env.KEYCLOAK_PASSWORD,
  process.env.GOCARDLESS_KEY,
  process.env.GOCARDLESS_REDIRECT,
);

const app = express();
app.use(bodyParser.json());
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({});
});

app.post('/gocardless_redirect', service.gocardlessRedirect);
app.post('/gocardless_redirect_confirm', service.gocardlessRedirectConfirm);
app.post('/subscribe', service.subscribe);
app.post('/update_subscription', service.updateSubscription);
app.post('/cancel_subscription', service.cancelSubscription);
app.post('/stats', service.stats);
app.post('/get_mandate', service.getMandate);
app.post('/get_subscription', service.getSubscription);

app.listen(process.env.PORT || 3000);
