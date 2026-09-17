export interface RegisterRequest {
  email: string;
  password?: string;
}

export interface VerifyRegistrationOtpRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginResponse {
  requiresOtp: true;
  loginToken: string;
  email: string;
}

export interface VerifyLoginOtpRequest {
  loginToken: string;
  code: string;
}
