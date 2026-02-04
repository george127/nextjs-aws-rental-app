import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
      ...(process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID && {
        identityPoolId:
          process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID,
      }),
    },
  },
});
