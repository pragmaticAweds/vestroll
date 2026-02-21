import { db, users } from "../db";
import { eq } from "drizzle-orm";

export interface UserSummary {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string | null;
  organizationName: string | null;
}

export class DashboardService {
  static async getUserSummary(userId: string): Promise<UserSummary | null> {
    const [user] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: null,
      role: null,
      organizationName: null,
    };
  }
}
