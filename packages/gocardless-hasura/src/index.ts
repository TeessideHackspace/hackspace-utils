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

app.post('/gocardless_redirect', service.gocardlessRedirect.bind(service));
app.post(
  '/gocardless_redirect_confirm',
  service.gocardlessRedirectConfirm.bind(service),
);
app.post('/subscribe', service.subscribe.bind(service));
app.post('/update_subscription', service.updateSubscription.bind(service));
app.post('/cancel_subscription', service.cancelSubscription.bind(service));
app.post('/stats', service.stats.bind(service));
app.post('/get_mandate', service.getMandate.bind(service));
app.post('/get_subscription', service.getSubscription.bind(service));

app.listen(process.env.PORT || 3000);
