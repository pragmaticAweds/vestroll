import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { LogoutService } from "@/api/services/logout.service";
import { ApiResponse } from "@/api/utils/api-response";
import { AuthUtils } from "@/api/utils/auth";
import { AppError } from "@/api/utils/errors";
import { logoutSchema } from "@/api/validations/auth-logout.schema";
import { Logger } from "@/api/services/logger.service";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get("refreshToken")?.value;

        let refreshToken = cookieToken;

        if (!refreshToken) {
            try {
                const body = await request.json();
                const validation = logoutSchema.safeParse(body);
                if (validation.success && validation.data.refreshToken) {
                    refreshToken = validation.data.refreshToken;
                }
            } catch {
                // Ignore body error
            }
        }

        const ipAddress = AuthUtils.getClientIp(request);
        const userAgent = AuthUtils.getUserAgent(request);

        Logger.info("Logout attempt initiated", { ip: ipAddress });

        await LogoutService.logout(refreshToken, { userAgent, ipAddress });

        const response = ApiResponse.success({ message: "Logged out successfully" });
        response.cookies.delete("refreshToken");

        return response;

    } catch (error) {
        if (error instanceof AppError) {
            if (error.statusCode === 500) {
                Logger.error("Logout internal error", { message: error.message });
                return ApiResponse.error(error.message, 500);
            }
        }
        Logger.error("Unhandled logout error", { error });
        return ApiResponse.error("Internal server error", 500);
    }
}
