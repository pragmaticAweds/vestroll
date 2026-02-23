import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AuthUtils } from "@/api/utils/auth";
import { ApiResponse } from "@/api/utils/api-response";
import { AppError } from "@/api/utils/errors";
import { Logger } from "@/api/services/logger.service";
import { AccountDeletionService } from "@/api/services/account-deletion.service";

/**
 * DELETE /api/auth/account
 * Permanently delete authenticated user's account and related data
 */
export async function DELETE(request: NextRequest) {
     try {
          const cookieStore = await cookies();

          const { userId } = await AuthUtils.authenticateRequest(request);

          Logger.info("Account deletion requested", { userId });

          await AccountDeletionService.deleteAccount(userId);

          const response = ApiResponse.success({ message: "Account deleted successfully" });
          response.cookies.delete("refreshToken");

          return response;
     } catch (error) {
          if (error instanceof AppError) {
               Logger.error("Account deletion error", { message: error.message });
               return ApiResponse.error(error.message, error.statusCode);
          }

          Logger.error("Unhandled account deletion error", { error });
          return ApiResponse.error("Internal server error", 500);
     }
}
