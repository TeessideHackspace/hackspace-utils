import { Gocardless } from '@teessidehackspace/gocardless-client';
import { Keycloak } from '@teessidehackspace/keycloak-client';
import { Subscription, Mandate } from 'gocardless-nodejs/types/Types';
import { ApolloError } from 'apollo-server-express';

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

  async gocardlessRedirect(user: string) {
    const gocardlessUrl = await this.gocardless.getRedirectUrl(user);
    return { gocardlessUrl };
  }

  async gocardlessRedirectConfirm(user: string, id: string) {
    const redirect = await this.gocardless.confirmRedirect(id, user);
    await this.keycloak.setUserAttributes(user, {
      gocardless: redirect.links.customer,
    });
    await this.gocardless.setHackspaceId(redirect.links.customer, user);
    const mandate = await this.gocardless.getMandateByCustomer(
      redirect.links.customer,
    );
    return this.formatMandate(user, mandate);
  }

  async subscribe(user: string, amount: number) {
    this.validateSubscriptionAmount(amount);
    const gocardlessId = await this.getGocardlessId(user);
    const mandate = await this.gocardless.getMandateByCustomer(gocardlessId);
    if (!mandate) {
      throw new ApolloError('Mandate not found.');
    }
    const subscription = await this.gocardless.subscribe(
      mandate.id,
      amount * 100,
    );
    return this.formatSubscription(user, subscription);
  }

  async updateSubscription(user: string, amount: number) {
    this.validateSubscriptionAmount(amount);
    const gocardlessId = await this.getGocardlessId(user);
    let subscription = await this.gocardless.getSubscriptionByCustomer(
      gocardlessId,
    );
    if (!subscription) {
      throw new ApolloError('Subscription not found.');
    }
    subscription = await this.gocardless.updateSubscriptionAmount(
      subscription.id,
      amount * 100,
    );
    return this.formatSubscription(user, subscription);
  }

  async cancelSubscription(user: string) {
    const gocardlessId = await this.getGocardlessId(user);
    let subscription = await this.gocardless.getSubscriptionByCustomer(
      gocardlessId,
    );
    if (!subscription) {
      throw new ApolloError('Subscription not found.');
    }
    subscription = await this.gocardless.cancel(subscription.id);
    return this.formatSubscription(user, subscription);
  }

  async stats() {
    const subs = await this.gocardless.allSubscriptions();
    const income = subs.reduce((acc, cur) => acc + parseInt(cur.amount, 10), 0);
    const average = Math.floor(income / subs.length) || 0;
    const numLessAverage = subs.filter((x) => parseInt(x.amount, 10) < average)
      .length;
    return {
      income,
      numMembers: subs.length,
      average,
      numLessAverage,
    };
  }

  async getMandate(user: string) {
    const gocardlessId = await this.getGocardlessId(user);
    if (gocardlessId) {
      const mandate = await this.gocardless.getMandateByCustomer(gocardlessId);
      return this.formatMandate(user, mandate);
    } else {
      return {
        user,
        status: 'missing_customer',
      };
    }
  }

  async getSubscription(user: string) {
    const gocardlessId = await this.getGocardlessId(user);
    if (gocardlessId) {
      const subscription = await this.gocardless.getSubscriptionByCustomer(
        gocardlessId,
      );
      return this.formatSubscription(user, subscription);
    } else {
      return {
        user,
        status: 'missing_customer',
      };
    }
  }

  private async getGocardlessId(user: string) {
    const keycloakUser = await this.keycloak.getUser(user);
    if (keycloakUser.attributes.gocardless?.length) {
      return keycloakUser.attributes.gocardless[0];
    }
    return null;
  }

  private formatSubscription(user: string, subscription: Subscription) {
    const amount =
      subscription?.amount && parseInt(subscription.amount, 10) / 100;
    return {
      user,
      id: subscription?.id,
      amount,
      status: subscription?.status || 'missing_subscription',
      createdAt: subscription?.created_at,
    };
  }

  private formatMandate(user: string, mandate: Mandate) {
    return {
      user,
      id: mandate?.id,
      reference: mandate?.reference,
      status: mandate?.status || 'missing_mandate',
      createdAt: mandate?.created_at,
      nextPossibleChargeDate: mandate?.next_possible_charge_date,
    };
  }

  private validateSubscriptionAmount(input: number) {
    if (input < MINIMUM_SUBSCRIPTION_MONTH) {
      throw new ApolloError(
        `Minimum subscription amount is £${MINIMUM_SUBSCRIPTION_MONTH} per month.`,
      );
    } else if (!Number.isInteger(input)) {
      throw new ApolloError(`Subscription amount must be a whole number.`);
    }
  }
}
