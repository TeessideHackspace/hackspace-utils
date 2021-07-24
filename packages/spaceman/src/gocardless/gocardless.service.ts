import { Injectable } from '@nestjs/common';
import { Gocardless } from '@teessidehackspace/gocardless-client';
import { GocardlessMandate } from './mandate.model';
import { GocardlessStats } from './stats.model';
import { Mandate, Subscription } from 'gocardless-nodejs/types/Types';
import { GocardlessSubscription } from './subscription.model';
import { GocardlessConnectionService } from '../admin/gocardless/gocardlessConnection.service';

@Injectable()
export class GocardlessService {
  constructor(
    private readonly gocardlessConnection: GocardlessConnectionService,
  ) {}

  private async client() {
    const connection = await this.gocardlessConnection.getConnection();
    return new Gocardless(connection!.key, connection!.redirectUri);
  }

  async stats(): Promise<GocardlessStats> {
    try {
      const client = await this.client();
      const subs = await client.allSubscriptions();
      const income = subs.reduce(
        (acc, cur) => acc + parseInt(cur.amount, 10),
        0,
      );
      const average = Math.floor(income / subs.length) || 0;
      const numLessAverage = subs.filter(
        (x) => parseInt(x.amount, 10) < average,
      ).length;
      return {
        income,
        numMembers: subs.length,
        average,
        numLessAverage,
      };
    } catch (e) {
      throw new Error('Failed to connect to GoCardless');
    }
  }

  async getSubscription(gocardlessId?: string) {
    if (!gocardlessId) {
      return undefined;
    }
    const client = await this.client();
    const subscription = await client.getSubscriptionByCustomer(gocardlessId);
    return this.formatSubscription(subscription);
  }

  async getMandate(
    gocardlessId?: string,
  ): Promise<GocardlessMandate | undefined> {
    if (!gocardlessId) {
      return undefined;
    }
    const client = await this.client();
    const mandate = await client.getMandateByCustomer(gocardlessId);
    return this.formatMandate(gocardlessId, mandate);
  }

  private formatSubscription(
    subscription: Subscription,
  ): GocardlessSubscription | undefined {
    return subscription
      ? {
          id: subscription.id,
          amount: parseInt(subscription.amount, 10) / 100,
          status: subscription.status,
          createdAt: subscription.created_at,
        }
      : undefined;
  }
  private formatMandate(
    customerId: string,
    mandate: Mandate,
  ): GocardlessMandate | undefined {
    return mandate
      ? {
          id: mandate.id,
          reference: mandate.reference,
          status: mandate.status,
          createdAt: mandate.created_at,
          nextPossibleChargeDate: mandate.next_possible_charge_date,
          customerId: customerId,
        }
      : undefined;
  }
}
