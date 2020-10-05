import * as crypto from 'crypto';
import { GoCardlessClient } from 'gocardless-nodejs/client';
import { Environments } from 'gocardless-nodejs/constants';
import {
  Customer,
  Subscription,
  Mandate,
  RedirectFlow,
  SubscriptionIntervalUnit,
  SubscriptionStatus,
} from 'gocardless-nodejs';

export class Gocardless {
  private gocardless: GoCardlessClient;
  constructor(gocardlessKey: string, private redirectUrl: string) {
    const gocardlessEnv =
      gocardlessKey.split('_')[0] === 'live'
        ? Environments.Live
        : Environments.Sandbox;
    this.gocardless = new GoCardlessClient(gocardlessKey, gocardlessEnv);
  }

  async getCustomerById(id: string): Promise<Customer> {
    return this.gocardless.customers.find(id);
  }

  async getMandateByCustomer(customer: string): Promise<Mandate> {
    const mandates = await this.gocardless.mandates.list({ customer });
    return mandates[0];
  }

  async getCustomerByMandate(mandateId: string): Promise<Customer> {
    const mandate = await this.gocardless.mandates.find(mandateId);
    return this.getCustomerById(mandate.links.customer);
  }

  async getSubscriptionByCustomer(customer: string): Promise<Subscription> {
    const subscriptions = await this.gocardless.subscriptions.list({
      customer,
    });
    return subscriptions[0];
  }

  async getCustomerBySubscription(subscriptionId: string): Promise<Customer> {
    const subscription = await this.gocardless.subscriptions.find(
      subscriptionId,
    );
    return this.getCustomerByMandate(subscription.links.mandate);
  }

  async updateSubscriptionAmount(
    customer: string,
    amount: number,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionByCustomer(customer);
    return await this.gocardless.subscriptions.update(subscription.id, {
      amount: `${amount}`,
    });
  }

  async getRedirectUrl(token: string): Promise<string> {
    const response = await this.gocardless.redirectFlows.create({
      description: 'Teesside Hackspace Membership',
      session_token: this.hashToken(token),
      success_redirect_url: this.redirectUrl,
      //Bad type definition in gocardless lib
      links: undefined,
    });
    return response.redirect_url;
  }

  async confirmRedirect(id: string, token: string): Promise<RedirectFlow> {
    return this.gocardless.redirectFlows.complete(id, {
      session_token: this.hashToken(token),
    });
  }

  async subscribe(mandate: string, amount: number): Promise<Subscription> {
    return this.gocardless.subscriptions.create({
      amount: `${amount}`,
      currency: 'GBP',
      name: 'Teesside Hackspace Subscription',
      interval_unit: SubscriptionIntervalUnit.Monthly,
      links: {
        mandate,
      },
    });
  }

  async cancel(subscriptionId: string): Promise<Subscription> {
    return this.gocardless.subscriptions.cancel(subscriptionId, {});
  }

  async allSubscriptions(): Promise<Subscription[]> {
    const response = await this.gocardless.subscriptions.list({
      limit: '1000',
      status: [SubscriptionStatus.Active],
    });
    return response.subscriptions;
  }

  async setHackspaceId(
    customerId: string,
    hackspaceId: string,
  ): Promise<Customer> {
    return this.gocardless.customers.update(customerId, {
      metadata: {
        hackspaceId,
      },
    });
  }

  async getHackspaceId(customerId: string): Promise<string> {
    const customer = await this.getCustomerById(customerId);
    return customer.metadata.hackspaceId as string;
  }

  async validateWebhook(sig: string, body: string, secret: string) {
    return (
      crypto.createHmac('sha256', secret).update(body).digest('hex') === sig
    );
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('base64');
  }
}
