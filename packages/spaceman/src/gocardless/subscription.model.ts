import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GocardlessSubscription {
  @Field((_type) => String)
  id!: string;

  @Field((_type) => Int)
  amount?: number;

  @Field((_type) => String)
  status?: string;

  @Field((_type) => String)
  createdAt?: string;
}
