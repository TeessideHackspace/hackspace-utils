import * as jwt from 'jsonwebtoken';
import { Gocardless } from '@teessidehackspace/gocardless-client';
import { Keycloak } from '@teessidehackspace/keycloak-client';

const MINIMUM_SUBSCRIPTION_MONTH = 5;

export class GocardlessService {
  private gocardless: Gocardless;
  private keycloak: Keycloak;

  constructor(
    keycloakBaseUrl: string,
    keycloakUsername: string,
    keycloakPassword: string,
    gocardlessKey: string,
    gocardlessRedirectUrl: string,
  ) {
    this.gocardless = new Gocardless(gocardlessKey, gocardlessRedirectUrl);
    this.keycloak = new Keycloak(
      keycloakBaseUrl,
      keycloakUsername,
      keycloakPassword,
    );
  }

  async gocardlessRedirect(req, res) {
    const gocardless_url = await this.gocardless.getRedirectUrl(
      req.headers.authorization,
    );
    return res.json({ gocardless_url });
  }

  async gocardlessRedirectConfirm(req, res) {
    const id = req.body.input.redirect_flow_id;
    const redirect = await this.gocardless.confirmRedirect(
      id,
      req.headers.authorization,
    );
    const userId = this.getUserFromToken(req.headers.authorization);
    await this.keycloak.setUserAttributes(userId, {
      gocardless: redirect.links.customer,
    });
    await this.gocardless.setHackspaceId(redirect.links.customer, userId);
    return res.json({ id });
  }

  async subscribe(req, res) {
    const amountError = this.validateSubscriptionAmount(
      req.body.input.subscription_amount,
    );
    if (amountError) {
      return res.status(500).json({
        message: amountError,
      });
    }

    const user = await this.keycloak.getUser(
      this.getUserFromToken(req.headers.authorization),
    );
    const mandate = await this.gocardless.getMandateByCustomer(
      user.attributes.gocardless,
    );
    if (mandate) {
      const subscription = await this.gocardless.subscribe(
        mandate.id,
        req.body.input.subscription_amount * 100,
      );
      return res.json({
        id: subscription.id,
      });
    } else {
      res.status(500).json({ message: `Mandate not found.` });
    }
  }

  async updateSubscription(req, res) {
    const amountError = this.validateSubscriptionAmount(
      req.body.input.subscription_amount,
    );
    if (amountError) {
      return res.status(500).json({
        message: amountError,
      });
    }
    const user = await this.keycloak.getUser(
      this.getUserFromToken(req.headers.authorization),
    );
    const subscription = await this.gocardless.getSubscriptionByCustomer(
      user.attributes.gocardless,
    );

    if (subscription) {
      await this.gocardless.updateSubscriptionAmount(
        subscription.id,
        req.body.input.subscription_amount * 100,
      );
      return res.json({
        id: subscription.id,
      });
    } else {
      res.status(500).json({ message: `Subscription not found.` });
    }
  }

  async cancelSubscription(req, res) {
    const user = await this.keycloak.getUser(
      this.getUserFromToken(req.headers.authorization),
    );
    const subscription = await this.gocardless.getSubscriptionByCustomer(
      user.attributes.gocardless,
    );
    if (subscription) {
      await this.gocardless.cancel(subscription.id);
      return res.json({
        id: subscription.id,
      });
    } else {
      res.status(500).json({ message: `Subscription not found.` });
    }
  }

  async stats(req, res) {
    const subs = await this.gocardless.allSubscriptions();
    const income = subs.reduce((acc, cur) => acc + parseInt(cur.amount, 10), 0);
    const average = Math.floor(income / subs.length) || 0;
    const num_less_average = subs.filter(
      (x) => parseInt(x.amount, 10) < average,
    ).length;
    const response = {
      income: income,
      num_members: subs.length,
      average: average,
      num_less_average: num_less_average,
    };
    res.status(200).json(response);
  }

  async getMandate(req, res) {
    const user = this.getUserFromToken(req.headers.authorization);
    const keycloakUser = await this.keycloak.getUser(user);
    if (keycloakUser.attributes.gocardless) {
      const mandate = await this.gocardless.getMandateByCustomer(
        keycloakUser.attributes.gocardless,
      );
      if (mandate) {
        res.status(200).json({
          user,
          id: mandate.id,
          reference: mandate.reference,
          status: mandate.status,
          created_at: mandate.created_at,
          next_possible_charge_date: mandate.next_possible_charge_date,
        });
      } else {
        res.status(200).json({
          user,
          status: 'missing_mandate',
        });
      }
    } else {
      res.status(200).json({
        user,
        status: 'missing_customer',
      });
    }
  }

  async getSubscription(req, res) {
    const user = this.getUserFromToken(req.headers.authorization);
    const keycloakUser = await this.keycloak.getUser(user);
    if (keycloakUser.attributes.gocardless) {
      const subscription = await this.gocardless.getSubscriptionByCustomer(
        keycloakUser.attributes.gocardless,
      );
      if (subscription) {
        res.status(200).json({
          user,
          id: subscription.id,
          amount: parseInt(subscription.amount, 10) / 100,
          status: subscription.status,
          created_at: subscription.created_at,
        });
      } else {
        res.status(200).json({
          user,
          status: 'missing_subscription',
        });
      }
    } else {
      res.status(200).json({
        user,
        status: 'missing_customer',
      });
    }
  }

  private getUserFromToken(header: string) {
    return jwt.decode(header.split(' ')[1]).sub;
  }

  private validateSubscriptionAmount(input: number) {
    if (input < MINIMUM_SUBSCRIPTION_MONTH) {
      return `Minimum subscription amount is £${MINIMUM_SUBSCRIPTION_MONTH} per month.`;
    } else if (!Number.isInteger(input)) {
      return `Subscription amount must be a whole number.`;
    }
  }
}
