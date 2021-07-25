import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GocardlessStats {
  @Field((_type) => Int)
  income!: number;

  @Field((_type) => Int)
  numMembers!: number;

  @Field((_type) => Int)
  average!: number;

  @Field((_type) => Int)
  numLessAverage!: number;
}
