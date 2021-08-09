import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class KeycloakConnection {
  @Field((_type) => String)
  keycloakBaseUrl!: string;

  @Field((_type) => String)
  keycloakAdminUsername!: string;

  @Field((_type) => String)
  keycloakAdminPassword!: string;
}
