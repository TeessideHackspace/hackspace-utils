import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { Event } from '@teessidehackspace/gocardless-client';
import { EmailService } from '../graphql/email/email.service';
import { CancelledEmail } from '../graphql/email/emails/cancelled.email';
import { WelcomeEmail } from '../graphql/email/emails/welcome.email';
import { KeycloakService } from '../graphql/keycloak/keycloak.service';
import { User } from '../graphql/user/user.entity';
import { UsersService } from '../graphql/user/users.service';
import { GocardlessService } from '../graphql/gocardless/gocardless.service';
import { RequestWithRawBody } from './rawBody.middleware';

@Controller('webhook/gocardless')
export class GocardlessWebhookController {
  constructor(
    private readonly gocardlessService: GocardlessService,
    private readonly keycloakService: KeycloakService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Headers('webhook-signature') signature: string,
    @Req() request: RequestWithRawBody,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing webhook-signature header');
    }

    const isValid = await this.gocardlessService.validateWebhook(
      request.rawBody.toString('utf8'),
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Webhook signature invalid');
    }

    for (let event of request.body.events as Event[]) {
      if (event.resource_type === 'mandates') {
        await this.handleMandateEvent(event);
      } else if (event.resource_type === 'subscriptions') {
        await this.handleSubscriptionEvent(event);
      }
    }
    return { success: true };
  }

  private async handleMandateEvent(event: Event) {
    const mandate = await this.gocardlessService.getMandateById(
      event.links.mandate,
    );
    const user = await this.usersService.getUserByGocardlessId(
      mandate!.customerId!,
    );
    if (!user) {
      throw new Error(
        `User with gocardless ID ${mandate!
          .customerId!} was not found in the database`,
      );
    }
    if (event.action === 'cancelled') {
      return this.handleCancelledMembership(user);
    } else if (event.action === 'failed') {
      return this.handleCancelledMembership(user);
    }
  }

  private async handleSubscriptionEvent(event: Event) {
    const customer = await this.gocardlessService.getCustomerBySubscription(
      event.links.subscription,
    );
    const user = await this.usersService.getUserByGocardlessId(customer.id);
    if (!user) {
      throw new Error(
        `User with gocardless ID ${customer.id} was not found in the database`,
      );
    }
    if (event.action === 'cancelled') {
      return this.handleCancelledMembership(user);
    } else if (event.action === 'created') {
      return this.handleSignup(user);
    }
  }

  private async handleCancelledMembership(user: User): Promise<void> {
    const keycloakUser = await this.keycloakService.getUser(user.sub);
    if (!keycloakUser) {
      throw new Error(`User ${user.sub} was not found in keycloak`);
    }
    await this.keycloakService.removeRolesFromUser(user.sub, ['member']);

    return this.emailService.sendEmail(
      new CancelledEmail({
        name: user?.nickname || keycloakUser!.firstName,
        recipient: keycloakUser.email,
      }),
    );
  }

  private async handleSignup(user: User) {
    const keycloakUser = await this.keycloakService.getUser(user.sub);
    if (!keycloakUser) {
      throw new Error(`User ${user.sub} was not found in keycloak`);
    }
    await this.keycloakService.addRolesToUser(user.sub, ['member']);

    return this.emailService.sendEmail(
      new WelcomeEmail({
        name: user?.nickname || keycloakUser!.firstName,
        recipient: keycloakUser.email,
      }),
    );
  }
}
