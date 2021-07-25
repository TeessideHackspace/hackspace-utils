import { Field, InputType, InterfaceType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
@InterfaceType('BaseTemplate')
export class SetGocardlessConnectionInput {
  @MaxLength(255)
  @Field()
  key!: string;

  @MaxLength(255)
  @Field()
  redirectUri!: string;

  @MaxLength(255)
  @Field()
  webhookSecret!: string;
}
