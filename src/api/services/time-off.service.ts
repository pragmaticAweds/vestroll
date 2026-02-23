import { and, eq } from "drizzle-orm";
import { db, employees, timeOffRequests } from "../db";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import { hasAdminOrManagerRole } from "../utils/role";
import { EmailService } from "./email.service";

interface UpdateTimeOffStatusInput {
  requestId: string;
  actorOrganizationId: string | null;
  actorRole: string | null;
  actorName: string;
  status: "approved" | "rejected";
  reason?: string;
}

export interface UpdateTimeOffStatusResult {
  id: string;
  status: "approved" | "rejected";
  reason: string | null;
  updatedAt: Date;
}

export class TimeOffService {
  static async updateStatus(
    input: UpdateTimeOffStatusInput,
  ): Promise<UpdateTimeOffStatusResult> {
    if (!input.actorOrganizationId) {
      throw new ForbiddenError("User is not associated with any organization");
    }

    if (!hasAdminOrManagerRole(input.actorRole)) {
      throw new ForbiddenError(
        "Only administrators or managers can update time-off status",
      );
    }

    const [request] = await db
      .select({
        id: timeOffRequests.id,
        employeeEmail: employees.email,
        employeeFirstName: employees.firstName,
      })
      .from(timeOffRequests)
      .innerJoin(employees, eq(timeOffRequests.employeeId, employees.id))
      .where(
        and(
          eq(timeOffRequests.id, input.requestId),
          eq(timeOffRequests.organizationId, input.actorOrganizationId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new NotFoundError("Time-off request not found");
    }

    const [updatedRequest] = await db
      .update(timeOffRequests)
      .set({
        status: input.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(timeOffRequests.id, input.requestId),
          eq(timeOffRequests.organizationId, input.actorOrganizationId),
        ),
      )
      .returning({
        id: timeOffRequests.id,
        status: timeOffRequests.status,
        updatedAt: timeOffRequests.updatedAt,
      });

    if (!updatedRequest) {
      throw new NotFoundError("Time-off request not found");
    }

    const normalizedReason = input.reason?.trim();
    const rejectionReason =
      input.status === "rejected" ? normalizedReason || null : null;

    await this.notifyEmployee({
      to: request.employeeEmail,
      firstName: request.employeeFirstName,
      status: input.status,
      actorName: input.actorName,
      reason: rejectionReason,
    });

    return {
      id: updatedRequest.id,
      status: updatedRequest.status as "approved" | "rejected",
      reason: rejectionReason,
      updatedAt: updatedRequest.updatedAt,
    };
  }

  private static async notifyEmployee(input: {
    to: string;
    firstName: string;
    status: "approved" | "rejected";
    actorName: string;
    reason: string | null;
  }) {
    const statusLabel = input.status === "approved" ? "Approved" : "Rejected";
    const safeFirstName = this.escapeHtml(input.firstName || "there");
    const safeActorName = this.escapeHtml(input.actorName || "a manager");
    const reasonBlock =
      input.status === "rejected" && input.reason
        ? `<p><strong>Reason:</strong> ${this.escapeHtml(input.reason)}</p>`
        : "";

    const html = `
      <h2>Time-off Request ${statusLabel}</h2>
      <p>Hi ${safeFirstName},</p>
      <p>Your time-off request has been <strong>${statusLabel.toLowerCase()}</strong> by ${safeActorName}.</p>
      ${reasonBlock}
      <p>You can log in to your VestRoll dashboard for more details.</p>
    `;

    try {
      await EmailService.send({
        to: input.to,
        subject: `Time-off request ${statusLabel}`,
        html,
      });
    } catch (error) {
      console.error("[Time Off Notification Error]", error);
    }
  }

  private static escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}
import { db, employees, leaveRequests } from "../db";
import { eq, and } from "drizzle-orm";
import { TimeOffRequestInput } from "../validations/time-off.schema";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors";

export class TimeOffService {
    /**
     * Calculate the number of business days (Mon–Fri) between two dates, inclusive.
     */
    static calculateBusinessDays(startDate: Date, endDate: Date): number {
        if (endDate < startDate) return 0;

        let count = 0;
        const current = new Date(startDate);
        current.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        while (current <= end) {
            const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    }

    /**
     * Submit a time-off / leave request.
     * - Team members can submit for themselves (employeeId resolved from their userId).
     * - Admins can submit on behalf of any employee by providing employeeId explicitly.
     */
    static async submitRequest(
        data: TimeOffRequestInput,
        context: {
            userId: string;
            organizationId: string;
            isAdmin: boolean;
        },
    ) {
        const { userId, organizationId, isAdmin } = context;

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        // Validate date range
        if (endDate < startDate) {
            throw new BadRequestError("endDate cannot be before startDate");
        }

        let targetEmployeeId: string;

        if (data.employeeId) {
            // Only admins can submit on behalf of another employee
            if (!isAdmin) {
                throw new ForbiddenError(
                    "Only admins can submit leave requests on behalf of other employees",
                );
            }
            targetEmployeeId = data.employeeId;
        } else {
            // Find the employee record for the current user within this org
            const employee = await db.query.employees.findFirst({
                where: and(
                    eq(employees.userId, userId),
                    eq(employees.organizationId, organizationId),
                ),
            });

            if (!employee) {
                throw new NotFoundError(
                    "No employee record found for the current user in this organization",
                );
            }
            targetEmployeeId = employee.id;
        }

        // Verify the employee belongs to this organization
        const employee = await db.query.employees.findFirst({
            where: and(
                eq(employees.id, targetEmployeeId),
                eq(employees.organizationId, organizationId),
            ),
        });

        if (!employee) {
            throw new NotFoundError("Employee not found in this organization");
        }

        const totalDuration = TimeOffService.calculateBusinessDays(
            startDate,
            endDate,
        );

        const [newRequest] = await db
            .insert(leaveRequests)
            .values({
                organizationId,
                employeeId: targetEmployeeId,
                submittedByUserId: userId,
                leaveType: data.leaveType,
                startDate,
                endDate,
                totalDuration,
                reason: data.reason ?? null,
                status: "Pending",
            })
            .returning({
                id: leaveRequests.id,
                status: leaveRequests.status,
                totalDuration: leaveRequests.totalDuration,
                startDate: leaveRequests.startDate,
                endDate: leaveRequests.endDate,
                leaveType: leaveRequests.leaveType,
                employeeId: leaveRequests.employeeId,
                createdAt: leaveRequests.createdAt,
            });

        return {
            requestId: newRequest.id,
            status: newRequest.status,
            totalDuration: newRequest.totalDuration,
            startDate: newRequest.startDate,
            endDate: newRequest.endDate,
            leaveType: newRequest.leaveType,
            employeeId: newRequest.employeeId,
            createdAt: newRequest.createdAt,
        };
    }
}
