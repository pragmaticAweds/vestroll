import { NextRequest, NextResponse } from "next/server";
import { TeamService } from "@/api/services/team.service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, organizationId } = body;

        // Basic email validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { message: "Valid email is required" },
                { status: 400 }
            );
        }

        const newUser = await TeamService.addEmployee({ email, organizationId });

        return NextResponse.json(
            {
                id: newUser.id,
                status: newUser.status,
                invitedAt: newUser.invitedAt,
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (error.status === 409) {
            return NextResponse.json(
                { message: error.message },
                { status: 409 }
            );
        }

        console.error("Error adding employee:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
