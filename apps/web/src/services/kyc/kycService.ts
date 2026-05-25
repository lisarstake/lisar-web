import { http } from "@/lib/http";
import { IKycApiService } from "./api";
import type {
  KycApiResponse,
  KycStatusData,
  KycVerifyRequest,
  KycVerifyData,
} from "./types";

export class KycService implements IKycApiService {
  async getStatus(): Promise<KycApiResponse<KycStatusData>> {
    try {
      const response = await http.get("/kyc/status");
      return response.data;
    } catch {
      return { success: false, error: { message: "Failed to fetch KYC status" } };
    }
  }

  async verify(
    request: KycVerifyRequest,
  ): Promise<KycApiResponse<KycVerifyData>> {
    try {
      const response = await http.post("/kyc/verify", request);
      return response.data;
    } catch {
      return { success: false, error: { message: "Failed to verify KYC" } };
    }
  }
}
