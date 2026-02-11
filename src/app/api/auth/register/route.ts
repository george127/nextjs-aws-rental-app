import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                               ENV + COGNITO                                */
/* -------------------------------------------------------------------------- */

const CLIENT_ID = process.env.COGNITO_USER_POOL_CLIENT_ID!;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;

if (!CLIENT_ID || !USER_POOL_ID) {
  throw new Error("Missing Cognito environment variables");
}

const cognito = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

/* -------------------------------------------------------------------------- */
/*                         PHONE FORMAT (E.164 SAFE)                          */
/* -------------------------------------------------------------------------- */

function formatPhoneE164(phone?: string | null): string | null {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, "");

  // 🇬🇭 Ghana default
  if (digits.startsWith("0")) {
    digits = "233" + digits.slice(1);
  }

  const formatted = `+${digits}`;
  const e164Regex = /^\+[1-9]\d{7,14}$/;

  return e164Regex.test(formatted) ? formatted : null;
}

/* -------------------------------------------------------------------------- */
/*                       FETCH USER ATTRIBUTES (ADMIN)                        */
/* -------------------------------------------------------------------------- */

async function getCognitoUserAttributes(email: string) {
  const command = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
  });

  const response = await cognito.send(command);

  const attributes: Record<string, string> = {};

  response.UserAttributes?.forEach((attr) => {
    if (attr.Name && attr.Value) {
      attributes[attr.Name] = attr.Value;
    }
  });

  return attributes;
}

/* -------------------------------------------------------------------------- */
/*                               POST – SIGN UP                               */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneE164(phone);

    const userAttributes = [
      { Name: "email", Value: email },
      ...(name ? [{ Name: "name", Value: name }] : []),
      ...(formattedPhone
        ? [{ Name: "phone_number", Value: formattedPhone }]
        : []),
    ];

    await cognito.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: userAttributes,
      })
    );

    return NextResponse.json({
      success: true,
      message:
        "Registration successful. Check your email for the verification code.",
    });
  } catch (error: any) {
    console.error("Cognito SignUp Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Registration failed",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                           PUT – CONFIRM EMAIL                              */
/* -------------------------------------------------------------------------- */

export async function PUT(req: Request) {
  try {
    const { email, confirmationCode, role } = await req.json();

    if (!email || !confirmationCode || !role) {
      return NextResponse.json(
        { success: false, error: "Email, code, and role are required" },
        { status: 400 }
      );
    }

    // ✅ Confirm signup
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode.trim(), // fixes hidden spaces bug
      })
    );

    // ✅ Get attributes from Cognito
    const attributes = await getCognitoUserAttributes(email);

    const cognitoSub = attributes.sub;
    const name = attributes.name ?? null;
    const phone = attributes.phone_number ?? null;

    // ✅ Avoid duplicate users
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          cognitoSub,
          name,
          phone,
          role: role as "TENANT" | "MANAGER",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("Confirm Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.name === "CodeMismatchException"
            ? "Invalid verification code."
            : error.message || "Confirmation failed",
      },
      { status: 400 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                          PATCH – RESEND CODE                               */
/* -------------------------------------------------------------------------- */

export async function PATCH(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: CLIENT_ID,
        Username: email,
      })
    );

    return NextResponse.json({
      success: true,
      message: "Verification code resent successfully.",
    });
  } catch (error: any) {
    console.error("Resend Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to resend code",
      },
      { status: 500 }
    );
  }
}
