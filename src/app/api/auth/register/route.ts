

// import { NextResponse } from "next/server";
// import {
//   CognitoIdentityProviderClient,
//   SignUpCommand,
//   ConfirmSignUpCommand,
//   ResendConfirmationCodeCommand,
//   AdminGetUserCommand,
// } from "@aws-sdk/client-cognito-identity-provider"; 
// import { prisma } from "@/lib/prisma";

// /* -------------------------------------------------------------------------- */
// /*                               COGNITO SETUP                                */
// /* -------------------------------------------------------------------------- */

// const cognito = new CognitoIdentityProviderClient({
//   region: "us-east-1",
// });

// const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
// const CLIENT_ID = process.env.COGNITO_USER_POOL_CLIENT_ID!;
// console.log("CLIENT_ID:", process.env.COGNITO_USER_POOL_CLIENT_ID);
// console.log("POOL:", process.env.COGNITO_USER_POOL_ID);


// console.log("ENV CHECK:", {
//   client: process.env.COGNITO_USER_POOL_CLIENT_ID, 
//   pool: process.env.COGNITO_USER_POOL_ID,
// });

// /* -------------------------------------------------------------------------- */
// /*                         PHONE FORMAT (E.164 SAFE)                           */
// /* -------------------------------------------------------------------------- */

// function formatPhoneE164(phone?: string | null): string | null {
//   if (!phone) return null;

//   let digits = phone.replace(/\D/g, "");

//   // 🇬🇭 Ghana default
//   if (digits.startsWith("0")) {
//     digits = "233" + digits.slice(1);
//   }

//   const formatted = `+${digits}`;
//   const e164Regex = /^\+[1-9]\d{7,14}$/;

//   return e164Regex.test(formatted) ? formatted : null;
// }

// /* -------------------------------------------------------------------------- */
// /*                       FETCH USER ATTRIBUTES (ADMIN)                         */
// /* -------------------------------------------------------------------------- */

// async function getCognitoUserAttributes(email: string) {
//   const command = new AdminGetUserCommand({
//     UserPoolId: USER_POOL_ID,
//     Username: email,
//   });

//   const response = await cognito.send(command);

//   const attributes: Record<string, string> = {};
//   response.UserAttributes?.forEach((attr) => {
//     if (attr.Name && attr.Value) {
//       attributes[attr.Name] = attr.Value;
//     }
//   });

//   return attributes;
// }

// /* -------------------------------------------------------------------------- */
// /*                               POST – REGISTER                               */
// /* -------------------------------------------------------------------------- */

// export async function POST(req: Request) {
//   try {
//     const { name, email, phone, password, role } = await req.json();

//     if (!email || !password || !role) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const formattedPhone = formatPhoneE164(phone);

//     if (phone && !formattedPhone) {
//       return NextResponse.json(
//         {
//           success: false,
//           error:
//             "Invalid phone number. Use international format e.g. +233551234567",
//         },
//         { status: 400 }
//       );
//     }

//     const userAttributes = [
//       { Name: "email", Value: email },
//       ...(name ? [{ Name: "name", Value: name }] : []),
//       ...(formattedPhone
//         ? [{ Name: "phone_number", Value: formattedPhone }]
//         : []),
//     ];

//     const command = new SignUpCommand({
//       ClientId: CLIENT_ID,
//       Username: email,
//       Password: password,
//       UserAttributes: userAttributes,
//     });

//     await cognito.send(command);

//     // Temporarily store role in a server-side memory or DB table
//     // (optional) For now, frontend can send role again during confirmation

//     return NextResponse.json({
//       success: true,
//       message:
//         "Registration successful. Check your email for the verification code.",
//     });
//   } catch (error: any) {
//     console.error("Cognito SignUp Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Registration failed",
//       },
//       { status: 500 }
//     );
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                           PUT – CONFIRM EMAIL                               */
// /* -------------------------------------------------------------------------- */

// export async function PUT(req: Request) {
//   try {
//     const { email, confirmationCode, role } = await req.json();

//     if (!email || !confirmationCode || !role) {
//       return NextResponse.json(
//         { success: false, error: "Email, code, and role are required" },
//         { status: 400 }
//       );
//     }

//     // 1️⃣ Confirm Cognito signup
//     await cognito.send(
//       new ConfirmSignUpCommand({
//         ClientId: CLIENT_ID,
//         Username: email,
//         ConfirmationCode: confirmationCode,
//       })
//     );

//     // 2️⃣ Fetch Cognito attributes
//     const attributes = await getCognitoUserAttributes(email);

//     const cognitoSub = attributes.sub;
//     const name = attributes.name ?? null;
//     const phone = attributes.phone_number ?? null;

//     // 3️⃣ Persist user in Prisma with correct role
//     await prisma.user.create({
//       data: {
//         email,
//         cognitoSub,
//         name,
//         phone,
//         role: role as "TENANT" | "MANAGER",
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Email verified successfully. You can now log in.",
//     });
//   } catch (error: any) {
//     console.error("Confirm Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Invalid confirmation code",
//       },
//       { status: 400 }
//     );
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                          PATCH – RESEND CODE                                */
// /* -------------------------------------------------------------------------- */

// export async function PATCH(req: Request) {
//   try {
//     const { email } = await req.json();

//     if (!email) {
//       return NextResponse.json(
//         { success: false, error: "Email is required" },
//         { status: 400 }
//       );
//     }

//     await cognito.send(
//       new ResendConfirmationCodeCommand({
//         ClientId: CLIENT_ID,
//         Username: email,
//       })
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Verification code resent successfully.",
//     });
//   } catch (error: any) {
//     console.error("Resend Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Failed to resend code",
//       },
//       { status: 500 }
//     );
//   }
// }


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
/*                               COGNITO SETUP                                */
/* -------------------------------------------------------------------------- */

const cognito = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.COGNITO_USER_POOL_CLIENT_ID!;

/* -------------------------------------------------------------------------- */
/*                         PHONE FORMAT (E.164 SAFE)                           */
/* -------------------------------------------------------------------------- */

function formatPhoneE164(phone?: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "233" + digits.slice(1);
  const formatted = `+${digits}`;
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(formatted) ? formatted : null;
}

/* -------------------------------------------------------------------------- */
/*                       FETCH USER ATTRIBUTES (ADMIN)                         */
/* -------------------------------------------------------------------------- */

async function getCognitoUserAttributes(email: string) {
  const command = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
  });

  const response = await cognito.send(command);

  const attributes: Record<string, string> = {};
  response.UserAttributes?.forEach((attr) => {
    if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
  });

  return { attributes, userStatus: response.UserStatus };
}

/* -------------------------------------------------------------------------- */
/*                               POST – REGISTER                               */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneE164(phone);
    if (phone && !formattedPhone) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid phone number. Use international format e.g. +233551234567",
        },
        { status: 400 }
      );
    }

    const userAttributes = [
      { Name: "email", Value: email },
      ...(name ? [{ Name: "name", Value: name }] : []),
      ...(formattedPhone ? [{ Name: "phone_number", Value: formattedPhone }] : []),
    ];

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: userAttributes,
    });

    await cognito.send(command);

    return NextResponse.json({
      success: true,
      message: "Registration successful. Check your email for the verification code.",
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
/*                           PUT – CONFIRM EMAIL                               */
/* -------------------------------------------------------------------------- */

export async function PUT(req: Request) {
  try {
    const { email, confirmationCode, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: "Email and role are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get user attributes and status
    const { attributes, userStatus } = await getCognitoUserAttributes(email);

    // 2️⃣ Confirm user only if not confirmed
    if (userStatus !== "CONFIRMED") {
      if (!confirmationCode) {
        return NextResponse.json(
          { success: false, error: "Confirmation code is required" },
          { status: 400 }
        );
      }

      await cognito.send(
        new ConfirmSignUpCommand({
          ClientId: CLIENT_ID,
          Username: email,
          ConfirmationCode: confirmationCode,
        })
      );
    }

    // 3️⃣ Save user to Prisma if not already exists
    const cognitoSub = attributes.sub;
    const name = attributes.name ?? null;
    const phone = attributes.phone_number ?? null;

    const existingUser = await prisma.user.findUnique({ where: { email } });
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
          error.message ||
          "Invalid confirmation code or user already confirmed. Please request a new code.",
      },
      { status: 400 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                          PATCH – RESEND CODE                                */
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
