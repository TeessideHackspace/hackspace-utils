import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { GocardlessResolver } from './gocardless.resolver';
import { GocardlessService } from './gocardless.service';
@Module({
  imports: [AdminModule],
  providers: [GocardlessService, GocardlessResolver],
  exports: [GocardlessService],
})
export class GocardlessModule {}
