"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const { login, verifyLoginOtp, isAuthenticated, isInitializing, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.push("/jobs");
    }
  }, [isAuthenticated, isInitializing, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) {
      if (!otpCode) return;
      await verifyLoginOtp(loginToken, otpCode);
    } else {
      if (!email || !password) return;
      const res = await login({ email, password });
      if (res?.requiresOtp) {
        setOtpSent(true);
        setLoginToken(res.loginToken);
      }
    }
  };

  if (isInitializing || isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {otpSent ? "Verification Required" : "Welcome back"}
        </h1>
        <p className="text-sm text-gray-500">
          {otpSent 
            ? "Enter the 6-digit code sent to your email" 
            : "Enter your email and password to sign in"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!otpSent ? (
          <>
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Input
              id="otp"
              type="text"
              label="OTP Code"
              placeholder="123456"
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={isLoading}
              className="w-full text-center tracking-widest text-lg"
              maxLength={6}
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 font-medium text-center">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? (otpSent ? "Verifying..." : "Signing In...") 
            : (otpSent ? "Verify & Log In" : "Sign In")}
        </Button>
        
        {!otpSent && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">Don&apos;t have an account? </span>
            <Link href="/register" className="text-sm font-medium text-primary hover:underline">
              Register
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
