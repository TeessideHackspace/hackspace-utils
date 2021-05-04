import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  constructor(id: string, nickname: string) {
    this.id = id;
    this.nickname = nickname;
  }

  @Field((_type) => String)
  id: string;

  @Field((_type) => String)
  nickname: string;
}
