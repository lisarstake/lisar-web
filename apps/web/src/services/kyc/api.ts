import type {
  KycApiResponse,
  KycStatusData,
  KycVerifyRequest,
  KycVerifyData,
} from "./types";

export interface IKycApiService {
  getStatus(): Promise<KycApiResponse<KycStatusData>>;
  verify(request: KycVerifyRequest): Promise<KycApiResponse<KycVerifyData>>;
}
