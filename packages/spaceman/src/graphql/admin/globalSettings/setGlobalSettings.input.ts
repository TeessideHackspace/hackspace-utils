import { Field, InputType, InterfaceType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
@InterfaceType('BaseTemplate')
export class GlobalSettingsInput {
  @MaxLength(255)
  @Field()
  siteName!: string;

  @MaxLength(255)
  @Field()
  adminEmail!: string;
}
