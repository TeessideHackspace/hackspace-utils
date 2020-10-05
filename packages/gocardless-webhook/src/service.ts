import { Gocardless } from '@teessidehackspace/gocardless-client';
import { Keycloak, User } from '@teessidehackspace/keycloak-client';
import { Email } from '@teessidehackspace/emails';
import { createHmac } from 'crypto';

const HACKSPACE_OIDC_CLIENT = 'hackspace-api';
const MEMBER_ROLE_NAME = 'member';

export class GocardlessWebhookService {
  private gocardless: Gocardless;
  private keycloak: Keycloak;
  private email: Email;

  constructor(
    keycloakBaseUrl: string,
    keycloakUsername: string,
    keycloakPassword: string,
    gocardlessKey: string,
    gocardlessRedirectUrl: string,
    private gocardlessWebhookSecret: string,
  ) {
    this.gocardless = new Gocardless(gocardlessKey, gocardlessRedirectUrl);
    this.keycloak = new Keycloak(
      keycloakBaseUrl,
      keycloakUsername,
      keycloakPassword,
    );
    this.email = new Email();
  }

  async verifyWebhook(req, res, next) {
    if (
      !req.headers['webhook-signature'] ||
      !this.gocardless.validateWebhook(
        req.headers['webhook-signature'],
        JSON.stringify(req.body, null, 0),
        this.gocardlessWebhookSecret,
      )
    ) {
      res.status(400);
      res.json({ message: '"Webhook-signature" header not set' });
      return null;
    }
    return next();
  }

  async handleWebhook(req, res) {
    for (let event of req.body.events) {
      if (event.resource_type === 'mandates') {
        await this.handleMandateEvent(event);
      } else if (event.resource_type === 'subscriptions') {
        await this.handleSubscriptionEvent(event);
      }
    }
    return res.status(200).end();
  }

  private async handleMandateEvent(event) {
    const customer = await this.gocardless.getCustomerByMandate(
      event.links.mandate,
    );
    const hackspaceId = await this.gocardless.getHackspaceId(customer.id);
    const user = await this.keycloak.getUser(hackspaceId);
    if (event.action === 'cancelled') {
      return this.handleCancelledMembership(user);
    } else if (event.action === 'failed') {
      return this.handleCancelledMembership(user);
    }
  }

  private async handleSubscriptionEvent(event) {
    const customer = await this.gocardless.getCustomerBySubscription(
      event.links.subscription,
    );
    const hackspaceId = await this.gocardless.getHackspaceId(customer.id);
    const user = await this.keycloak.getUser(hackspaceId);
    if (event.action === 'cancelled') {
      return this.handleCancelledMembership(user);
    } else if (event.action === 'created') {
      return this.handleSignup(user);
    }
  }

  private async handleCancelledMembership(user: User): Promise<void> {
    await this.keycloak.deleteClientRole(
      user.id,
      HACKSPACE_OIDC_CLIENT,
      MEMBER_ROLE_NAME,
    );
    return this.email.cancelled(user.email, {
      name: user.firstName,
    });
  }

  private async handleSignup(user: User) {
    await this.keycloak.addClientRole(
      user.id,
      HACKSPACE_OIDC_CLIENT,
      MEMBER_ROLE_NAME,
    );
    return this.email.welcome(user.email, {
      name: user.firstName,
    });
  }
}
