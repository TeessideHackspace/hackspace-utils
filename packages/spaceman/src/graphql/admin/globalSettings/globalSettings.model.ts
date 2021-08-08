import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GlobalSettings {
  @Field((_type) => String)
  siteName!: string;

  @Field((_type) => String)
  adminEmail!: string;
}
