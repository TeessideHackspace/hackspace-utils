import { Query, Resolver } from '@nestjs/graphql';
import { GocardlessService } from './gocardless.service';
import { GocardlessStats } from './stats.model';

@Resolver()
export class GocardlessResolver {
  constructor(private readonly gocardlessService: GocardlessService) {}

  @Query((_returns) => GocardlessStats)
  stats() {
    return this.gocardlessService.stats();
  }
}
