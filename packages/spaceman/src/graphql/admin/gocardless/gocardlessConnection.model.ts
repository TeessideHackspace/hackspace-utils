import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GocardlessConnection {
  @Field((_type) => String)
  key!: string;

  @Field((_type) => String)
  redirectUri!: string;

  @Field((_type) => String)
  webhookSecret!: string;
}
