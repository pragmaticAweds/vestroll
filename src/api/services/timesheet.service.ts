import { db } from "../db";
import { timesheets, employees, users } from "../db/schema";
import { eq, and, count, SQL } from "drizzle-orm";
import { ForbiddenError } from "../utils/errors";
import { GetTimesheetsQuery } from "../validations/timesheet.schema";

export class TimesheetService {
  static async getTimesheets(userId: string, query: GetTimesheetsQuery) {
    const [user] = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.organizationId) {
      throw new ForbiddenError("User is not associated with any organization");
    }

    const conditions: SQL[] = [
      eq(timesheets.organizationId, user.organizationId),
    ];

    if (query.status) {
      conditions.push(eq(timesheets.status, query.status));
    }

    const whereClause = and(...conditions);

    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(timesheets)
      .where(whereClause);

    const offset = (query.page - 1) * query.limit;

    const results = await db
      .select({
        id: timesheets.id,
        employeeId: timesheets.employeeId,
        firstName: employees.firstName,
        lastName: employees.lastName,
        avatarUrl: employees.avatarUrl,
        role: employees.role,
        totalHours: timesheets.totalHours,
        rate: timesheets.rate,
        totalAmount: timesheets.totalAmount,
        status: timesheets.status,
        submittedAt: timesheets.submittedAt,
      })
      .from(timesheets)
      .innerJoin(employees, eq(timesheets.employeeId, employees.id))
      .where(whereClause)
      .limit(query.limit)
      .offset(offset)
      .orderBy(timesheets.submittedAt);

    const formattedResults = results.map((item) => ({
      id: item.id,
      employeeName: `${item.firstName} ${item.lastName}`,
      totalHours: item.totalHours,
      rate: item.rate,
      totalAmount: item.totalAmount,
      status: item.status,
    }));

    return {
      data: formattedResults,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
      },
    };
  }
}
