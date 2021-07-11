import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const Sub = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext()?.user;
    console.log(user);
    if (typeof user.sub !== 'string') {
      throw new Error('User is not authenticated');
    }
    return user.sub;
  },
);
