import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiResponse } from "@/api/utils/api-response";
import { AppError } from "@/api/utils/errors";
import { AuthUtils } from "@/api/utils/auth";
import { ExpenseService } from "@/api/services/expense.service";

const UpdateExpenseStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  comment: z.string().optional(),
});

/**
 * @swagger
 * /team/expenses/{id}/status:
 *   patch:
 *     summary: Update expense status
 *     description: Approve or reject an employee expense submission
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
 *         description: Expense ID
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
 *                 enum: [approved, rejected]
 *               comment:
 *                 type: string
 *                 description: Required when status is "rejected"
 *     responses:
 *       200:
 *         description: Expense status updated successfully
 *       400:
 *         description: Invalid request or expense already processed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await AuthUtils.authenticateRequest(req);
    const { id } = await params;

    const body = await req.json();
    const parsed = UpdateExpenseStatusSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponse.error(
        "Invalid request body",
        400,
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
      );
    }

    const { status, comment } = parsed.data;

    const result = await ExpenseService.updateExpenseStatus(
      id,
      status,
      userId,
      comment,
    );

    return ApiResponse.success(result, "Expense status updated successfully");
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }

    console.error("[Expense Status Update Error]", error);
    return ApiResponse.error("Internal server error", 500);
  }
}
