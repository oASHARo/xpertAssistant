"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { NavItem } from "./nav-item";
import { ROUTES, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

import { useAuth } from "@/lib/hooks/use-auth";
export interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { logout } = useAuth();
  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl bg-sidebar py-6 transition-[width] duration-200 ease-in-out",
        isOpen ? "w-[17.5rem] px-6" : "w-20 px-2"
      )}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center">
        <Image
          src="/assets/icons/xpertassistantlogo.svg"
          alt="Xpert Assistant"
          width={150}
          height={40}
          className={cn("transition-all", isOpen ? "h-10 w-auto" : "h-8 w-8")}
          priority
        />
      </div>

      {/* Primary CTA */}
      <Link href={ROUTES.newJob} className="mb-8 block">
        <div
          className={cn(
            "flex w-full items-center gap-3 rounded-xl bg-[#ffffff1a] px-4 py-3 transition-colors hover:bg-[#ffffff2a]",
            !isOpen && "justify-center px-0"
          )}
          title={!isOpen ? "Add Job" : undefined}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <Icon src="/assets/icons/addjob.svg" className="h-4 w-4 text-white" />
          </span>
          {isOpen && (
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-white">Add Job</span>
              <span className="text-xs font-normal text-white/70">Create New Job to Analyze</span>
            </div>
          )}
        </div>
      </Link>

      {/* Primary nav */}
      <nav className={cn("flex flex-1 flex-col gap-3", isOpen && "-mr-6")}>
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} isOpen={isOpen} />
        ))}
      </nav>

      {/* Secondary nav + logout, pinned to bottom */}
      <div className={cn("flex flex-col gap-3 border-t border-white-10 pt-3", isOpen && "-mr-6")}>
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} isOpen={isOpen} />
        ))}

        <button
          onClick={() => logout()}
          className={cn(
            "relative flex items-center gap-3 overflow-hidden bg-danger py-3 pr-4 text-sm font-medium text-white transition-colors hover:bg-danger/90",
            isOpen ? "rounded-l-lg rounded-r-none pl-6" : "justify-center rounded-lg px-0"
          )}
          title={!isOpen ? "Logout" : undefined}
        >
          <Icon src="/assets/icons/logout.svg" className="h-5 w-5" />
          {isOpen && "Logout"}
        </button>

        {isOpen && (
          <div className="mr-6 mt-4 px-1">
            <p className="text-sm text-white/70">
              More Than <span className="font-bold text-white">14,000</span> Expert Use
            </p>
            <p className="text-sm font-bold text-white">Xpert Assistant</p>
            <p className="mt-1 text-xs text-white/50">
              Xpert Assistant sets the standard in CV analysis.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}