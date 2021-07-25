import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './graphql/admin/admin.module';
import { AuthModule } from './graphql/auth/auth.module';
import { UsersModule } from './graphql/user/users.module';
import { RawBodyMiddleware } from './webhook/rawBody.middleware';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      bodyParserConfig: false,
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
    AuthModule,
    UsersModule,
    AdminModule,
    WebhookModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware).forRoutes('*');
  }
}
