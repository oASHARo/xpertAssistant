"use client";

import { ResetPasswordForm } from "../components/reset-password-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
