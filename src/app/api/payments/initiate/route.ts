import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const payload = verifyToken(token) as { id: string; role: string };

    if (!payload?.id || payload.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantProfile = await prisma.tenantProfile.findFirst({
      where: { userId: payload.id },
      include: { property: true },
    });

    if (!tenantProfile?.property) {
      return NextResponse.json(
        { error: "No approved property found" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        tenantId: tenantProfile.id,
        amount: tenantProfile.property.rentAmount,
        status: "PENDING",
        reference: randomUUID(),
      },
    });

    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/redirect/${payment.reference}`;

    return NextResponse.json({ paymentUrl });

  } catch (error) {
    console.error("Payment initiation error:", error);

    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
