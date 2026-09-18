"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";

/**
 * Every route under app/(dashboard)/* renders inside this shell.
 * Because layouts persist across navigation in the App Router,
 * Sidebar/Topbar do NOT remount when moving between Job Dashboard,
 * CV Manager, Profile, etc. — matching the mockups, where the sidebar
 * never flickers or resets scroll position on navigation.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // Prevent rendering dashboard layout until verified
  }

  return (
    <div className="flex h-screen gap-4 overflow-hidden bg-bg-card p-4">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}