import { LayoutGrid, FolderOpen, User, HelpCircle, LucideIcon } from "lucide-react";

export const ROUTES = {
  login: "/login",
  register: "/register",
  jobs: "/jobs",
  newJob: "/jobs/new",
  jobDetail: (jobId: string) => `/jobs/${jobId}`,
  cvs: "/cvs",
  profile: "/profile",
  faq: "/faq",
} as const;

export interface NavConfigItem {
  href: string;
  label: string;
  icon: string; // path under /public
}

export const PRIMARY_NAV_ITEMS: NavConfigItem[] = [
  { href: ROUTES.jobs, label: "Job Dashboard", icon: "/assets/icons/jobdashboard.svg" },
  { href: ROUTES.cvs, label: "Your CV's", icon: "/assets/icons/yourcv.svg" },
  { href: ROUTES.profile, label: "Profile", icon: "/assets/icons/profile.svg" },
];

export const SECONDARY_NAV_ITEMS: NavConfigItem[] = [
  { href: ROUTES.faq, label: "FAQ's", icon: "/assets/icons/faq.svg" },
];