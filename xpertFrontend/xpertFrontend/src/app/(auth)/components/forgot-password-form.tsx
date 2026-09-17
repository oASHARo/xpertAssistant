"use client";

import { useState } from "react";
import Link from "next/link";
import { useResetPassword } from "@/lib/hooks/use-reset-password";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading, error } = useResetPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotPassword({ email });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Forgot Password</h1>
        <p className="text-sm text-gray-500">
          Enter your email to receive a password reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !email}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
        
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
