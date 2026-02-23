import { db } from "../db";
import { leaveRequests, employees, users } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { ForbiddenError } from "../utils/errors";

export class TimeOffService {
    /**
     * Get all time-off requests for the organization associated with the user.
     * Used by administrators to review and manage team availability.
     */
    static async getTimeOffRequests(userId: string) {
        // 1. Get user's organizationId
        const [user] = await db
            .select({ organizationId: users.organizationId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user?.organizationId) {
            throw new ForbiddenError("User is not associated with any organization");
        }

        // 2. Fetch leave requests with employee details
        const results = await db
            .select({
                id: leaveRequests.id,
                firstName: employees.firstName,
                lastName: employees.lastName,
                type: leaveRequests.leaveType,
                startDate: leaveRequests.startDate,
                endDate: leaveRequests.endDate,
                totalDuration: leaveRequests.totalDuration,
                status: leaveRequests.status,
                submittedAt: leaveRequests.submittedAt,
            })
            .from(leaveRequests)
            .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
            .where(eq(leaveRequests.organizationId, user.organizationId))
            .orderBy(desc(leaveRequests.submittedAt));

        // 3. Format response
        return results.map((req) => ({
            id: req.id,
            employeeName: `${req.firstName} ${req.lastName}`.trim(),
            type: req.type,
            startDate: req.startDate,
            endDate: req.endDate,
            totalDuration: req.totalDuration,
            status: req.status,
            submittedAt: req.submittedAt,
        }));
    }
}