import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1️⃣ Get token
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Decode token
    const payload = verifyToken(token) as { id: string };

    // 3️⃣ Create application WITH userId
    const application = await prisma.propertyApplication.create({
      data: {
        propertyId: body.propertyId,
        userId: payload.id, // ✅ THIS FIXES EVERYTHING
        tenantName: body.tenantName,
        email: body.email,
        phone: body.phone,
        message: body.message,
      },
      include: {
        property: true,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
