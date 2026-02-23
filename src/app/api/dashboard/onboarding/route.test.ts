import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { OnboardingService } from "@/api/services/onboarding.service";
import { AuthUtils } from "@/api/utils/auth";
import { UnauthorizedError } from "@/api/utils/errors";

vi.mock("@/api/services/onboarding.service");
vi.mock("@/api/utils/auth");

describe("GET /api/dashboard/onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (): NextRequest => {
    return {} as unknown as NextRequest;
  };

  it("should return 25% progress when only email is verified", async () => {
    const mockUser = { userId: "user-123" };
    const mockStatus = {
      emailVerified: true,
      companyInfoProvided: false,
      kybVerified: false,
      walletFunded: false,
      progressPercentage: 25,
    };

    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue(mockUser as any);
    vi.mocked(OnboardingService.getOnboardingStatus).mockResolvedValue(mockStatus);

    const req = createMockRequest();
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe("Onboarding status retrieved successfully");
    expect(data.data.emailVerified).toBe(true);
    expect(data.data.companyInfoProvided).toBe(false);
    expect(data.data.kybVerified).toBe(false);
    expect(data.data.walletFunded).toBe(false);
    expect(data.data.progressPercentage).toBe(25);
    expect(OnboardingService.getOnboardingStatus).toBeCalledWith("user-123");
  });

  it("should return 100% progress when all steps are complete", async () => {
    const mockUser = { userId: "user-123" };
    const mockStatus = {
      emailVerified: true,
      companyInfoProvided: true,
      kybVerified: true,
      walletFunded: true,
      progressPercentage: 100,
    };

    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue(mockUser as any);
    vi.mocked(OnboardingService.getOnboardingStatus).mockResolvedValue(mockStatus);

    const req = createMockRequest();
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.progressPercentage).toBe(100);
    expect(data.data.emailVerified).toBe(true);
    expect(data.data.companyInfoProvided).toBe(true);
    expect(data.data.kybVerified).toBe(true);
    expect(data.data.walletFunded).toBe(true);
  });

  it("should return 0% progress when no steps are complete", async () => {
    const mockUser = { userId: "user-123" };
    const mockStatus = {
      emailVerified: false,
      companyInfoProvided: false,
      kybVerified: false,
      walletFunded: false,
      progressPercentage: 0,
    };

    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue(mockUser as any);
    vi.mocked(OnboardingService.getOnboardingStatus).mockResolvedValue(mockStatus);

    const req = createMockRequest();
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.progressPercentage).toBe(0);
  });

  it("should return 401 for unauthorized access", async () => {
    vi.mocked(AuthUtils.authenticateRequest).mockRejectedValue(
      new UnauthorizedError(),
    );

    const req = createMockRequest();
    const response = await GET(req);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should return 404 when user not found", async () => {
    const mockUser = { userId: "user-123" };

    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue(mockUser as any);
    vi.mocked(OnboardingService.getOnboardingStatus).mockResolvedValue(null);

    const req = createMockRequest();
    const response = await GET(req);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("User not found");
  });

  it("should return 500 on unexpected server error", async () => {
    const mockUser = { userId: "user-123" };

    vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue(mockUser as any);
    vi.mocked(OnboardingService.getOnboardingStatus).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const req = createMockRequest();
    const response = await GET(req);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Internal server error");
  });
});
