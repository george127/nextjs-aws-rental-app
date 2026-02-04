import { Amplify } from "aws-amplify";
import { getEnv } from "./env";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: getEnv("NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID"),
      userPoolClientId: getEnv("NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID"),
      identityPoolId: getEnv("NEXT_PUBLIC_AWS_IDENTITY_POOL_ID"),
    },
  },
});
