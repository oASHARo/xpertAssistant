"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth.service";
import type { RegisterRequest, VerifyRegistrationOtpRequest } from "@/types/auth.types";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      router.push(`/register/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: VerifyRegistrationOtpRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyRegistrationOtp(data);
      
      // The backend returns tokens here, but per requirements we force the user
      // to go through the explicit login flow to get their login OTP.
      // So we intentionally DO NOT save the tokens to localStorage.
      
      // Redirect to login page
      router.push("/login");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resendRegistrationOtp(email);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resend OTP."));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    verifyOtp,
    resendOtp,
    isLoading,
    error,
  };
}
