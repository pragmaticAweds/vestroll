import { db, kybVerifications, kybStatusEnum } from "../db";
import { eq } from "drizzle-orm";

export type KybStatus = (typeof kybStatusEnum.enumValues)[number];

export class KybService {
  static async getStatus(userId: string) {
    const [verification] = await db
      .select()
      .from(kybVerifications)
      .where(eq(kybVerifications.userId, userId))
      .limit(1);

    if (!verification) {
      return {
        status: "not_started" as KybStatus,
        rejectionReason: null,
        submittedAt: null,
      };
    }

    return {
      status: verification.status,
      rejectionReason: verification.rejectionReason,
      submittedAt: verification.submittedAt,
    };
  }
}
