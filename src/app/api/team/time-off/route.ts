import { NextRequest } from "next/server";
import { TimeOffService } from "@/api/services/time-off.service";
import { TimeOffRequestSchema } from "@/api/validations/time-off.schema";
import { ApiResponse } from "@/api/utils/api-response";
import { AppError, ValidationError, UnauthorizedError } from "@/api/utils/errors";
import { JWTTokenService } from "@/api/services/jwt-token.service";

/**
 * @swagger
 * /team/time-off:
 *   post:
 *     summary: Submit a time-off / leave request
 *     description: >
 *       Team members can submit leave requests for themselves.
 *       Admins can submit on behalf of any employee by providing `employeeId`.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *                 description: Admin only – submit on behalf of this employee
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-05"
 *               leaveType:
 *                 type: string
 *                 enum: [vacation, sick, personal, other]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requestId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: Pending
 *                 totalDuration:
 *                   type: integer
 *                   description: Number of business days
 *       400:
 *         description: Bad request – validation error or endDate before startDate
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export async function POST(request: NextRequest) {
    try {
        // Extract and verify JWT from Authorization header
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            throw new UnauthorizedError("Missing or invalid authorization header");
        }

        const token = authHeader.slice(7);
        const payload = await JWTTokenService.verifyToken(token);

        if (!payload?.userId || !payload?.organizationId) {
            throw new UnauthorizedError("Invalid token payload");
        }

        const userId = payload.userId as string;
        const organizationId = payload.organizationId as string;

        const body = await request.json();
        const validatedData = TimeOffRequestSchema.safeParse(body);

        if (!validatedData.success) {
            throw new ValidationError(
                "Invalid request body",
                validatedData.error.flatten().fieldErrors as any,
            );
        }

        const result = await TimeOffService.submitRequest(validatedData.data, {
            userId,
            organizationId,
            isAdmin: payload.role === "admin",
        });

        return ApiResponse.success(result, "Leave request submitted successfully", 201);
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(error.message, error.statusCode, error.errors);
        }

        console.error("Time-off route error:", error);
        return ApiResponse.error("Internal server error", 500);
    }
}