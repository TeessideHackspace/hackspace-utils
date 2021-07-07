import { Field, ObjectType } from '@nestjs/graphql';
import { GocardlessMandate } from '../gocardless/mandate.model';
import { Address } from './address/address.model';

@ObjectType()
export class User {
  @Field((_type) => String)
  id!: number;

  @Field((_type) => String, { nullable: true })
  nickname?: string;

  @Field((_type) => String, { nullable: true })
  gocardlessId?: string;

  @Field((_type) => GocardlessMandate, { nullable: true })
  mandate?: GocardlessMandate;

  @Field((_type) => Address, { nullable: true })
  address?: Address;
}
