import { Module } from '@nestjs/common';
import { GocardlessModule } from '../graphql/gocardless/gocardless.module';
import { GocardlessWebhookController } from './gocardless.webhook';
@Module({
  imports: [GocardlessModule],
  controllers: [GocardlessWebhookController],
  exports: [],
})
export class WebhookModule {}
