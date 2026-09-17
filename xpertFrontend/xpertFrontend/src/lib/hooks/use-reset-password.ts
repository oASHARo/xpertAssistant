"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth.service";
import type { ForgotPasswordRequest, VerifyResetOtpRequest, ResetPasswordRequest } from "@/types/auth.types";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export function useResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data);
      router.push(`/forgot-password/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to process request. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: VerifyResetOtpRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyResetOtp(data);
      router.push(`/reset-password?token=${encodeURIComponent(response.resetToken)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid or expired OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data);
      // Redirect to login on success
      router.push("/login?reset=success");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to reset password. The link might be expired."));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    forgotPassword,
    verifyOtp,
    resetPassword,
    isLoading,
    error,
  };
}
