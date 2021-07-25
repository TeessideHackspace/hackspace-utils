import { Module } from '@nestjs/common';
import { GocardlessConnectionModule } from '../admin/gocardless/gocardlessConnection.module';
import { GocardlessResolver } from './gocardless.resolver';
import { GocardlessService } from './gocardless.service';
@Module({
  imports: [GocardlessConnectionModule],
  providers: [GocardlessService, GocardlessResolver],
  exports: [GocardlessService],
})
export class GocardlessModule {}
