import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ NEXT.JS 15 FIX — params is async
    const { id } = await context.params;

    console.log("PROPERTY ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Property ID missing" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("PROPERTY FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
