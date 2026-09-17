import { coreClient } from "./core-client";
import type { 
  RegisterRequest, 
  VerifyRegistrationOtpRequest, 
  LoginRequest, 
  ForgotPasswordRequest, 
  VerifyResetOtpRequest, 
  ResetPasswordRequest, 
  AuthResponse 
} from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

async function unwrap<T>(request: Promise<ApiResponse<T>>): Promise<T> {
  return (await request).data;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<void> => {
    await coreClient.post<ApiResponse<null>>("/auth/register", data);
  },

  verifyRegistrationOtp: async (data: VerifyRegistrationOtpRequest): Promise<AuthResponse> => {
    return unwrap(coreClient.post<ApiResponse<AuthResponse>>("/auth/register/verify", data));
  },

  resendRegistrationOtp: async (email: string): Promise<void> => {
    await coreClient.post<ApiResponse<null>>("/auth/register/resend", { email });
  },

  login: async (data: LoginRequest): Promise<import('@/types/auth.types').LoginResponse> => {
    return unwrap(coreClient.post<ApiResponse<import('@/types/auth.types').LoginResponse>>("/auth/login", data));
  },

  verifyLoginOtp: async (data: import('@/types/auth.types').VerifyLoginOtpRequest): Promise<AuthResponse> => {
    return unwrap(coreClient.post<ApiResponse<AuthResponse>>("/auth/login/verify", data));
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await coreClient.post<ApiResponse<null>>("/auth/forgot-password", data);
  },

  verifyResetOtp: async (data: VerifyResetOtpRequest): Promise<{ resetToken: string }> => {
    return unwrap(coreClient.post<ApiResponse<{ resetToken: string }>>("/auth/forgot-password/verify", data));
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await coreClient.post<ApiResponse<null>>("/auth/reset-password", data);
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return unwrap(coreClient.post<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken }));
  },

  logout: async (refreshToken: string): Promise<void> => {
    await coreClient.post<ApiResponse<null>>("/auth/logout", { refreshToken });
  }
};
