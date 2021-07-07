import { Module } from '@nestjs/common';
import { GocardlessResolver } from './gocardless.resolver';
import { GocardlessService } from './gocardless.service';
@Module({
  imports: [],
  providers: [GocardlessService, GocardlessResolver],
  exports: [GocardlessService],
})
export class GocardlessModule {}
