import { Field, ObjectType } from '@nestjs/graphql';
import { GocardlessSubscription } from './subscription.model';

@ObjectType()
export class GocardlessMandate {
  @Field((_type) => String)
  id?: string;

  @Field((_type) => String)
  reference?: string;

  @Field((_type) => String)
  status?: string;

  @Field((_type) => String)
  createdAt?: string;

  @Field((_type) => String)
  nextPossibleChargeDate?: string;

  @Field((_type) => GocardlessSubscription, { nullable: true })
  subscription?: GocardlessSubscription;

  customerId?: string;
}
