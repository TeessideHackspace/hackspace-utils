import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GocardlessMandate } from '../gocardless/mandate.model';
import { GocardlessService } from '../gocardless/gocardless.service';

@Resolver(() => GocardlessMandate)
export class MandateResolver {
  constructor(private readonly gocardlessService: GocardlessService) {}

  @ResolveField()
  async subscription(@Parent() mandate: GocardlessMandate) {
    return this.gocardlessService.getSubscription(mandate.customerId);
  }
}
