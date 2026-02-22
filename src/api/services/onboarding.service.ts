import { db, users, companyProfiles, kybVerifications, organizationWallets } from "../db";
import { eq } from "drizzle-orm";

export interface OnboardingStatus {
  emailVerified: boolean;
  companyInfoProvided: boolean;
  kybVerified: boolean;
  walletFunded: boolean;
  progressPercentage: number;
}

export class OnboardingService {
  static async getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    const [user] = await db
      .select({
        status: users.status,
        organizationId: users.organizationId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    const emailVerified = user.status === "active";

    let companyInfoProvided = false;
    let walletFunded = false;

    if (user.organizationId) {
      const [companyProfile] = await db
        .select({ id: companyProfiles.id })
        .from(companyProfiles)
        .where(eq(companyProfiles.organizationId, user.organizationId))
        .limit(1);

      companyInfoProvided = !!companyProfile;

      const [wallet] = await db
        .select({ funded: organizationWallets.funded })
        .from(organizationWallets)
        .where(eq(organizationWallets.organizationId, user.organizationId))
        .limit(1);

      walletFunded = !!wallet?.funded;
    }

    const [kyb] = await db
      .select({ status: kybVerifications.status })
      .from(kybVerifications)
      .where(eq(kybVerifications.userId, userId))
      .limit(1);

    const kybVerified = kyb?.status === "verified";

    const steps = [emailVerified, companyInfoProvided, kybVerified, walletFunded];
    const trueCount = steps.filter(Boolean).length;
    const progressPercentage = (trueCount / 4) * 100;

    return {
      emailVerified,
      companyInfoProvided,
      kybVerified,
      walletFunded,
      progressPercentage,
    };
  }
}
