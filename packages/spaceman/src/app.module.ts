import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: () => {
        return {
          user: 'foo',
        };
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      autoLoadEntities: true,
      migrationsTableName: 'migration',
      migrations: ['dist/spaceman/src/migration/*.js'],
      migrationsRun: true,
      cli: {
        migrationsDir: 'src/migration',
      },
    }),
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
