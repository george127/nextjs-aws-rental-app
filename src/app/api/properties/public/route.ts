import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUBLIC PROPERTY LISTING
 * Visible on landing page & tenant dashboard
 * NO AUTH REQUIRED
 */
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "vacant", // ✅ FIXED
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        rentAmount: true,
        bedrooms: true,
        bathrooms: true,
        squareFeet: true,
        description: true,
        propertyType: true,
        amenities: true,
        imageData: true,
        status: true,
      },
    });

    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error("PUBLIC PROPERTY FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
