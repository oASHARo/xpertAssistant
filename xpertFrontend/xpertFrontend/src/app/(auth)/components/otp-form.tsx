"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OtpFormProps {
  email: string;
  isLoading: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
  onResend?: () => void;
  backHref: string;
  backText: string;
}

export function OtpForm({ 
  email, 
  isLoading, 
  error, 
  onSubmit, 
  onResend,
  backHref,
  backText
}: OtpFormProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    onSubmit(otp);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Check your email</h1>
        <p className="text-sm text-gray-500">
          We&apos;ve sent a verification code to <br/>
          <span className="font-semibold text-gray-900">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="otp"
            type="text"
            label="One-Time Password"
            placeholder="123456"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
            className="w-full text-center tracking-widest text-lg"
            maxLength={6}
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || otp.length < 4}>
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
        
        <div className="flex flex-col items-center gap-2 mt-4">
           {onResend && (
             <button 
               type="button" 
               onClick={onResend}
               disabled={isLoading}
               className="text-sm text-primary hover:underline disabled:opacity-50"
             >
               Didn&apos;t receive a code? Resend
             </button>
           )}
           <Link 
             href={backHref}
             className="text-sm text-gray-500 hover:underline"
           >
             {backText}
           </Link>
        </div>
      </form>
    </div>
  );
}
