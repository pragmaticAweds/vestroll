import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { TimeOffService } from "@/api/services/time-off.service";
import {
    BadRequestError,
    ForbiddenError,
    UnauthorizedError,
} from "@/api/utils/errors";
import { JWTTokenService } from "@/api/services/jwt-token.service";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("@/api/services/time-off.service", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/api/services/time-off.service")>();
    return {
        TimeOffService: {
            calculateBusinessDays: actual.TimeOffService.calculateBusinessDays,
            submitRequest: vi.fn(),
        },
    };
});

vi.mock("@/api/services/jwt-token.service", () => ({
    JWTTokenService: {
        verifyToken: vi.fn().mockResolvedValue({
            userId: "user-123",
            organizationId: "org-123",
            role: "member",
        }),
    },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const createRequest = (body: Record<string, unknown>, role: string = "member"): NextRequest => {
    vi.mocked(JWTTokenService.verifyToken).mockResolvedValueOnce({
        userId: "user-123",
        organizationId: "org-123",
        role: role,
    });

    return {
        json: async () => body,
        headers: new Headers({ authorization: "Bearer valid-token" }),
    } as unknown as NextRequest;
};

// ─── Route Tests ─────────────────────────────────────────────────────────────

describe("POST /api/team/time-off", () => {
    beforeEach(() => vi.clearAllMocks());

    const mockResult = {
        requestId: "req-uuid-123",
        status: "Pending" as const,
        totalDuration: 5,
        startDate: new Date("2024-07-01"),
        endDate: new Date("2024-07-05"),
        leaveType: "vacation" as const,
        employeeId: "emp-123",
        createdAt: new Date(),
    };

    it("returns 201 with requestId, status, and totalDuration on success", async () => {
        vi.mocked(TimeOffService.submitRequest).mockResolvedValue(mockResult);

        const req = createRequest({
            startDate: "2024-07-01",
            endDate: "2024-07-05",
            leaveType: "vacation",
        });

        const res = await POST(req);
        expect(res.status).toBe(201);

        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.requestId).toBe("req-uuid-123");
        expect(data.data.status).toBe("Pending");
        expect(data.data.totalDuration).toBe(5);
    });

    it("returns 400 when endDate is before startDate", async () => {
        vi.mocked(TimeOffService.submitRequest).mockRejectedValue(
            new BadRequestError("endDate cannot be before startDate"),
        );

        const req = createRequest({
            startDate: "2024-07-10",
            endDate: "2024-07-05",
        });

        const res = await POST(req);
        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("endDate cannot be before startDate");
    });

    it("returns 400 for invalid request body (missing required fields)", async () => {
        const req = createRequest({
            leaveType: "vacation",
            // missing startDate and endDate
        });

        const res = await POST(req);
        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("Invalid request body");
    });

    it("returns 400 for invalid date format", async () => {
        const req = createRequest({
            startDate: "07/01/2024", // wrong format
            endDate: "07/05/2024",
        });

        const res = await POST(req);
        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data.success).toBe(false);
    });

    it("returns 401 when authorization header is missing", async () => {
        const req = {
            json: async () => ({ startDate: "2024-07-01", endDate: "2024-07-05" }),
            headers: new Headers(),
        } as unknown as NextRequest;

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it("returns 403 when non-admin submits on behalf of another employee", async () => {
        vi.mocked(TimeOffService.submitRequest).mockRejectedValue(
            new ForbiddenError(
                "Only admins can submit leave requests on behalf of other employees",
            ),
        );

        const req = createRequest({
            startDate: "2024-07-01",
            endDate: "2024-07-05",
            employeeId: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID format
        }, "member"); // explicitly set role to member (non-admin)

        const res = await POST(req);
        expect(res.status).toBe(403);

        const data = await res.json();
        expect(data.message).toContain("Only admins");
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(TimeOffService.submitRequest).mockRejectedValue(
            new Error("DB connection failed"),
        );

        const req = createRequest({ startDate: "2024-07-01", endDate: "2024-07-05" });

        const res = await POST(req);
        expect(res.status).toBe(500);
    });
});

// ─── Business Day Calculation Tests ──────────────────────────────────────────

describe("TimeOffService.calculateBusinessDays", () => {
    // Get the real implementation from the mocked service
    const { calculateBusinessDays } = TimeOffService;

    it("counts 5 business days for Mon–Fri", () => {
        expect(calculateBusinessDays(new Date("2024-07-01"), new Date("2024-07-05"))).toBe(5);
    });

    it("counts 1 day when start equals end on a weekday", () => {
        expect(calculateBusinessDays(new Date("2024-07-01"), new Date("2024-07-01"))).toBe(1);
    });

    it("returns 0 for a weekend-only range (Sat–Sun)", () => {
        expect(calculateBusinessDays(new Date("2024-07-06"), new Date("2024-07-07"))).toBe(0);
    });

    it("returns 0 when endDate is before startDate", () => {
        expect(calculateBusinessDays(new Date("2024-07-05"), new Date("2024-07-01"))).toBe(0);
    });

    it("correctly excludes weekends in a two-week range", () => {
        // 2024-07-01 (Mon) to 2024-07-12 (Fri) = 10 business days
        expect(calculateBusinessDays(new Date("2024-07-01"), new Date("2024-07-12"))).toBe(10);
    });

    it("handles a range starting on Saturday", () => {
        // 2024-07-06 (Sat) to 2024-07-10 (Wed) = 3 business days (Mon, Tue, Wed)
        expect(calculateBusinessDays(new Date("2024-07-06"), new Date("2024-07-10"))).toBe(3);
    });

    it("handles single day on a Monday", () => {
        expect(calculateBusinessDays(new Date("2024-07-08"), new Date("2024-07-08"))).toBe(1);
    });

    it("handles single day on a Saturday", () => {
        expect(calculateBusinessDays(new Date("2024-07-06"), new Date("2024-07-06"))).toBe(0);
    });
});