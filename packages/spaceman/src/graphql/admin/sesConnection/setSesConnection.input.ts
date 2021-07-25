import { Field, InputType, InterfaceType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
@InterfaceType('BaseTemplate')
export class SetSesConnectionInput {
  @MaxLength(255)
  @Field()
  awsRegion!: string;

  @MaxLength(255)
  @Field()
  awsAccessKeyId!: string;

  @MaxLength(255)
  @Field()
  awsSecretAccessKey!: string;
}
