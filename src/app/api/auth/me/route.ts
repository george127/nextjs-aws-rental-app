import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Use AWS SDK to authenticate
    const { CognitoIdentityProviderClient, InitiateAuthCommand } = await import("@aws-sdk/client-cognito-identity-provider");
    
    const client = new CognitoIdentityProviderClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: cleanEmail,
        PASSWORD: password,
      },   
    });

    const response = await client.send(command);

    if (!response.AuthenticationResult?.IdToken) {
      throw new Error("No token returned");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      token: response.AuthenticationResult.IdToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error("Login error:", error);
    
    if (error.name === "NotAuthorizedException") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (error.name === "UserNotConfirmedException") {
      return NextResponse.json({ error: "Please confirm your email first" }, { status: 400 });
    }
    if (error.name === "UserNotFoundException") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}