import express = require('express');
import jwt = require('express-jwt');
import { GocardlessService } from './service';
import { ApolloServer, gql } from 'apollo-server-express';
import { expressJwtSecret } from 'jwks-rsa';

const service = new GocardlessService(
  process.env.KEYCLOAK_URL,
  process.env.KEYCLOAK_USERNAME,
  process.env.KEYCLOAK_PASSWORD,
  process.env.GOCARDLESS_KEY,
  process.env.GOCARDLESS_REDIRECT,
);

const typeDefs = gql`
  type MembershipStats {
    income: Int!
    numMembers: Int!
    average: Int!
    numLessAverage: Int!
  }

  type Subscription {
    id: String
    amount: Int
    status: String!
    user: String!
    createdAt: String
  }

  type Mandate {
    user: String!
    id: String
    reference: String
    status: String!
    createdAt: String
    nextPossibleChargeDate: String
  }

  type GocardlessRedirect {
    gocardlessUrl: String!
  }

  type Query {
    stats: MembershipStats
    subscription: Subscription
    mandate: Mandate
  }

  type Mutation {
    generateRedirectUrl: GocardlessRedirect
    confirmRedirect(redirectFlowId: String!): Mandate
    subscribe(amount: Int!): Subscription
    changeSubscriptionAmount(amount: Int!): Subscription
    cancelSubscription: Subscription
  }
`;

interface Context {
  user: string;
}

const resolvers = {
  Query: {
    stats: async () => await service.stats(),
    subscription: async (_, args: Object, context: Context) =>
      await service.getSubscription(context.user),
    mandate: async (_, args: Object, context: Context) =>
      await service.getMandate(context.user),
  },
  Mutation: {
    generateRedirectUrl: async (_, args: Object, context: Context) =>
      await service.gocardlessRedirect(context.user),
    confirmRedirect: async (
      _,
      args: { redirectFlowId: string },
      context: Context,
    ) =>
      await service.gocardlessRedirectConfirm(
        context.user,
        args.redirectFlowId,
      ),
    subscribe: async (_, args: { amount: number }, context: Context) =>
      await service.subscribe(context.user, args.amount),
    changeSubscriptionAmount: async (
      _,
      args: { amount: number },
      context: Context,
    ) => await service.updateSubscription(context.user, args.amount),
    cancelSubscription: async (_, args: { amount: number }, context: Context) =>
      await service.cancelSubscription(context.user),
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      user: req['user']?.sub,
    };
  },
});
const app = express();
app.use(
  jwt({
    secret: expressJwtSecret({
      jwksUri: `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/certs`,
    }),
    algorithms: ['RS256'],
    credentialsRequired: false,
  }),
);
app.use(server.getMiddleware());

app.listen({ port: process.env.PORT || 3000 }, () =>
  console.log(`🚀 Server ready`),
);
