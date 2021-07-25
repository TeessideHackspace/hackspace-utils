import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SesConnection {
  @Field((_type) => String)
  awsRegion!: string;

  @Field((_type) => String)
  awsAccessKeyId!: string;

  @Field((_type) => String)
  awsSecretAccessKey!: string;
}
