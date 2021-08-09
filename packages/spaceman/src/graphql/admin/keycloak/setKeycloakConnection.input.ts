import { Field, InputType, InterfaceType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
@InterfaceType('BaseTemplate')
export class SetKeycloakConnectionInput {
  @MaxLength(255)
  @Field()
  keycloakBaseUrl!: string;

  @MaxLength(255)
  @Field()
  keycloakAdminUsername!: string;

  @MaxLength(255)
  @Field()
  keycloakAdminPassword!: string;
}
