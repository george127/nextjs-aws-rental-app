import { createRemoteJWKSet, jwtVerify } from "jose";

const region = process.env.AWS_REGION!;
const userPoolId = process.env.COGNITO_USER_POOL_ID!;

const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const jwks = createRemoteJWKSet(
  new URL(`${issuer}/.well-known/jwks.json`)
);

export async function verifyCognitoToken(token: string) {
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
  });

  return payload;
}
