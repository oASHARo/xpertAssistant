"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icons";

const CURRENT_USER = {
  name: "Leonard Campbell",
  email: "leonard_campbell@xyz.com",
  avatarUrl: "https://i.pravatar.cc/40?img=47",
};

export interface TopbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({ isSidebarOpen, onToggleSidebar }: TopbarProps) {
  return (
    <header className="bg-transparent w-full">
      <div className="bg-white rounded-[0.5rem] shadow-sm py-2 px-6 mx-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-text-main hover:bg-gray-100 flex items-center justify-center"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Image src="/assets/icons/sidebaricon.svg" alt="Toggle sidebar" width={40} height={40} className="h-10 w-10" priority />
        </button>

        <div className="flex items-center gap-6">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
            aria-label="Notifications"
          >
            <div className="relative flex items-center justify-center">
              <Icon src="/assets/icons/notification.svg" className="h-6 w-6 text-text-main" />
              <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white" />
            </div>
          </button>

          <div className="h-10 w-px bg-gray-200" />

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
              <Image
                src={CURRENT_USER.avatarUrl}
                alt={CURRENT_USER.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <p className="text-sm font-semibold text-text-main">{CURRENT_USER.name}</p>
              <p className="text-xs text-text-muted">{CURRENT_USER.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
