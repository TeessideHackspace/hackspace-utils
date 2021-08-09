import { Module } from '@nestjs/common';
import { KeycloakModule } from '../graphql/keycloak/keycloak.module';
import { GocardlessModule } from '../graphql/gocardless/gocardless.module';
import { GocardlessWebhookController } from './gocardless.webhook';
import { UsersModule } from '../graphql/user/users.module';
import { EmailModule } from '../graphql/email/email.module';
@Module({
  imports: [GocardlessModule, KeycloakModule, UsersModule, EmailModule],
  controllers: [GocardlessWebhookController],
  exports: [],
})
export class WebhookModule {}
