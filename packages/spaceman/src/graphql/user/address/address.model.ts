import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Address {
  @Field((_type) => String)
  line1!: string;

  @Field((_type) => String, { nullable: true })
  line2?: string;

  @Field((_type) => String)
  town!: string;

  @Field((_type) => String)
  postcode!: string;
}
