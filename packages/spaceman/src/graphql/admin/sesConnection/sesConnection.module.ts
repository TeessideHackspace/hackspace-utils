import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesConnectionEntity } from './sesConnection.entity';
import { SesConnectionResolver } from './sesConnection.resolver';
import { SesConnectionService } from './sesConnection.service';
@Module({
  imports: [TypeOrmModule.forFeature([SesConnectionEntity])],
  providers: [SesConnectionService, SesConnectionResolver],
  exports: [SesConnectionService],
})
export class SesConnectionModule {}
