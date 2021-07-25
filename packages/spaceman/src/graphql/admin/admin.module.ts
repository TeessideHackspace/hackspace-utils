import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GocardlessConnectionEntity } from './gocardless/gocardlessConnection.entity';
import { GocardlessConnectionResolver } from './gocardless/gocardlessConnection.resolver';
import { GocardlessConnectionService } from './gocardless/gocardlessConnection.service';
@Module({
  imports: [TypeOrmModule.forFeature([GocardlessConnectionEntity])],
  providers: [GocardlessConnectionService, GocardlessConnectionResolver],
  exports: [GocardlessConnectionService],
})
export class AdminModule {}
