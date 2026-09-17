"use client";

import { useRegister } from "@/lib/hooks/use-register";
import { OtpForm } from "../../components/otp-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function VerifyRegistrationOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  
  const { verifyOtp, resendOtp, isLoading, error } = useRegister();

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  if (!email) return null;

  return (
    <OtpForm 
      email={email}
      isLoading={isLoading}
      error={error}
      onSubmit={(code) => verifyOtp({ email, code })}
      onResend={() => resendOtp(email)}
      backHref="/register"
      backText="Back to Register"
    />
  );
}

export default function VerifyRegistrationOtpPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
      <VerifyRegistrationOtpContent />
    </Suspense>
  );
}
