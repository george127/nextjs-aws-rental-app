import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    // 1️⃣ Get auth token
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify token
    const payload = verifyToken(token) as { id: string; role: string };

    if (!payload?.id || payload.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Fetch tenant profile + property
    const tenantProfile = await prisma.tenantProfile.findFirst({
      where: { userId: payload.id },
      include: {
        property: true,
      },
    });

    if (!tenantProfile || !tenantProfile.property) {
      return NextResponse.json(
        { error: "No approved property found" },
        { status: 400 }
      );
    }

    const rentAmount = tenantProfile.property.rentAmount;

    // 4️⃣ Create payment record (PENDING)
    const payment = await prisma.payment.create({
      data: {
        tenantId: tenantProfile.id,
        amount: rentAmount,
        status: "PENDING",
        reference: randomUUID(),
      },
    });

    // 5️⃣ TEMP: Fake payment URL (Stripe/Paystack comes next)
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/redirect/${payment.reference}`;

    return NextResponse.json({
      paymentUrl,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
