"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth.service";
import type { ApiError } from "@/types/api.types";
import type { AuthUser, LoginRequest } from "@/types/auth.types";

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Rehydrate user from storage if available
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          const parsedUser: unknown = JSON.parse(storedUser);
          if (isAuthUser(parsedUser)) {
            setUser(parsedUser);
          }
        }
      } catch {
        // Ignore storage and parse errors
      } finally {
        setIsInitializing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      return response; // Return it so the form can handle the OTP step
    } catch (err: unknown) {
      const message = isApiError(err)
        ? err.message
        : err instanceof Error
          ? err.message
          : "Invalid email or password.";

      if (isApiError(err) && err.status === 403 && message.toLowerCase().includes("not verified")) {
        sessionStorage.setItem("auth_notice", "Your account is not verified. A new OTP has been sent to your email.");
        window.dispatchEvent(new Event("auth-notice"));
        router.push(`/register/verify?email=${encodeURIComponent(credentials.email)}`);
      } else {
        setError(message);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLoginOtp = async (loginToken: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyLoginOtp({ loginToken, code });
      
      // Store tokens and user
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      setUser(response.user);
      
      // Redirect to dashboard
      router.push("/jobs");
      return true;
    } catch (err: unknown) {
      const message = isApiError(err)
        ? err.message
        : err instanceof Error
          ? err.message
          : "Invalid OTP.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors, still clear local state
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
      setUser(null);
      router.push("/login");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isInitializing,
    login,
    verifyLoginOtp,
    logout,
    isLoading,
    error,
  };
}
