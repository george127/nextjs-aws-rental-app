import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const normalizedStatus = status?.toLowerCase();

    if (!["approved", "rejected"].includes(normalizedStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Include user email in the application query
    const application = await prisma.propertyApplication.findUnique({
      where: { id },
      include: { 
        property: true,
        user: { select: { email: true } } // Get user's email
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "pending") {
      return NextResponse.json({ error: `Application already ${application.status}` }, { status: 400 });
    }

    // Update application status
    const updatedApplication = await prisma.propertyApplication.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    // IF APPROVED → find user by email and create TenantProfile
    if (normalizedStatus === "approved" && application.user?.email) {
      // Find user by email instead of using userId
      const user = await prisma.user.findUnique({
        where: { email: application.user.email },
      });

      if (user) {
        const existingTenant = await prisma.tenantProfile.findUnique({
          where: { userId: user.id },
        });

        if (!existingTenant) {
          await prisma.tenantProfile.create({
            data: {
              userId: user.id, // Use the found user's ID
              propertyId: application.propertyId,
              rentAmount: application.property.rentAmount,
              rentDueDay: 1,
            },
          });
        }
      }
    }

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}