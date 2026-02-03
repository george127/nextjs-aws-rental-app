// In your layout or app component
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!, // Your env var name
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!, // Your env var name
      identityPoolId: process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID, // Optional
    },
  },
});