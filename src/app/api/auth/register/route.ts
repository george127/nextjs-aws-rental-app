// import { NextResponse } from "next/server";
// import {
//   CognitoIdentityProviderClient,
//   SignUpCommand,
//   ConfirmSignUpCommand,
//   ResendConfirmationCodeCommand,
// } from "@aws-sdk/client-cognito-identity-provider";
// import { prisma } from "@/lib/prisma";
// import crypto from "crypto";

// /* -------------------------------------------------------------------------- */
// /*                               COGNITO SETUP                                */
// /* -------------------------------------------------------------------------- */

// const cognito = new CognitoIdentityProviderClient({
//   region: "us-east-1",
// });

// const CLIENT_ID =
//   process.env.COGNITO_USER_POOL_CLIENT_ID ||
//   process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID;

// const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

// if (!CLIENT_ID || !CLIENT_SECRET) {
//   throw new Error(
//     "Cognito environment variables are missing: CLIENT_ID or CLIENT_SECRET"
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                     HELPER TO COMPUTE SECRET_HASH                          */
// /* -------------------------------------------------------------------------- */

// function getSecretHash(username: string) {
//   return crypto
//     .createHmac("SHA256", CLIENT_SECRET!)
//     .update(username + CLIENT_ID)
//     .digest("base64");
// }

// /* -------------------------------------------------------------------------- */
// /*                         PHONE FORMAT (E.164 SAFE)                          */
// /* -------------------------------------------------------------------------- */

// function formatPhoneE164(phone?: string | null): string | null {
//   if (!phone) return null;

//   let digits = phone.replace(/\D/g, "");

//   if (digits.startsWith("0")) {
//     digits = "233" + digits.slice(1); // Ghana default
//   }

//   const formatted = `+${digits}`;
//   const e164Regex = /^\+[1-9]\d{7,14}$/;

//   return e164Regex.test(formatted) ? formatted : null;
// }

// /* -------------------------------------------------------------------------- */
// /*                               POST – REGISTER                              */
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

//     await cognito.send(
//       new SignUpCommand({
//         ClientId: CLIENT_ID,
//         Username: email,
//         Password: password,
//         SecretHash: getSecretHash(email),
//         UserAttributes: userAttributes,
//       })
//     );

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
// /*                           PUT – CONFIRM EMAIL                              */
// /* -------------------------------------------------------------------------- */

// export async function PUT(req: Request) {
//   try {
//     const { email, confirmationCode, role, name, phone } =
//       await req.json();

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
//         SecretHash: getSecretHash(email),
//       })
//     );

//     // 2️⃣ Save directly to database (NO ADMIN CALL)
//     await prisma.user.create({
//       data: {
//         email,
//         cognitoSub: email, // use email as identifier (simple & safe)
//         name: name ?? null,
//         phone: phone ?? null,
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
// /*                          PATCH – RESEND CODE                               */
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
//         SecretHash: getSecretHash(email),
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
} from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/* -------------------------------------------------------------------------- */
/*                               COGNITO SETUP                                */
/* -------------------------------------------------------------------------- */

const cognito = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

const CLIENT_ID =
  process.env.COGNITO_USER_POOL_CLIENT_ID ||
  process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID;

const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "Cognito environment variables are missing: CLIENT_ID or CLIENT_SECRET"
  );
}

/* -------------------------------------------------------------------------- */
/*                     HELPER TO COMPUTE SECRET_HASH                          */
/* -------------------------------------------------------------------------- */

function getSecretHash(username: string) {
  return crypto
    .createHmac("SHA256", CLIENT_SECRET!)
    .update(username + CLIENT_ID)
    .digest("base64");
}

/* -------------------------------------------------------------------------- */
/*                         PHONE FORMAT (E.164 SAFE)                          */
/* -------------------------------------------------------------------------- */

function formatPhoneE164(phone?: string | null): string | null {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    digits = "233" + digits.slice(1); // Ghana default
  }

  const formatted = `+${digits}`;
  const e164Regex = /^\+[1-9]\d{7,14}$/;

  return e164Regex.test(formatted) ? formatted : null;
}

/* -------------------------------------------------------------------------- */
/*                               POST – REGISTER                              */
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
      ...(formattedPhone
        ? [{ Name: "phone_number", Value: formattedPhone }]
        : []),
    ];

    await cognito.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        SecretHash: getSecretHash(email),
        UserAttributes: userAttributes,
      })
    );

    // Store user data temporarily in database
    const formattedPhoneForDb = formattedPhone || phone || null;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          cognitoSub: email, // use email as identifier
          name: name ?? null,
          phone: formattedPhoneForDb,
          role: role as "TENANT" | "MANAGER",
        },
      });
    }

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
    const { email, confirmationCode, role, name, phone } =
      await req.json();

    if (!email || !confirmationCode || !role) {
      return NextResponse.json(
        { success: false, error: "Email, code, and role are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Confirm Cognito signup
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode,
        SecretHash: getSecretHash(email),
      })
    );

    // Format phone if provided
    const formattedPhone = formatPhoneE164(phone);

    // 2️⃣ Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user with any new data
      await prisma.user.update({
        where: { email },
        data: {
          ...(name && { name }), // Only update if name is provided
          ...(formattedPhone && { phone: formattedPhone }), // Only update if phone is provided
          ...(role && { role: role as "TENANT" | "MANAGER" }), // Update role if needed
        },
      });
    } else {
      // Create new user if doesn't exist (fallback)
      await prisma.user.create({
        data: {
          email,
          cognitoSub: email, // use email as identifier
          name: name ?? null,
          phone: formattedPhone ?? null,
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
        error: error.message || "Invalid confirmation code",
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
        SecretHash: getSecretHash(email),
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