import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { TokenRefreshService } from "@/api/services/token-refresh.service";
import { ApiResponse } from "@/api/utils/api-response";
import { AuthUtils } from "@/api/utils/auth";
import { AppError } from "@/api/utils/errors";
import { refreshSchema } from "@/api/validations/auth-refresh.schema";
import {
    InvalidTokenFormatError, // Validating presense doesn't use this but keeps the file clean?
    InvalidTokenSignatureError,
    ExpiredTokenError,
    TokenSessionMismatchError,
    SessionNotFoundError
} from "@/api/utils/auth-errors";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get("refreshToken")?.value;

        let refreshToken = cookieToken;

        // If no cookie, check body
        if (!refreshToken) {
            try {
                const body = await request.json();
                const validation = refreshSchema.safeParse(body);
                if (validation.success) {
                    refreshToken = validation.data.refreshToken;
                }
            } catch {
                // Body reading failed or JSON invalid, ignore
            }
        }

        if (!refreshToken) {
            // Validate token presence (400) - Schema validation logic
            return ApiResponse.error("Refresh token is required", 400);
        }

        const ipAddress = AuthUtils.getClientIp(request);
        const userAgent = AuthUtils.getUserAgent(request);

        // Call service
        const result = await TokenRefreshService.refresh(refreshToken, userAgent, ipAddress);

        // Set new cookie
        const response = ApiResponse.success(result, "Token refreshed successfully");

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
            // We do not have "rememberMe" info here easily unless we passed it back or derived it.
            // We'll set a reasonable default or try to match the token expiry if possible.
            // `TokenRefreshService` returned `refreshToken` but we don't know the explicit MaxAge we set.
            // However, we know `generateRotatedRefreshToken` preserved expected expiry.
            // We should probably rely on `session.expiresAt` logic but we can use 30 days as safe upper bound or 7 days.
            // The cookie expiration is less critical than the token expiration for security, but UX wise it matters.
            // Let's use 7 days default or if `result.refreshToken` has expiry... we'd need to decode it.
            // We can use 30 days as a safe generic cookie life, blocking happens at validation.
            maxAge: 30 * 24 * 60 * 60,
        };

        // Better: Decoding the NEW token to find its expiration for the cookie.
        // Or just accept generic 30 days for now to ensure persistence.
        response.cookies.set("refreshToken", result.refreshToken, cookieOptions);

        return response;

    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(error.message, error.statusCode, error.errors);
        }

        // Map known auth errors just in case they aren't instances of AppError (shouldn't happen with our setup)
        // But we are catching everything.

        console.error("Refresh route error:", error);
        return ApiResponse.error("Internal server error", 500);
    }
}
