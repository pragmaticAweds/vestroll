import { NextRequest } from "next/server";
import { ApiResponse } from "@/api/utils/api-response";
import { AuthUtils } from "@/api/utils/auth";
import { MilestoneService } from "@/api/services/milestone.service";
import { updateMilestoneStatusSchema } from "@/api/validations/milestone.schema";

/**
 * @swagger
 * /team/milestones/{id}/status:
 *   patch:
 *     summary: Update milestone status
 *     description: Update the status of a milestone. Only Manager, Admin, or project owner can update.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Milestone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, approved, rejected]
 *               reason:
 *                 type: string
 *                 description: Required when status is rejected
 *     responses:
 *       200:
 *         description: Milestone status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     newStatus:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request - Invalid status or milestone in terminal state
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Milestone not found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await AuthUtils.authenticateRequest(request);
    const { id } = await params;

    // RBAC: Check if user has Manager, Admin role
    const allowedRoles = ["Manager", "Admin", "manager", "admin"];
    if (!user.role || !allowedRoles.includes(user.role)) {
      return ApiResponse.error("Insufficient permissions", 403);
    }

    const body = await request.json();
    const validation = updateMilestoneStatusSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        validation.error.errors[0].message,
        400,
        { errors: validation.error.errors }
      );
    }

    const { status } = validation.data;
    const updated = await MilestoneService.updateMilestoneStatus(id, status);

    return ApiResponse.success(
      {
        id: updated.id,
        newStatus: updated.status,
        updatedAt: updated.updatedAt,
      },
      "Milestone status updated successfully"
    );
  } catch (error: any) {
    if (error.status === 404) {
      return ApiResponse.error("Milestone not found", 404);
    }
    if (error.status === 400) {
      return ApiResponse.error(error.message, 400);
    }
    if (error.message?.includes("Authentication") || error.message?.includes("Unauthorized")) {
      return ApiResponse.error(error.message, 401);
    }
    console.error("Error updating milestone status:", error);
    return ApiResponse.error("Failed to update milestone status", 500);
  }
}
