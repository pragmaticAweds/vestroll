import { NextRequest } from "next/server";
import { ApiResponse } from "@/api/utils/api-response";
import { AppError } from "@/api/utils/errors";
import { AuthUtils } from "@/api/utils/auth";
import { OnboardingService } from "@/api/services/onboarding.service";

/**
 * @swagger
 * /api/dashboard/onboarding:
 *   get:
 *     summary: Get onboarding status
 *     description: Retrieve the organization's onboarding progress across email verification, company profile, KYB verification, and wallet funding
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emailVerified:
 *                   type: boolean
 *                 companyInfoProvided:
 *                   type: boolean
 *                 kybVerified:
 *                   type: boolean
 *                 walletFunded:
 *                   type: boolean
 *                 progressPercentage:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await AuthUtils.authenticateRequest(req);

    const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);

    if (!onboardingStatus) {
      return ApiResponse.error("User not found", 404);
    }

    return ApiResponse.success(onboardingStatus, "Onboarding status retrieved successfully");
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }

    console.error("[Onboarding Status Error]", error);
    return ApiResponse.error("Internal server error", 500);
  }
}
