"use client";

import { useResetPassword } from "@/lib/hooks/use-reset-password";
import { OtpForm } from "../../components/otp-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function VerifyResetOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  
  const { verifyOtp, forgotPassword, isLoading, error } = useResetPassword();

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  if (!email) return null;

  return (
    <OtpForm 
      email={email}
      isLoading={isLoading}
      error={error}
      onSubmit={(code) => verifyOtp({ email, code })}
      onResend={() => forgotPassword({ email })}
      backHref="/login"
      backText="Back to login"
    />
  );
}

export default function VerifyResetOtpPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
      <VerifyResetOtpContent />
    </Suspense>
  );
}
