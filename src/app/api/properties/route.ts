import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextRequest } from "next/server";

interface JwtPayload {
  id: string;
  role: "TENANT" | "MANAGER";
}


/* ======================================================
   CREATE PROPERTY
====================================================== */
export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get token from cookie
    const token = req.cookies.get("auth_token")?.value; // <-- THIS
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. No token." }, { status: 401 });
    }

    // 2️⃣ Verify token
    let payload: JwtPayload;
    try {
      payload = verifyToken(token) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Unauthorized. Invalid token." }, { status: 401 });
    }

    if (!payload?.id || payload.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized. Only managers can create properties." }, { status: 401 });
    }

    const managerId = payload.id;

    // 3️⃣ Parse request body
    const body = await req.json();
    const {
      name, address, city, state, zipCode,
      rentAmount, securityDeposit, bedrooms, bathrooms,
      squareFeet, description, propertyType, amenities, imageData
    } = body;

    if (!name || !address || !city || !state || !zipCode || rentAmount === undefined || bedrooms === undefined || bathrooms === undefined || !propertyType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Create property
    const property = await prisma.property.create({
      data: {
        name, address, city, state, zipCode,
        rentAmount: Number(rentAmount),
        securityDeposit: Number(securityDeposit) || 0,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        squareFeet: squareFeet ? Number(squareFeet) : null,
        description, propertyType, amenities, imageData,
        manager: { connect: { id: managerId } },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("CREATE PROPERTY ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ======================================================
   FETCH MANAGER PROPERTIES
====================================================== */


export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. No token." },
        { status: 401 }
      );
    }

    let payload: JwtPayload & { id: string; role: string };

    try {
      payload = verifyToken(token) as JwtPayload & {
        id: string;
        role: string;
      };
    } catch {
      return NextResponse.json(
        { error: "Unauthorized. Invalid token." },
        { status: 401 }
      );
    }

    if (payload.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Unauthorized. Only managers can view properties." },
        { status: 401 }
      );
    }

    const properties = await prisma.property.findMany({
      where: { managerId: payload.id },
      orderBy: { createdAt: "desc" },
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
        imageData: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("FETCH PROPERTIES ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


/* ======================================================
   UPDATE PROPERTY (PARTIAL UPDATE)
====================================================== */
export async function PATCH(req: Request) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. No token." }, { status: 401 });
    }

    let payload: JwtPayload;
    try {
      payload = verifyToken(token) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Unauthorized. Invalid token." }, { status: 401 });
    }

    if (payload.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can update properties." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Ensure property belongs to manager
    const property = await prisma.property.findFirst({
      where: { id, managerId: payload.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error("UPDATE PROPERTY ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ======================================================
   DELETE PROPERTY
====================================================== */
export async function DELETE(req: Request) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. No token." }, { status: 401 });
    }

    let payload: JwtPayload;
    try {
      payload = verifyToken(token) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Unauthorized. Invalid token." }, { status: 401 });
    }

    if (payload.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can delete properties." },
        { status: 401 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Ensure ownership
    const property = await prisma.property.findFirst({
      where: { id, managerId: payload.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE PROPERTY ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}