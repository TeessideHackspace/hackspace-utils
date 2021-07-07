import { Field, InputType, InterfaceType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
@InterfaceType('BaseTemplate')
export class SetAddressInput {
  @MaxLength(255)
  @Field()
  line1!: string;

  @MaxLength(255)
  @Field({ nullable: true })
  line2?: string;

  @MaxLength(255)
  @Field()
  town!: string;

  @MaxLength(255)
  @Field()
  postcode!: string;
}
