import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { GocardlessService } from '../graphql/gocardless/gocardless.service';
import { RequestWithRawBody } from './rawBody.middleware';

@Controller('webhook/gocardless')
export class GocardlessWebhookController {
  constructor(private readonly gocardlessService: GocardlessService) {}

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

    return { success: true };
  }
}
