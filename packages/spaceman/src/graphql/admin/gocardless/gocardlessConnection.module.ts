import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GocardlessConnectionEntity } from './gocardlessConnection.entity';
import { GocardlessConnectionResolver } from './gocardlessConnection.resolver';
import { GocardlessConnectionService } from './gocardlessConnection.service';
@Module({
  imports: [TypeOrmModule.forFeature([GocardlessConnectionEntity])],
  providers: [GocardlessConnectionService, GocardlessConnectionResolver],
  exports: [GocardlessConnectionService],
})
export class GocardlessConnectionModule {}
