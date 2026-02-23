import { db, expenses, auditLogs } from "../db";
import { eq } from "drizzle-orm";
import { NotFoundError, BadRequestError } from "../utils/errors";

export interface UpdateExpenseStatusResult {
  id: string;
  status: string;
  approverId: string;
  processedAt: Date;
}

export class ExpenseService {
  static async updateExpenseStatus(
    expenseId: string,
    status: "approved" | "rejected",
    approverId: string,
    comment?: string,
  ): Promise<UpdateExpenseStatusResult> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .limit(1);

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    if (expense.status !== "pending") {
      throw new BadRequestError("Expense has already been processed");
    }

    if (status === "rejected" && (!comment || comment.trim() === "")) {
      throw new BadRequestError("Rejection comment is required when rejecting an expense");
    }

    const processedAt = new Date();

    return await db.transaction(async (tx) => {
      const [updatedExpense] = await tx
        .update(expenses)
        .set({
          status,
          approverId,
          processedAt,
          readyForPayout: status === "approved",
          rejectionComment: status === "rejected" ? comment : null,
          updatedAt: new Date(),
        })
        .where(eq(expenses.id, expenseId))
        .returning({
          id: expenses.id,
          status: expenses.status,
          approverId: expenses.approverId,
          processedAt: expenses.processedAt,
        });

      await tx.insert(auditLogs).values({
        entityType: "expense",
        entityId: expenseId,
        action: "status_updated",
        performedBy: approverId,
        previousValue: expense.status,
        newValue: status,
        metadata: comment ? JSON.stringify({ rejectionComment: comment }) : null,
      });

      return {
        id: updatedExpense.id,
        status: updatedExpense.status,
        approverId: updatedExpense.approverId!,
        processedAt: updatedExpense.processedAt!,
      };
    });
  }
}
