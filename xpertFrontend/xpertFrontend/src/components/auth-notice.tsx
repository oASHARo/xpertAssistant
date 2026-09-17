"use client";

import { useEffect, useState } from "react";

export function AuthNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const show = () => {
      const notice = sessionStorage.getItem("auth_notice");
      if (!notice) return;
      sessionStorage.removeItem("auth_notice");
      setMessage(notice);
      window.setTimeout(() => setMessage(null), 5000);
    };
    show();
    window.addEventListener("auth-notice", show);
    return () => window.removeEventListener("auth-notice", show);
  }, []);

  if (!message) return null;
  return (
    <div className="fixed right-5 top-5 z-50 max-w-sm rounded-lg bg-amber-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  );
}
