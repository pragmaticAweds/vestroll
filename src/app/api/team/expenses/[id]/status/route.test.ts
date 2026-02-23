import { describe, it, expect, beforeEach, vi } from "vitest";
import { PATCH } from "./route";
import { NextRequest } from "next/server";
import { ExpenseService } from "@/api/services/expense.service";
import { AuthUtils } from "@/api/utils/auth";
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "@/api/utils/errors";

vi.mock("@/api/services/expense.service");
vi.mock("@/api/utils/auth");

describe("PATCH /api/team/expenses/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const expenseId = "expense-uuid-123";
  const userId = "user-uuid-456";

  const createMockRequest = (body: Record<string, unknown>): NextRequest => {
    return new NextRequest("http://localhost:3000/api/team/expenses/" + expenseId + "/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  const createMockParams = () => Promise.resolve({ id: expenseId });

  it("should approve an expense successfully", async () => {
    const processedAt = new Date("2026-02-23T12:00:00Z");

    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
      userId,
    } as any);
    vi.mocked(ExpenseService.updateExpenseStatus).mockResolvedValue({
      id: expenseId,
      status: "approved",
      approverId: userId,
      processedAt,
    });

    const req = createMockRequest({ status: "approved" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe("Expense status updated successfully");
    expect(data.data.id).toBe(expenseId);
    expect(data.data.status).toBe("approved");
    expect(data.data.approverId).toBe(userId);
    expect(data.data.processedAt).toBeDefined();

    expect(ExpenseService.updateExpenseStatus).toHaveBeenCalledWith(
      expenseId,
      "approved",
      userId,
      undefined,
    );
  });

  it("should reject an expense with comment successfully", async () => {
    const processedAt = new Date("2026-02-23T12:00:00Z");

    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
      userId,
    } as any);
    vi.mocked(ExpenseService.updateExpenseStatus).mockResolvedValue({
      id: expenseId,
      status: "rejected",
      approverId: userId,
      processedAt,
    });

    const req = createMockRequest({ status: "rejected", comment: "Missing receipt" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.status).toBe("rejected");

    expect(ExpenseService.updateExpenseStatus).toHaveBeenCalledWith(
      expenseId,
      "rejected",
      userId,
      "Missing receipt",
    );
  });

  it("should return 400 when rejecting without comment", async () => {
    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
      userId,
    } as any);
    vi.mocked(ExpenseService.updateExpenseStatus).mockRejectedValue(
      new BadRequestError("Rejection comment is required when rejecting an expense"),
    );

    const req = createMockRequest({ status: "rejected" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Rejection comment is required when rejecting an expense");
  });

  it("should return 400 for invalid status value", async () => {
    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
      userId,
    } as any);

    const req = createMockRequest({ status: "invalid_status" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Invalid request body");
  });

  it("should return 404 when expense not found", async () => {
    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
      userId,
    } as any);
    vi.mocked(ExpenseService.updateExpenseStatus).mockRejectedValue(
      new NotFoundError("Expense not found"),
    );

    const req = createMockRequest({ status: "approved" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Expense not found");
  });

  it("should return 400 when expense already processed", async () => {
    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
      userId,
    } as any);
    vi.mocked(ExpenseService.updateExpenseStatus).mockRejectedValue(
      new BadRequestError("Expense has already been processed"),
    );

    const req = createMockRequest({ status: "approved" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Expense has already been processed");
  });

  it("should return 401 for unauthenticated request", async () => {
    vi.mocked(AuthUtils.authenticateRequest).mockRejectedValue(
      new UnauthorizedError(),
    );

    const req = createMockRequest({ status: "approved" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should return 500 for unexpected errors", async () => {
    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
      userId,
    } as any);
    vi.mocked(ExpenseService.updateExpenseStatus).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const req = createMockRequest({ status: "approved" });
    const response = await PATCH(req, { params: createMockParams() });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Internal server error");
  });
});
