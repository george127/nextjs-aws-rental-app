export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    // ✅ Get cookies the modern way
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: { id: string; role: string };
    try {
      payload = verifyToken(token) as { id: string; role: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!payload.id || payload.role !== "TENANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantProfile = await prisma.tenantProfile.findFirst({
      where: { userId: payload.id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            rentAmount: true,
            securityDeposit: true,
            bedrooms: true,
            bathrooms: true,
            squareFeet: true,
            description: true,
            propertyType: true,
            amenities: true,
            status: true,
            imageData: true,
          },
        },
      },
    });

    if (!tenantProfile) {
      return NextResponse.json(
        { error: "Tenant not approved yet" },
        { status: 403 }
      );
    }

    return NextResponse.json({ property: tenantProfile.property });
  } catch (error) {
    console.error("Tenant property error:", error);
    return NextResponse.json(
      { error: "Failed to load property" },
      { status: 500 }
    );
  }
}
