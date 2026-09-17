"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icons";

export interface NavItemProps {
  href: string;
  label: string;
  icon: string; // svg path
  isOpen?: boolean;
}

export function NavItem({ href, label, icon, isOpen = true }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={!isOpen ? label : undefined}
      className={cn(
        "relative flex items-center gap-3 overflow-hidden py-3 pr-4 text-sm font-medium transition-colors",
        isOpen ? "rounded-l-lg rounded-r-none pl-6" : "justify-center rounded-lg px-0",
        isActive ? "bg-bg-card text-primary" : "bg-white-10 text-white hover:bg-white-18"
      )}
    >
      {isOpen && isActive && (
        <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
      )}

      <Icon src={icon} className="h-5 w-5" />
      {isOpen && <span className="flex-1 whitespace-nowrap">{label}</span>}
      {isOpen && !isActive && <ChevronRight className="h-4 w-4 shrink-0 text-white/70" />}
    </Link>
  );
}