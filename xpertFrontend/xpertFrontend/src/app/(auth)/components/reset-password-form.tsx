"use client";

import { useState } from "react";
import { useResetPassword } from "@/lib/hooks/use-reset-password";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { resetPassword, isLoading, error } = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMatchError(null);
    
    if (!newPassword || !confirmPassword) return;
    
    if (newPassword !== confirmPassword) {
      setMatchError("Passwords don't match");
      return;
    }
    
    resetPassword({ resetToken: token, newPassword, confirmPassword });
  };

  const handleConfirmBlur = () => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setMatchError("Passwords don't match");
    } else {
      setMatchError(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="newPassword"
            type="password"
            label="New password"
            required
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (matchError && e.target.value === confirmPassword) {
                setMatchError(null);
              }
            }}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (matchError && newPassword === e.target.value) {
                setMatchError(null);
              }
            }}
            onBlur={handleConfirmBlur}
            error={matchError || undefined}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !!matchError || !newPassword || !confirmPassword}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
        
        <div className="text-center mt-4">
          <button 
             type="button" 
             onClick={() => router.push("/login")}
             className="text-sm text-gray-500 hover:underline"
           >
             Back to login
           </button>
        </div>
      </form>
    </div>
  );
}
