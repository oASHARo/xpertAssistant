Project Structure
src/
├── app/
│   ├── (auth)/                            # Auth Route Group
│   │   ├── components/
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── otp-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── reset-password-form.tsx
│   │   ├── forgot-password/
│   │   │   ├── verify/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   ├── verify/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx                     # Shared Auth Layout
│   │
│   ├── (dashboard)/                       # Main application shell
│   │   ├── components/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── nav-item.tsx
│   │   ├── layout.tsx
│   │   │
│   │   ├── jobs/
│   │   │   ├── components/
│   │   │   │   ├── job-card.tsx
│   │   │   │   ├── job-grid.tsx
│   │   │   │   └── job-search-bar.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── new/
│   │   │   │   ├── components/
│   │   │   │   │   ├── step-job-details.tsx
│   │   │   │   │   ├── step-set-criteria.tsx
│   │   │   │   │   ├── step-upload-resume.tsx
│   │   │   │   │   ├── criteria-card.tsx
│   │   │   │   │   └── wizard-context.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── [jobId]/
│   │   │       ├── components/
│   │   │       │   ├── job-score-panel.tsx
│   │   │       │   ├── candidate-card.tsx
│   │   │       │   ├── candidate-list.tsx
│   │   │       │   └── score-donut-group.tsx
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   │
│   │   ├── cvs/
│   │   │   ├── components/
│   │   │   │   ├── folder-grid.tsx
│   │   │   │   ├── file-card.tsx
│   │   │   │   ├── cvs-toolbar.tsx
│   │   │   │   └── upload-modal.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [folderId]/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── faq/
│   │       └── page.tsx
│   │
│   ├── layout.tsx                         # Root layout
│   ├── globals.css
│   └── page.tsx                           # Landing / Root redirect
│
├── components/
│   └── ui/                                # Reused UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── modal.tsx
│       ├── donut-chart.tsx
│       ├── progress-bar.tsx
│       ├── skill-tag.tsx
│       └── stepper.tsx
│
├── lib/
│   ├── api/                               # Matched with screenshot
│   │   ├── analysis.service.ts
│   │   ├── auth.service.ts
│   │   ├── candidates.service.ts
│   │   ├── core-client.ts
│   │   ├── cvs.service.ts
│   │   ├── env.ts
│   │   ├── jobs.service.ts
│   │   └── mock-store.ts
│   ├── hooks/                             # Matched with screenshot
│   │   ├── use-auth.ts
│   │   ├── use-register.ts
│   │   └── use-reset-password.ts
│   ├── mock-data/                         # 🔄 Fully expanded JSON files
│   │   ├── candidates.json
│   │   ├── criteria.json
│   │   ├── cv-files.json
│   │   ├── cv-folders.json
│   │   ├── job-detail.json
│   │   └── jobs.json
│   ├── utils/                             # Matched with screenshot
│   │   ├── cn.ts
│   │   └── format-date.ts
│   └── constants.ts
│
├── types/                                 # Matched with screenshot
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── candidate.types.ts
│   ├── cv.types.ts
│   └── job.types.ts
│
└── providers/
    ├── query-provider.tsx
    └── toast-provider.tsx

.env.local
.env.example


app/(dashboard)/components/sidebar.tsx
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { NavItem } from "./nav-item";
import { ROUTES, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl bg-sidebar py-6 transition-[width] duration-200 ease-in-out",
        isOpen ? "w-[280px] px-6" : "w-20 px-2"
      )}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center">
        <img
          src="/assets/icons/xpertassistantlogo.svg"
          alt="Xpert Assistant"
          className={cn("transition-all", isOpen ? "h-10 w-auto" : "h-8 w-8")}
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

app/(dashboard)/components/topbar.tsx
"use client";

import Image from "next/image";
import { PanelLeftClose, PanelLeftOpen, Bell } from "lucide-react";

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
      <div className="bg-white rounded-[0.5rem] shadow-sm py-2 px-6 mx-4 mt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-text-main hover:bg-gray-100 flex items-center justify-center"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {/* Using custom sidebar icon as requested */}
          <div className="h-6 w-6 text-text-main [&>svg]:text-primary flex flex-col justify-center gap-1">
             <div className="w-5 h-0.5 bg-black rounded-full" />
             <div className="w-5 h-0.5 bg-primary rounded-full" />
             <div className="w-5 h-0.5 bg-black rounded-full" />
          </div>
        </button>

        <div className="flex items-center gap-6">
          <button
            className="relative rounded-lg p-2 text-text-main hover:bg-gray-100"
            aria-label="Notifications"
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border border-white" />
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-md p-1">
              <Image
                src={CURRENT_USER.avatarUrl}
                alt={CURRENT_USER.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-md object-cover"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-main">{CURRENT_USER.name}</p>
              <p className="text-xs text-text-muted">{CURRENT_USER.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


app/(dashboard)/components/nav-item.tsx.tsx
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


app/(dashboard)/layout.tsx
"use client";

import { useState } from "react";
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

  return (
    <div className="flex h-screen gap-4 overflow-hidden bg-bg-card p-4">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="min-w-0 flex-1 overflow-hidden p-6">{children}</main>
      </div>
    </div>
  );
}

app/(dashboard)/jobs/components/job-card.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatioBar } from "@/components/ui/progress-bar";
import { formatCardDate } from "@/lib/utils/format-date";
import { ROUTES } from "@/lib/constants";
import type { Job } from "@/types/job.types";

export interface JobCardProps {
  job: Job;
}

/**
 * Route-local to /jobs — this exact card layout (short-list badge,
 * resume badge, ratio bar) only ever appears on the Job Dashboard grid,
 * so per the hybrid convention it lives in jobs/components, not the
 * global ui/ folder. It composes global primitives (Card, Badge, RatioBar)
 * rather than duplicating their styling.
 */
export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={ROUTES.jobDetail(job.id)}>
      <Card className="border-0 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="m-3 min-w-0">
            <p className="mb-2 text-xs text-gray-400">{job.category}</p>
            <CardTitle className="truncate">{job.title}</CardTitle>
          </div>
          <div className="flex shrink-0 gap-2">
            <Badge variant="green">Short-List: {job.shortListCount}</Badge>
            <Badge variant="cyan">Resume: {job.resumeCount}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="ml-3 mt-4 mb-4 line-clamp-2 text-text-main">{job.description}</p>

          <div className="m-3">
            <p className="mb-1.5 text-sm font-semibold text-text-main">Analysis Ratio</p>
            <RatioBar matchedPercent={job.analysisRatio.matchedPercent} />
          </div>

          {job.skills.length > 0 && (
            <div className="m-3 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-text-main">Skills Set:</span>
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="cyan">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="m-3">
          <span className="text-xs text-gray-400">
            Created on <span className="font-semibold text-text-main">{formatCardDate(job.createdAt)}</span>
          </span>
          <span className="text-xs text-gray-400 break-all">{job.createdByEmail}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}


app/(dashboard)/jobs/components/job-grid.tsx
import { JobCard } from "./job-card";
import type { Job } from "@/types/job.types";

export interface JobGridProps {
  jobs: Job[];
}

export function JobGrid({ jobs }: JobGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm font-medium text-gray-700">No jobs found</p>
        <p className="mt-1 text-sm text-gray-400">
          Try adjusting your search, or create a new job to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {jobs.map((job) => (
        <div key={job.id} className="mb-4 break-inside-avoid">
          <JobCard job={job} />
        </div>
      ))}
    </div>
  );
}

app/(dashboard)/jobs/components/job-search-bar.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";

const SUGGESTION_SKILLS = ["Deep Learning", "Programming", "Computer vision", "NLP"];

/**
 * "use client" because this needs input state + router navigation.
 * Deliberately drives search through the URL (?search=...) rather than
 * local state passed via props — this keeps page.tsx (a Server Component)
 * as the single source of truth for "what jobs are shown," and means a
 * search is shareable/bookmarkable and survives a refresh.
 */
export function JobSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  function runSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.push(`${ROUTES.jobs}?${params.toString()}`);
  }

  function handleSuggestionClick(skill: string) {
    setQuery(skill);
    runSearch(skill);
  }

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
            placeholder="AI Machine Learning, etc."
          />
        </div>
        <Button onClick={() => runSearch(query)} leftIcon={<Search className="h-4 w-4" />}>
          Search
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400">Suggestion Skills</span>
        {SUGGESTION_SKILLS.map((skill) => (
          <button key={skill} onClick={() => handleSuggestionClick(skill)}>
            <Badge variant="blue">{skill}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}


app/(dashboard)/jobs/page.tsx
import { JobGrid } from "./components/job-grid";
import { JobSearchBar } from "./components/job-search-bar";
import { jobsService } from "@/lib/api/jobs.service";
import type { Job } from "@/types/job.types";

interface JobDashboardPageProps {
  searchParams: Promise<{ search?: string }>;
}

/**
 * Server Component — reads ?search= from the URL (set by JobSearchBar,
 * a Client Component) and passes it straight to jobsService.getAll().
 * This keeps filtering server-driven: no client-side array filtering,
 * no duplicate "what jobs match" logic — the backend is the single
 * source of truth for search results, exactly as it will be in production.
 */
export default async function JobDashboardPage({ searchParams }: JobDashboardPageProps) {
  const { search } = await searchParams;

  let jobs: Job[] = [];
  let total = 0;
  let fetchFailed = false;

  try {
    const response = await jobsService.getAll(search ? { search } : undefined);
    jobs = response.data;
    total = response.meta.total;
  } catch {
    fetchFailed = true;
  }

  return (
    <div className="flex h-full flex-col">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Job Dashboard</h1>
        <div className="mt-4">
          <JobSearchBar />
        </div>
        {fetchFailed ? (
          <p className="mt-4 text-sm text-amber-600">...</p>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Showing {total} related results
            <span className="ml-2 text-gray-300">Search as per your reference</span>
          </p>
        )}
      </div>

      <div className="mt-4 min-w-0 flex-1 overflow-y-auto pr-1">
        <JobGrid jobs={jobs} />
      </div>
    </div>
  );
}


app/(dashboard)/jobs/loading.tsx
export default function JobDashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 rounded bg-gray-200" />

      <div className="mt-4 flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-100" />
        <div className="h-10 w-24 rounded-lg bg-gray-200" />
      </div>

      <div className="mt-4 h-4 w-48 rounded bg-gray-100" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-56 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

app/(dashboard)/jobs/new/components/step-job-details.tsx
"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWizard } from "./wizard-context";
import type { JobCategory } from "@/types/job.types";

const CATEGORY_OPTIONS: JobCategory[] = [
  "Development",
  "Human Resources",
  "AI/ML",
  "Software Engineering",
  "Data Science",
  "Product Design",
  "User Experience",
  "Quality Assurance",
  "Logistics",
];

const DESCRIPTION_MIN = 150;
const DESCRIPTION_MAX = 10000;

export function StepJobDetails() {
  const { state, dispatch } = useWizard();
  const [skillDraft, setSkillDraft] = useState("");

  function handleAddSkill() {
    const trimmed = skillDraft.trim();
    if (trimmed) {
      dispatch({ type: "ADD_SKILL", skill: trimmed });
      setSkillDraft("");
    }
  }

  function handleNext() {
    // Real validation (required fields, description length) will use
    // a schema library once we introduce React Hook Form + Zod for step 2/3
    // form complexity — kept minimal here since step 1 is intentionally simple.
    dispatch({ type: "SET_STEP", step: "criteria" });
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-text-main">Job Details</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
        <Input
          label="Job Title"
          value={state.title}
          onChange={(e) => dispatch({ type: "SET_JOB_DETAILS", payload: { title: e.target.value } })}
          placeholder="e.g. Senior Technical Recruiter"
        />

        <div className="w-full relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-text-muted z-10">Select Category</label>
          <select
            value={state.category}
            onChange={(e) =>
              dispatch({ type: "SET_JOB_DETAILS", payload: { category: e.target.value as JobCategory } })
            }
            className="w-full bg-transparent border border-border-light rounded-md px-4 py-3 text-text-main transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Add Job Code"
          value={state.jobCode}
          onChange={(e) => dispatch({ type: "SET_JOB_DETAILS", payload: { jobCode: e.target.value } })}
          placeholder="Optional"
        />

        <Input
          label="Embedded Email"
          type="email"
          value={state.embeddedEmail}
          onChange={(e) => dispatch({ type: "SET_JOB_DETAILS", payload: { embeddedEmail: e.target.value } })}
          placeholder="Optional"
        />
      </div>

      <div className="mt-8">
        <div className="w-full rounded-md border border-border-light overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <div className="bg-gray-50 border-b border-border-light px-4 py-2 flex gap-3 text-text-main items-center">
            <span className="font-bold cursor-pointer px-1">B</span>
            <span className="italic cursor-pointer px-1">i</span>
            <span className="underline cursor-pointer px-1">U</span>
            <span className="cursor-pointer px-1 ml-2 text-sm">A:</span>
            <span className="cursor-pointer px-1 ml-2">≡</span>
            <span className="cursor-pointer px-1">≣</span>
            <span className="cursor-pointer px-1 text-sm">:=</span>
          </div>
          <textarea
            value={state.description}
            onChange={(e) => dispatch({ type: "SET_JOB_DETAILS", payload: { description: e.target.value } })}
            rows={6}
            maxLength={DESCRIPTION_MAX}
            className="w-full bg-white p-4 text-sm text-text-main focus:outline-none"
            placeholder="Describe the role, responsibilities, and requirements..."
          />
        </div>
        <p className="mt-1 text-right text-xs text-text-muted">
          {state.description.length} / Min: {DESCRIPTION_MIN} - Max: {DESCRIPTION_MAX} characters
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-text-main">Skills</label>
        <p className="mb-3 text-xs text-text-muted">
          Add skill keywords (max 10) to make your job more visible to the right candidates.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {state.skills.map((skill) => (
            <Badge key={skill} variant="blue" className="gap-2 bg-primary text-white rounded-full px-4 py-1.5 font-medium text-sm">
              {skill}
              <button
                type="button"
                onClick={() => dispatch({ type: "REMOVE_SKILL", skill })}
                aria-label={`Remove ${skill}`}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-1">
            <input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type..."
              disabled={state.skills.length >= 10}
              className="h-9 w-24 rounded-full border border-dashed border-border-light bg-white px-3 text-sm text-text-main focus:border-primary focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={state.skills.length >= 10}
              className="bg-white border border-primary text-primary rounded-full px-4 py-1.5 flex items-center gap-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              aria-label="Add skill"
            >
              Add Skills <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={!state.title || !state.category} className="px-6 py-2.5">
          Save Job
        </Button>
      </div>
    </div>
  );
}

app/(dashboard)/jobs/new/components/step-set-criteria.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CriteriaCard } from "./criteria-card";
import { useWizard } from "./wizard-context";
import { analysisService } from "@/lib/api/analysis.service";
import type { JobCriterion } from "@/types/job.types";

export function StepSetCriteria() {
  const { state, dispatch } = useWizard();
  const [numberOfCriteria, setNumberOfCriteria] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerateCriteria() {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      // This is the AI service call — separate backend, separate client
      // (aiClient, not coreClient), which is why analysisService exists
      // as its own file rather than living in jobs.service.ts.
      const response = await analysisService.generateCriteria({
        jobTitle: state.title,
        description: state.description,
        skills: state.skills,
        numberOfCriteria,
      });
      dispatch({ type: "SET_CRITERIA", criteria: response.data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate criteria. Please try again.";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAddManualCriterion() {
    const newCriterion: JobCriterion = {
      id: crypto.randomUUID(),
      title: "New Criterion",
      ratingCalculationExplanation: "Describe how this criterion should be evaluated.",
      idealAnswer: "",
    };
    dispatch({ type: "ADD_CRITERION", criterion: newCriterion });
  }

  function handleIdealAnswerChange(id: string, value: string) {
    dispatch({
      type: "SET_CRITERIA",
      criteria: state.criteria.map((c) => (c.id === id ? { ...c, idealAnswer: value } : c)),
    });
  }

  function handleDeleteCriterion(id: string) {
    dispatch({ type: "REMOVE_CRITERION", criterionId: id });
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-text-main">Criteria for Resume</h2>
      <p className="mb-4 text-sm text-text-muted">
        Criteria will be pulled from the previous Job Description for resume ranking.
      </p>

      <div className="flex items-end gap-3">
        <div className="max-w-xs flex-1">
          <Input
            label="Number of Criteria"
            type="number"
            min={1}
            max={10}
            value={numberOfCriteria}
            onChange={(e) => setNumberOfCriteria(Number(e.target.value))}
          />
        </div>
        <Button onClick={handleGenerateCriteria} isLoading={isGenerating} className="px-6 py-2.5">
          Generate Criteria
        </Button>
      </div>

      {generateError && <p className="mt-2 text-sm text-danger">{generateError}</p>}

      {state.criteria.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-main">System Generated Criteria</h3>
              <p className="text-xs text-text-muted">
                You can adjust the number 0-10 based on your job description for results that fit you better!
              </p>
            </div>
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddManualCriterion}>
              Add Criteria
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {state.criteria.map((criterion, index) => (
              <CriteriaCard
                key={criterion.id}
                criterion={criterion}
                index={index}
                onIdealAnswerChange={handleIdealAnswerChange}
                onDelete={handleDeleteCriterion}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" className="text-text-light border border-border-light bg-transparent px-6 py-2 rounded-md hover:bg-gray-50" onClick={() => dispatch({ type: "SET_STEP", step: "details" })}>
          Back
        </Button>
        <Button
          onClick={() => dispatch({ type: "SET_STEP", step: "upload" })}
          disabled={state.criteria.length === 0}
          className="px-6 py-2.5"
        >
          Save Criteria
        </Button>
      </div>
    </div>
  );
}

app/(dashboard)/jobs/new/components/step-upload-resume.tsx
"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizard } from "./wizard-context";
import { cvsService } from "@/lib/api/cvs.service";
import { jobsService } from "@/lib/api/jobs.service";
import type { JobCategory } from "@/types/job.types";

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface UploadItem {
  id: string; // local-only id, keys the list before we have a server fileId
  file: File;
  status: UploadStatus;
  serverFileId?: string;
  errorMessage?: string;
}

const ACCEPTED_TYPES = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE_MB = 5;

export function StepUploadResume() {
  const { state, dispatch } = useWizard();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addFiles(fileList: FileList) {
    const newItems: UploadItem[] = Array.from(fileList)
      .filter((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024)
      .map((file) => ({ id: crypto.randomUUID(), file, status: "pending" as const }));

    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach(uploadItem);
  }

  /**
   * Each file uploads independently and updates only its own list entry.
   * This means one failed upload (e.g. backend down) doesn't block or
   * roll back the others — matches the mockup, which shows individual
   * per-file progress bars, not one shared bar for the whole batch.
   */
  async function uploadItem(item: UploadItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i)));

    try {
      const response = await cvsService.uploadResume(item.file);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "success", serverFileId: response.data.id } : i
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "error", errorMessage: message } : i))
      );
    }
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  const successfulUploads = items.filter((i) => i.status === "success" && i.serverFileId);

  async function handleAnalyzeResume() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // state.category is typed as JobCategory | "" in the draft wizard
      // state (empty before the user picks one on step 1). Step 1's Next
      // button is disabled until a category is chosen, so by the time a
      // user reaches step 3 this cast to JobCategory is always safe.
      const payload = {
        title: state.title,
        category: state.category as JobCategory,
        jobCode: state.jobCode || undefined,
        embeddedEmail: state.embeddedEmail || undefined,
        description: state.description,
        skills: state.skills,
        criteria: state.criteria.map(({ id, ...rest }) => rest),
        resumeFileIds: successfulUploads.map((i) => i.serverFileId!),
      };

      const response = await jobsService.create(payload);
      dispatch({ type: "RESET" });
      router.push(`/jobs/${response.data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create job. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-main">Upload Resumes</h2>
          <p className="text-sm text-text-muted">
            Easily upload multiple CVs at once to streamline hiring and quickly evaluate candidates.
          </p>
        </div>
        {/* "Upload From My CV's" (browsing existing folders) depends on
            the CV Manager screens being built — wired up once that exists,
            not blocking this step today. */}
        <Button variant="outline" className="text-text-light border border-border-light bg-transparent px-6 py-2 rounded-md hover:bg-gray-50" size="sm" disabled title="Coming once CV Manager is built">
          Upload From My CV&apos;s
        </Button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10 transition-colors ${
          isDragging ? "border-primary bg-bg-card" : "border-primary/40 bg-white hover:bg-bg-card text-primary"
        }`}
      >
        <UploadCloud className="mb-2 h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-primary">Click to upload file, folder or drag and drop</p>
        <p className="mt-1 text-xs text-text-muted">PDF &amp; DOCX only. Max file size: {MAX_FILE_SIZE_MB}MB</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border-light bg-white p-4 shadow-sm">
              <FileText className="h-8 w-8 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-main">{item.file.name}</p>
                <p className="text-xs text-text-muted">{(item.file.size / 1024 / 1024).toFixed(1)} MB</p>
                {item.status === "uploading" && (
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-border-light">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
                  </div>
                )}
                {item.status === "error" && (
                  <p className="mt-0.5 text-xs text-danger">{item.errorMessage}</p>
                )}
              </div>
              {item.status === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />}
              {item.status === "error" && <XCircle className="h-5 w-5 shrink-0 text-danger" />}
              <button
                onClick={() => removeItem(item.id)}
                className="shrink-0 rounded-md p-2 text-danger hover:bg-danger-10 transition-colors"
                aria-label={`Remove ${item.file.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {submitError && <p className="mt-3 text-sm text-danger">{submitError}</p>}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" className="text-text-light border border-border-light bg-transparent px-6 py-2 rounded-md hover:bg-gray-50" onClick={() => dispatch({ type: "SET_STEP", step: "criteria" })}>
          Back
        </Button>
        <Button
          onClick={handleAnalyzeResume}
          isLoading={isSubmitting}
          disabled={successfulUploads.length === 0}
          className="px-6 py-2.5"
        >
          Analyze Resume
        </Button>
      </div>
    </div>
  );
}

app/(dashboard)/jobs/new/components/criteria-card.tsx
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { JobCriterion } from "@/types/job.types";

export interface CriteriaCardProps {
  criterion: JobCriterion;
  index: number;
  onIdealAnswerChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}

export function CriteriaCard({ criterion, index, onIdealAnswerChange, onDelete }: CriteriaCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted">Criteria {index + 1}</p>
          <h4 className="mt-0.5 text-sm font-semibold text-text-main">{criterion.title}</h4>
        </div>
        <button
          onClick={() => onDelete(criterion.id)}
          className="rounded-md p-2 text-danger hover:bg-danger-10 transition-colors"
          aria-label={`Remove ${criterion.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-text-muted">Rating Calculation</p>
        <p className="mt-1 text-xs text-text-muted">{criterion.ratingCalculationExplanation}</p>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-text-muted">Ideal answer</label>
        <input
          value={criterion.idealAnswer}
          onChange={(e) => onIdealAnswerChange(criterion.id, e.target.value)}
          placeholder="required"
          className="mt-1 h-8 w-full rounded-md border border-border-light bg-white px-2.5 text-xs text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
    </Card>
  );
}

app/(dashboard)/jobs/new/components/wizard-context.tsx
"use client";

import { createContext, useContext, useReducer, ReactNode, Dispatch } from "react";
import type { JobCategory, JobCriterion } from "@/types/job.types";

/**
 * WHY useReducer + Context instead of Zustand/Redux:
 * This state is scoped to exactly one flow (the 3-step wizard) and dies
 * the moment the user leaves /jobs/new — it should never be readable from
 * outside this route. A global store would leak this into the rest of the
 * app for no benefit. useReducer also gives us named, traceable actions
 * ("SET_JOB_DETAILS", "ADD_CRITERION") instead of scattered setState calls,
 * which matters once step 2/3 both need to mutate overlapping pieces of state.
 */

export const WIZARD_STEPS = ["details", "criteria", "upload"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export interface WizardState {
  currentStep: WizardStep;

  // Step 1 — Add Job Details
  title: string;
  category: JobCategory | "";
  jobCode: string;
  embeddedEmail: string;
  description: string;
  skills: string[];

  // Step 2 — Set Criteria
  criteria: JobCriterion[];

  // Step 3 — Upload Resume
  resumeFileIds: string[];
}

const initialState: WizardState = {
  currentStep: "details",
  title: "",
  category: "",
  jobCode: "",
  embeddedEmail: "",
  description: "",
  skills: [],
  criteria: [],
  resumeFileIds: [],
};

type WizardAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_JOB_DETAILS"; payload: Partial<Pick<WizardState, "title" | "category" | "jobCode" | "embeddedEmail" | "description">> }
  | { type: "ADD_SKILL"; skill: string }
  | { type: "REMOVE_SKILL"; skill: string }
  | { type: "SET_CRITERIA"; criteria: JobCriterion[] }
  | { type: "ADD_CRITERION"; criterion: JobCriterion }
  | { type: "REMOVE_CRITERION"; criterionId: string }
  | { type: "SET_RESUME_FILE_IDS"; fileIds: string[] }
  | { type: "RESET" };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_JOB_DETAILS":
      return { ...state, ...action.payload };
    case "ADD_SKILL":
      // Guard against duplicates — mirrors the mockup's "max 10 skills" input
      if (state.skills.includes(action.skill) || state.skills.length >= 10) {
        return state;
      }
      return { ...state, skills: [...state.skills, action.skill] };
    case "REMOVE_SKILL":
      return { ...state, skills: state.skills.filter((s) => s !== action.skill) };
    case "SET_CRITERIA":
      return { ...state, criteria: action.criteria };
    case "ADD_CRITERION":
      return { ...state, criteria: [...state.criteria, action.criterion] };
    case "REMOVE_CRITERION":
      return { ...state, criteria: state.criteria.filter((c) => c.id !== action.criterionId) };
    case "SET_RESUME_FILE_IDS":
      return { ...state, resumeFileIds: action.fileIds };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

/**
 * Throws instead of returning undefined/null if used outside the provider.
 * This turns a "wizard fields silently don't update" bug into an immediate,
 * obvious error at the exact spot the mistake was made.
 */
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider (i.e. inside app/(dashboard)/jobs/new)");
  }
  return context;
}

app/(dashboard)/jobs/new/components/wizard-stepper.tsx
"use client";

import { FileText, ListChecks, Upload } from "lucide-react";
import { Stepper } from "@/components/ui/stepper";
import { useWizard, WIZARD_STEPS } from "./wizard-context";

const STEP_CONFIG = [
  { label: "Add Job Details", icon: <FileText className="h-4 w-4" /> },
  { label: "Set Criteria", icon: <ListChecks className="h-4 w-4" /> },
  { label: "Upload Resume", icon: <Upload className="h-4 w-4" /> },
];

/**
 * Small, isolated Client Component whose only job is reading wizard state
 * and feeding it to the (dumb, global) Stepper primitive. Isolating this
 * lets layout.tsx stay a Server Component — the same "smallest possible
 * client boundary" pattern used for NavItem earlier.
 */
export function WizardStepper() {
  const { state } = useWizard();
  const currentStepIndex = WIZARD_STEPS.indexOf(state.currentStep);
  return <Stepper steps={STEP_CONFIG} currentStepIndex={currentStepIndex} />;
}

app/(dashboard)/jobs/new/page.tsx
"use client";

import { useWizard } from "./components/wizard-context";
import { StepJobDetails } from "./components/step-job-details";
import { StepSetCriteria } from "./components/step-set-criteria";
import { StepUploadResume } from "./components/step-upload-resume";

/**
 * "use client" required — useWizard() reads Context, which only works
 * client-side. This is the single place that decides which step is visible;
 * step components themselves don't know about routing/step order, they just
 * dispatch SET_STEP when done. That separation means adding a 4th step later
 * only touches this switch and wizard-context.ts's WIZARD_STEPS array.
 */
export default function NewJobPage() {
  const { state } = useWizard();

  switch (state.currentStep) {
    case "details":
      return <StepJobDetails />;
    case "criteria":
      return <StepSetCriteria />;
    case "upload":
      return <StepUploadResume />;
    default:
      return null;
  }
}

app/(dashboard)/jobs/new/layout.tsx
import { Card } from "@/components/ui/card";
import { WizardProvider } from "./components/wizard-context";
import { WizardStepper } from "./components/wizard-stepper";

/**
 * WizardProvider wraps ALL children here — this is what makes wizard
 * state (title, skills, criteria, etc.) survive as the user moves between
 * steps. Since step-switching is client-side (not separate URL routes),
 * page.tsx reads useWizard() to decide which step component to render.
 *
 * NewJobLayout itself stays a Server Component — WizardStepper is the
 * only piece that needs client-side state, so it's isolated into its
 * own small "use client" file rather than making this whole layout client-side.
 */
export default function NewJobLayout({ children }: { children: React.ReactNode }) {
  return (
    <WizardProvider>
      <div>
        <h1 className="text-2xl font-semibold text-text-main">Create a New Job</h1>
        <p className="mt-1 text-sm text-text-muted">Unlock the potential of your candidates</p>

        <div className="mt-6 bg-white rounded-[0.5rem] shadow-sm py-4 px-8 flex items-center justify-between w-full">
          <WizardStepper />
        </div>

        <Card className="mt-6 p-6">{children}</Card>
      </div>
    </WizardProvider>
  );
}

app/(dashboard)/jobs/new/loading.tsx
export default function NewJobLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-32 rounded bg-gray-200" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="mt-4 h-32 rounded-lg bg-gray-100" />
    </div>
  );
}

app/(dashboard)/jobs/[jobId]/components/job-score-panel.tsx
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonutChart } from "@/components/ui/donut-chart";
import type { JobDetail } from "@/types/job.types";

export interface JobScorePanelProps {
  job: JobDetail;
}

export function JobScorePanel({ job }: JobScorePanelProps) {
  const matchedOutOf10 = Math.round((job.analysisRatio.matchedPercent / 100) * 10);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Job Score</h3>
        <button className="rounded-lg p-1.5 text-red-400 hover:bg-red-50" aria-label="Delete job">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex justify-center py-2">
        <DonutChart
          rings={[{ value: matchedOutOf10, max: 10, color: "#22c55e" }]}
          size={110}
          strokeWidth={9}
          centerLabel={`${matchedOutOf10}/10`}
        />
      </div>

      <div className="mt-2">
        <p className="text-xs text-gray-400">{job.category}</p>
        <h4 className="text-sm font-semibold text-gray-900">{job.title}</h4>
        <div className="mt-2 flex gap-2 text-xs text-gray-500">
          <span>Short-List: {job.shortListCount}</span>
          <span>Resume: {job.resumeCount}</span>
        </div>
      </div>

      {job.skills.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-gray-500">Skills Set:</p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="default">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="text-xs font-medium text-gray-500">CV&apos;s Received:</p>
        <p className="text-xs text-gray-400">{job.createdByEmail}</p>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500">Description:</p>
        <p className="mt-1 text-xs text-gray-500">{job.description}</p>
      </div>
    </Card>
  );
}

app/(dashboard)/jobs/[jobId]/components/candidate-card.tsx
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreDonutGroup } from "./score-donut-group";
import type { Candidate } from "@/types/candidate.types";

export interface CandidateCardProps {
  candidate: Candidate;
}

const STATUS_BADGE_VARIANT = {
  recommended: "green",
  shortlisted: "blue",
  rejected: "red",
} as const;

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-blue-700">{candidate.name}</h4>
          <p className="text-xs text-gray-400">{candidate.role}</p>
          <div className="mt-1.5 flex gap-1.5">
            <Badge variant={STATUS_BADGE_VARIANT[candidate.status]}>
              {candidate.status === "recommended" ? "Recommended" : candidate.status === "shortlisted" ? "Shortlisted" : "Rejected"}
            </Badge>
          </div>
        </div>
        <a href={candidate.cvDownloadUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
            Download CV
          </Button>
        </a>
      </div>

      <div className="mt-3 space-y-0.5 text-xs text-gray-500">
        <p>{candidate.email}</p>
        <p>{candidate.phone}</p>
        <p>{candidate.address}</p>
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <ScoreDonutGroup breakdown={candidate.scoreBreakdown} />
      </div>
    </Card>
  );
}

app/(dashboard)/jobs/[jobId]/components/candidate-list.tsx
import { CandidateCard } from "./candidate-card";
import type { Candidate } from "@/types/candidate.types";

export interface CandidateListProps {
  recommended: Candidate[];
  rejected: Candidate[];
}

export function CandidateList({ recommended, rejected }: CandidateListProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recommended Candidates</h2>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          Short-List: {recommended.length}
        </span>
      </div>

      {recommended.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          No recommended candidates yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recommended.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}

      {rejected.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-500">CVs Not Advised</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rejected.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

app/(dashboard)/jobs/[jobId]/components/score-donut-group.tsx
import { DonutChart } from "@/components/ui/donut-chart";
import type { CandidateScoreBreakdown } from "@/types/candidate.types";

export interface ScoreDonutGroupProps {
  breakdown: CandidateScoreBreakdown;
}

const RING_CONFIG = [
  { key: "experience" as const, label: "Experience", color: "#3b82f6" },
  { key: "skills" as const, label: "Skills", color: "#f97316" },
  { key: "education" as const, label: "Education", color: "#22c55e" },
];

/**
 * Route-local: this specific 3-ring Experience/Skills/Education combination
 * with this exact legend only makes sense on the candidate card, so it
 * doesn't belong in the global ui/ folder — but it composes the global,
 * reusable DonutChart rather than duplicating SVG logic.
 */
export function ScoreDonutGroup({ breakdown }: ScoreDonutGroupProps) {
  const rings = RING_CONFIG.map((config) => ({
    value: breakdown[config.key],
    max: 10,
    color: config.color,
  }));

  return (
    <div className="flex items-center gap-3">
      <DonutChart rings={rings} size={64} strokeWidth={5} />
      <div className="flex flex-col gap-1">
        {RING_CONFIG.map((config) => (
          <div key={config.key} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
            {breakdown[config.key]} {config.label}
          </div>
        ))}
      </div>
    </div>
  );
}

app/(dashboard)/jobs/[jobId]/page.tsx
import { notFound } from "next/navigation";
import { JobScorePanel } from "./components/job-score-panel";
import { CandidateList } from "./components/candidate-list";
import { jobsService } from "@/lib/api/jobs.service";
import { candidatesService } from "@/lib/api/candidates.service";

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  let job, candidates;

  try {
    // Fetched in parallel — candidates don't depend on the job response,
    // so awaiting them sequentially would just add latency for no reason.
    [job, candidates] = await Promise.all([
      jobsService.getById(jobId).then((r) => r.data),
      candidatesService.getForJob(jobId).then((r) => r.data),
    ]);
  } catch {
    // Covers both "job genuinely doesn't exist" (backend 404) and
    // "backend isn't running yet" — either way we can't render this page.
    notFound();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <JobScorePanel job={job} />
      <CandidateList recommended={candidates.recommended} rejected={candidates.rejected} />
    </div>
  );
}

app/(dashboard)/jobs/[jobId]/loading.tsx
export default function JobDetailLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
        <div className="mx-auto h-28 w-28 rounded-full bg-gray-100" />
        <div className="mt-4 h-4 w-20 rounded bg-gray-100" />
        <div className="mt-2 h-5 w-32 rounded bg-gray-200" />
        <div className="mt-4 flex flex-wrap gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-gray-100" />
          ))}
        </div>
      </div>

      <div className="animate-pulse">
        <div className="h-6 w-56 rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

app/(dashboard)/cvs/components/folder-grid.tsx
import Link from "next/link";
import { Folder } from "lucide-react";
import type { CvFolder } from "@/types/cv.types";

export interface FolderGridProps {
  folders: CvFolder[];
}

export function FolderGrid({ folders }: FolderGridProps) {
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
        <p className="text-sm font-medium text-gray-700">No folders yet</p>
        <p className="mt-1 text-sm text-gray-400">Create a folder to start organizing CVs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {folders.map((folder) => (
        <Link
          key={folder.id}
          href={`/cvs/${folder.id}`}
          className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-gray-50"
        >
          <Folder className="h-10 w-10 fill-blue-400 text-blue-400" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-gray-800">{folder.name}</p>
            <p className="text-xs text-gray-400">{folder.fileCount} files</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

app/(dashboard)/cvs/components/file-card.tsx
import { FileText } from "lucide-react";
import type { CvFile } from "@/types/cv.types";

export interface FileCardProps {
  file: CvFile;
}

// Word-doc blue vs PDF red, matching the two icon colors visible in the mockup
const FILE_TYPE_COLOR: Record<CvFile["fileType"], string> = {
  docx: "text-blue-500",
  pdf: "text-red-500",
};

export function FileCard({ file }: FileCardProps) {
  return (
    <a
      href={file.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-gray-100 p-3 transition-shadow hover:shadow-sm"
    >
      <FileText className={`h-8 w-8 shrink-0 ${FILE_TYPE_COLOR[file.fileType]}`} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-800">{file.candidateName}</p>
        <p className="text-xs text-gray-400">{file.fileSizeMb.toFixed(1)} MB</p>
      </div>
    </a>
  );
}

app/(dashboard)/cvs/components/cvs-toolbar.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddFolderModal } from "./upload-modal";
import { ROUTES } from "@/lib/constants";

export function CvsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  function runSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("search", query);
    else params.delete("search");
    router.push(`${ROUTES.cvs}?${params.toString()}`);
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search by folder name or file..."
        />
      </div>
      <Button variant="outline" onClick={runSearch} leftIcon={<Search className="h-4 w-4" />}>
        Search
      </Button>
      <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
        Add Folder
      </Button>

      <AddFolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

app/(dashboard)/cvs/components/upload-modal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cvsService } from "@/lib/api/cvs.service";

export interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFolderModal({ isOpen, onClose }: AddFolderModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await cvsService.createFolder(name.trim());
      setName("");
      onClose();
      // Server Component page needs to refetch the folder list to show
      // the new one — refresh() re-runs the page's data fetch without
      // a full page reload or losing client-side state elsewhere.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Folder">
      <Input
        label="Folder name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="e.g. Backend Engineers"
        autoFocus
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} isLoading={isSubmitting} disabled={!name.trim()}>
          Create Folder
        </Button>
      </div>
    </Modal>
  );
}

app/(dashboard)/cvs/[folderId]/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FileCard } from "../components/file-card";
import { cvsService } from "@/lib/api/cvs.service";
import { ROUTES } from "@/lib/constants";

export default async function CvFolderPage({ params }: { params: Promise<{ folderId: string }> }) {
  const { folderId } = await params;

  // Fetched in parallel — folder name and its files don't depend on
  // each other, so there's no reason to await them sequentially.
  const [folderResult, filesResult] = await Promise.all([
    cvsService.getFolderById(folderId).catch(() => null),
    cvsService.getFilesByFolder(folderId).catch(() => null),
  ]);

  const folderName = folderResult?.data.name ?? "Folder";
  const files = filesResult?.data ?? [];

  return (
    <div>
      <Link href={ROUTES.cvs} className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Your CV&apos;s
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900">{folderName}</h1>

      {files.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm font-medium text-gray-700">No files in this folder yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Upload resumes here, or check that your backend is running.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

app/(dashboard)/cvs/[folderId]/loading.tsx
export default function CvFolderLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 rounded bg-gray-100" />
      <div className="mt-4 h-7 w-40 rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

app/(dashboard)/cvs/page.tsx
import { CvsToolbar } from "./components/cvs-toolbar";
import { FileCard } from "./components/file-card";
import { FolderGrid } from "./components/folder-grid";
import { cvsService } from "@/lib/api/cvs.service";
import type { CvFile, CvFolder } from "@/types/cv.types";

export default async function CvsPage() {
  let folders: CvFolder[] = [];
  let recentFiles: CvFile[] = [];
  let fetchFailed = false;

  try {
    const [foldersRes, recentRes] = await Promise.all([
      cvsService.getFolders(),
      cvsService.getRecentFiles(),
    ]);
    folders = foldersRes.data;
    recentFiles = recentRes.data;
  } catch {
    fetchFailed = true;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Your CV&apos;s</h1>

      <div className="mt-4">
        <CvsToolbar />
      </div>

      {fetchFailed && (
        <p className="mt-4 text-sm text-amber-600">
          Couldn&apos;t reach the backend at the configured API URL — showing an empty state.
          Check NEXT_PUBLIC_CORE_API_URL in .env.local once your backend is running.
        </p>
      )}

      {recentFiles.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Recent Files</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {recentFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Files</h2>
        <FolderGrid folders={folders} />
      </div>
    </div>
  );
}

app/(dashboard)/cvs/loading.tsx
export default function CvsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-32 rounded bg-gray-200" />

      <div className="mt-4 flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-100" />
        <div className="h-10 w-24 rounded-lg bg-gray-100" />
        <div className="h-10 w-28 rounded-lg bg-gray-200" />
      </div>

      <div className="mt-6 h-4 w-24 rounded bg-gray-100" />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100" />
        ))}
      </div>

      <div className="mt-6 h-4 w-16 rounded bg-gray-100" />
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

app/(dashboard)/profile/page.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// TODO(auth): replace with real session data once auth is wired up —
// mirrors the same placeholder used in Topbar for now.
const CURRENT_USER = {
  name: "Leonard Campbell",
  email: "leonard_campbell@xyz.com",
  avatarUrl: "https://i.pravatar.cc/80?img=47",
};

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

      <Card className="mt-6 max-w-lg p-6">
        <div className="flex items-center gap-4">
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <p className="text-base font-semibold text-gray-900">{CURRENT_USER.name}</p>
            <p className="text-sm text-gray-500">{CURRENT_USER.email}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Account settings, password changes, and notification preferences will go here
            once auth is implemented.
          </p>
        </div>

        <div className="mt-4">
          <Button variant="outline" disabled title="Coming once auth is wired up">
            Edit Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}

app/(dashboard)/faq/page.tsx
import { Card } from "@/components/ui/card";

const FAQS = [
  {
    question: "How does Xpert Assistant score candidates?",
    answer:
      "Each job's criteria (defined in Set Criteria, either AI-generated or manual) are compared against each uploaded resume to produce Experience, Skills, and Education scores.",
  },
  {
    question: "What file types can I upload?",
    answer: "PDF and DOCX resumes are supported, up to 5MB per file.",
  },
  {
    question: "Can I edit criteria after generating them?",
    answer:
      "Yes — every generated criterion's \"Ideal answer\" field is editable, and you can add or remove criteria before saving.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">FAQ&apos;s</h1>

      <div className="mt-6 max-w-2xl space-y-3">
        {FAQS.map((faq) => (
          <Card key={faq.question} className="p-4">
            <h3 className="text-sm font-semibold text-gray-900">{faq.question}</h3>
            <p className="mt-1.5 text-sm text-gray-500">{faq.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

app/(auth)/components/forgot-password-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useResetPassword } from "@/lib/hooks/use-reset-password";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading, error } = useResetPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotPassword({ email });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Forgot Password</h1>
        <p className="text-sm text-gray-500">
          Enter your email to receive a password reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !email}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
        
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

app/(auth)/components/login-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    login({ email, password });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500">
          Enter your email and password to sign in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Input
            id="password"
            type="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
        
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">Don&apos;t have an account? </span>
          <Link href="/register" className="text-sm font-medium text-primary hover:underline">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}

app/(auth)/components/otp-form.tsx
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

app/(auth)/components/register-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/lib/hooks/use-register";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const { register, isLoading, error } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    register({ email, password });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h1>
        <p className="text-sm text-gray-500">
          Enter your email and password to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Input
            id="password"
            type="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
        
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">Already have an account? </span>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

app/(auth)/components/reset-password-form.tsx
"use client";

import { useState } from "react";
import { useResetPassword } from "@/lib/hooks/use-reset-password";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { resetPassword, isLoading, error } = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMatchError(null);
    
    if (!newPassword || !confirmPassword) return;
    
    if (newPassword !== confirmPassword) {
      setMatchError("Passwords don't match");
      return;
    }
    
    resetPassword({ resetToken: token, newPassword, confirmPassword });
  };

  const handleConfirmBlur = () => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setMatchError("Passwords don't match");
    } else {
      setMatchError(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="newPassword"
            type="password"
            label="New password"
            required
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (matchError && e.target.value === confirmPassword) {
                setMatchError(null);
              }
            }}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (matchError && newPassword === e.target.value) {
                setMatchError(null);
              }
            }}
            onBlur={handleConfirmBlur}
            error={matchError || undefined}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !!matchError || !newPassword || !confirmPassword}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
        
        <div className="text-center mt-4">
          <button 
             type="button" 
             onClick={() => router.push("/login")}
             className="text-sm text-gray-500 hover:underline"
           >
             Back to login
           </button>
        </div>
      </form>
    </div>
  );
}

app/(auth)/forgot-password/verify/page.tsx
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

app/(auth)/forgot-password/page.tsx
import { ForgotPasswordForm } from "../components/forgot-password-form";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

app/(auth)/login/page.tsx
import { LoginForm } from "../components/login-form";

export const metadata = {
  title: "Login",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return <LoginForm />;
}

app/(auth)/register/verify/page.tsx
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

app/(auth)/register/page.tsx
import { RegisterForm } from "../components/register-form";

export const metadata = {
  title: "Register",
  description: "Create a new account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

app/(auth)/reset-password/page.tsx
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

app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        {children}
      </div>
    </div>
  );
}


app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Red_Hat_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${redHatDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

app/global.css
@import "tailwindcss";


@theme inline {
  /* Brand Colors */
  --color-sidebar: #00659B;
  --color-primary: #3BAEEB;
  --color-danger: #EA4335;
  
  /* Transparencies */
  --color-danger-10: rgba(234, 67, 53, 0.10);
  --color-white-10: rgba(255, 255, 255, 0.10);
  --color-white-18: rgba(255, 255, 255, 0.18);
  --color-white-26: rgba(255, 255, 255, 0.26);

  /* Grays & Neutrals */
  --color-text-main: #181818;
  --color-text-muted: #8A8A8A;
  --color-text-light: #989898;
  --color-bg-main: #F0F0F0;
  --color-bg-card: #FAFAFA;
  --color-border-light: #E0E0E0;
  --color-border-lighter: #E9E9E9;
  --color-border-dark: #E6E6E6;

  /* Fonts (keeping defaults from Next.js template) */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-red-hat-display: var(--font-red-hat-display-raw);   /* 🆕 */
}

body {
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) transparent;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 9999px;
}


app/page.tsx
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

// TODO(auth): once login exists, this should redirect to /login when
// unauthenticated and /jobs when authenticated, instead of always /jobs.
export default function RootPage() {
  redirect(ROUTES.jobs);
}

src/components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary",
        secondary: "bg-white-10 text-white hover:bg-white-18 focus-visible:ring-primary",
        outline: "border border-border-light bg-white text-text-main hover:bg-bg-card focus-visible:ring-border-dark",
        ghost: "text-text-muted hover:bg-bg-card focus-visible:ring-border-dark",
        danger: "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

src/components/ui/card.tsx
import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-2xl border border-border-light bg-white shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-start justify-between p-4 pb-2", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold text-text-main", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-4 pb-4 text-sm text-text-muted", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between border-t border-border-light px-4 py-3", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

src/components/ui/input.tsx
import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    // useId generates a stable unique id so <label htmlFor> always matches
    // the input even when the caller doesn't pass an explicit id — avoids
    // silently-broken label associations (a common accessibility bug).
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full relative">
        {label && (
          <label htmlFor={inputId} className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-text-muted z-10">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border border-border-light rounded-md px-4 py-3 text-text-main transition-all",
            "placeholder:text-text-light",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

src/components/ui/badge.tsx
import { cn } from "@/lib/utils/cn";

export interface IconProps {
  src: string;
  className?: string;
}

export function Icon({ src, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

src/components/ui/badge.tsx
import { HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Covers every small pill in the mockups: category tags ("Deep Learning"),
 * skill tags ("WebRTC"), and status pills ("Recommended", "Rejected").
 * One primitive, variant-driven, instead of separate components for each.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-4 py-1 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-700",
        blue: "bg-primary text-white",
        green: "bg-green-100 text-green-700",   // 🆕 Short-List badge
        cyan: "bg-primary/10 text-primary",      // 🆕 Resume badge + skill pills
        red: "bg-danger-10 text-danger",
        outline: "border border-border-light text-text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
  )
);

Badge.displayName = "Badge";

src/components/ui/modal.tsx
"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * "use client" — needs useEffect for the Escape-key listener and
 * interactive close handlers. Kept in ui/ (global) since modals are
 * needed across multiple unrelated features (CV folder creation here,
 * and the wizard's future "Upload From My CV's" picker).
 */
export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn("w-full max-w-md rounded-xl bg-white p-6 shadow-lg", className)}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

src/components/ui/donut-chart.tsx
export interface DonutRing {
  value: number; // 0-max
  max: number;
  color: string; // any valid CSS color, e.g. "#3b82f6"
  label?: string;
}

export interface DonutChartProps {
  rings: DonutRing[];
  size?: number; // px, defaults to 80
  strokeWidth?: number; // px, defaults to 6
  /** Optional center label, e.g. an overall average score. */
  centerLabel?: string;
}

/**
 * Built with plain SVG + stroke-dasharray rather than a charting library
 * (recharts/chart.js) — for a handful of small, static rings per candidate
 * card, pulling in a full charting dependency is unnecessary weight. Multiple
 * rings are supported (not just one) because the candidate card mockup shows
 * 3 concentric rings (Experience/Skills/Education) in a single visual.
 */
export function DonutChart({ rings, size = 80, strokeWidth = 6, centerLabel }: DonutChartProps) {
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, index) => {
          // Each successive ring sits inside the previous one so they
          // nest visually rather than overlap.
          const radius = center - strokeWidth / 2 - index * (strokeWidth + 2);
          if (radius <= 0) return null;

          const circumference = 2 * Math.PI * radius;
          const progress = Math.min(1, Math.max(0, ring.value / ring.max));
          const dashOffset = circumference * (1 - progress);

          return (
            <g key={index}>
              {/* Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {/* Progress */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${center} ${center})`}
              />
            </g>
          );
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
          {centerLabel}
        </div>
      )}
    </div>
  );
}

src/components/ui/progress-bar.tsx
import { cn } from "@/lib/utils/cn";

export interface RatioBarProps {
  /** 0-100. The remainder is rendered as the rejected (red) segment. */
  matchedPercent: number;
  className?: string;
}

/**
 * A single-purpose component, not a generic <ProgressBar variant="two-tone" />.
 * The "Analysis Ratio" bar in the mockup always represents exactly two
 * complementary percentages (matched vs rejected), so a dedicated component
 * with a clear prop name is more readable at call sites than a generic bar
 * that needs 3 props to configure the same thing.
 */
export function RatioBar({ matchedPercent, className }: RatioBarProps) {
  const clamped = Math.min(100, Math.max(0, matchedPercent));

  return (
    <div
      className={cn("flex h-1.5 w-full items-center", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Analysis ratio: matched vs rejected"
    >
      <div className="h-full rounded-l-full bg-[#37A754] transition-all" style={{ width: `${clamped}%` }} />
      <div className="z-10 -mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary ring-2 ring-white" />
      <div className="h-full flex-1 rounded-r-full bg-danger transition-all" />
    </div>
  );
}

src/components/ui/skill-tag.tsx

src/components/ui/stepper.tsx
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StepConfig {
  label: string;
  icon: React.ReactNode;
}

export interface StepperProps {
  steps: StepConfig[];
  /** 0-indexed. Steps before this are "completed", this one is "active". */
  currentStepIndex: number;
}

export function Stepper({ steps, currentStepIndex }: StepperProps) {
  return (
    <div className="flex items-center w-full justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isActive = index === currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                  (isCompleted || isActive) ? "bg-primary text-white" : "bg-gray-100 text-gray-400",
                  isActive && "shadow-md"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap",
                  isActive ? "text-text-main font-semibold" : "text-text-muted"
                )}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "mx-4 h-[2px] w-12",
                  isCompleted ? "bg-primary" : "bg-gray-200 dashed"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

src/lib/api/env.ts

/**
 * Single source of truth for reading env vars. NEXT_PUBLIC_ vars must be
 * accessed as static `process.env.NEXT_PUBLIC_X` (not bracket notation
 * with a dynamic key) — Next.js/Turbopack can only inline NEXT_PUBLIC_
 * values into the client bundle when it can statically see the exact
 * property access at build time.
 */
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Check .env.local (see .env.example for the expected keys).`
    );
  }
  return value;
}

export const env = {
  /** When true, every *.service.ts function returns mock-store.ts data instead of hitting a real backend. */
  useMockData,

  /**
   * Only required when NOT using mock data — no point forcing you to
   * configure real backend URLs just to preview the UI against fixtures.
   */
  apiUrl: useMockData ? "" : assertEnv(process.env.NEXT_PUBLIC_CORE_API_URL, "NEXT_PUBLIC_CORE_API_URL"),
} as const;


src/lib/api/core-client.ts
import { env } from "@/lib/api/env";
import type { ApiError } from "@/types/api.types";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown; // We accept a plain object/array here and JSON.stringify it ourselves
  timeoutMs?: number;
}

/**
 * TODO(auth): once auth strategy is decided, inject the header here —
 * e.g. `Authorization: Bearer ${getAccessToken()}` for a token scheme,
 * or drop this entirely if the browser sends a session cookie automatically
 * (in which case add `credentials: "include"` to the fetch call below instead).
 * Every request funnels through this one function, so activating auth
 * later is a one-line change here — no component needs to change.
 */
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function buildHeaders(customHeaders?: HeadersInit, forceToken?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Safe check for SSR environments
  if (typeof window !== "undefined") {
    const token = forceToken || localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Merge custom headers (which might override Content-Type or add others)
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => (headers[key] = value));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => (headers[key] = value));
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  return headers;
}

/**
 * Base request function for the CORE backend (jobs, candidates, CVs, and AI).
 * Every *.service.ts function for these domains calls this — never
 * `fetch()` directly — so retry/error/auth logic lives in exactly one place.
 */
async function coreRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, timeoutMs, ...rest } = options;

  let timeoutId: NodeJS.Timeout | undefined;
  const controller = new AbortController();
  
  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  const performRequest = async (tokenOverride?: string) => {
    return fetch(`${env.apiUrl}${path}`, {
      ...rest,
      headers: buildHeaders(headers, tokenOverride),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: timeoutMs ? controller.signal : rest.signal,
    });
  };

  try {
    let response = await performRequest();

    if (response.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            // Manually call fetch to avoid circular dependency with authService / coreClient
            const refreshRes = await fetch(`${env.apiUrl}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const data = await refreshRes.json();
              localStorage.setItem("access_token", data.accessToken);
              if (data.refreshToken) {
                localStorage.setItem("refresh_token", data.refreshToken);
              }
              onRefreshed(data.accessToken);
            } else {
              throw new Error("Refresh failed");
            }
          } catch (e) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            onRefreshed(""); // Resolve pending requests to fail
            window.location.href = "/login";
          } finally {
            isRefreshing = false;
          }
        }

        // Wait for the refresh to complete
        const newToken = await new Promise<string>((resolve) => {
          addRefreshSubscriber(resolve);
        });

        if (newToken) {
          response = await performRequest(newToken); // Retry the original request
        }
      }
    }

    if (!response.ok) {
      const errorPayload: Partial<ApiError> = await response
        .json()
        .catch(() => ({}));

      throw {
        status: response.status,
        message: errorPayload.message ?? `Core API request failed: ${response.status}`,
      } satisfies ApiError;
    }

    // Handle 204 No Content (e.g. DELETE) — nothing to parse
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (err: any) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw {
        status: 408,
        message: "Service request timed out. Please try again.",
      } satisfies ApiError;
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Separate from coreRequest() on purpose: file uploads use FormData,
 * which must NOT have a manually-set Content-Type header — the browser
 * sets it automatically with the correct multipart boundary string.
 * Reusing buildHeaders() (which always injects "application/json") would
 * silently corrupt every upload request.
 */
async function coreUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorPayload: Partial<ApiError> = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorPayload.message ?? `Upload failed: ${response.status}`,
    } satisfies ApiError;
  }

  return response.json() as Promise<T>;
}

export const coreClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "DELETE" }),

  upload: <T>(path: string, formData: FormData) => coreUpload<T>(path, formData),
};


src/lib/api/job.service.ts
// import { coreClient } from "@/lib/api/core-client";
// import type { Job, JobDetail, CreateJobPayload } from "@/types/job.types";
// import type { PaginatedResponse, ApiResponse } from "@/types/api.types";

// // export const jobsService = {
// //   getAll: (params?: { search?: string; category?: string }) => {
// //     const query = new URLSearchParams(params as Record<string, string>).toString();
// //     return coreClient.get<PaginatedResponse<Job>>(`/jobs${query ? `?${query}` : ""}`);
// //   },

// export const jobsService = {
//   getAll: async (params?: { search?: string; category?: string }) => {
//     // ---- TEMPORARY UI MOCK FOR TESTING ----
//     return {
//       success: true,
//       data: [
//         {
//           id: "job-1",
//           title: "Senior Full Stack Engineer",
//           category: "Engineering",
//           description: "Build robust backend services and Next.js frontends.",
//           shortListCount: 4,
//           resumeCount: 15,
//           skills: ["React", "Next.js", "TypeScript", "Node.js"],
//           analysisRatio: { matchedPercent: 85 },
//           createdAt: new Date().toISOString(),
//           createdByEmail: "leonard@campbell.xyz",
//         },
//       ],
//       meta: { total: 1, page: 1, limit: 10 }
//     } as unknown as PaginatedResponse<Job>;
//     // ---------------------------------------

//     // Real code to use later when backend is ready:
//     // const query = new URLSearchParams(params as Record<string, string>).toString();
//     // return coreClient.get<PaginatedResponse<Job>>(`/jobs${query ? `?${query}` : ""}`);
//   },
//   getById: (jobId: string) =>
//     coreClient.get<ApiResponse<JobDetail>>(`/jobs/${jobId}`),
//   create: (payload: CreateJobPayload) =>
//     coreClient.post<ApiResponse<Job>>("/jobs", payload),
//   delete: (jobId: string) => coreClient.delete<void>(`/jobs/${jobId}`),
// };
import { coreClient } from "@/lib/api/core-client";
import { env } from "@/lib/api/env";
import { mockStore } from "@/lib/api/mock-store";
import type { Job, JobDetail, CreateJobPayload } from "@/types/job.types";
import type { PaginatedResponse, ApiResponse } from "@/types/api.types";

/**
 * Every function branches on env.useMockData FIRST, before touching
 * coreClient. Components never see this branch — they just call
 * jobsService.getAll() and get back the same ApiResponse/PaginatedResponse
 * shape either way. Flip NEXT_PUBLIC_USE_MOCK_DATA to false once your
 * real backend is ready — zero component changes needed.
 */
export const jobsService = {
  getAll: async (params?: { search?: string; category?: string }) => {
    if (env.useMockData) {
      const data = await mockStore.jobs.getAll(params?.search);
      return { success: true, data, meta: { total: data.length, page: 1, pageSize: data.length } } satisfies PaginatedResponse<Job>;
    }
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return coreClient.get<PaginatedResponse<Job>>(`/jobs${query ? `?${query}` : ""}`);
  },

  getById: async (jobId: string) => {
    if (env.useMockData) {
      const data = await mockStore.jobs.getById(jobId);
      return { success: true, data } satisfies ApiResponse<JobDetail>;
    }
    return coreClient.get<ApiResponse<JobDetail>>(`/jobs/${jobId}`);
  },

  create: async (payload: CreateJobPayload) => {
    if (env.useMockData) {
      const data = await mockStore.jobs.create(payload);
      return { success: true, data } satisfies ApiResponse<Job>;
    }
    return coreClient.post<ApiResponse<Job>>("/jobs", payload);
  },

  delete: (jobId: string) => coreClient.delete<void>(`/jobs/${jobId}`),
};

src/lib/api/candidates.service.ts
// import { coreClient } from "@/lib/api/core-client";
// import type { JobCandidatesResponse } from "@/types/candidate.types";
// import type { ApiResponse } from "@/types/api.types";

// export const candidatesService = {
//   getForJob: (jobId: string) =>
//     coreClient.get<ApiResponse<JobCandidatesResponse>>(`/jobs/${jobId}/candidates`),
// };
import { coreClient } from "@/lib/api/core-client";
import { env } from "@/lib/api/env";
import { mockStore } from "@/lib/api/mock-store";
import type { JobCandidatesResponse } from "@/types/candidate.types";
import type { ApiResponse } from "@/types/api.types";

export const candidatesService = {
  getForJob: async (jobId: string) => {
    if (env.useMockData) {
      const data = await mockStore.candidates.getForJob(jobId);
      return { success: true, data } satisfies ApiResponse<JobCandidatesResponse>;
    }
    return coreClient.get<ApiResponse<JobCandidatesResponse>>(`/jobs/${jobId}/candidates`);
  },
};

src/lib/api/cvs.service.ts
// import { coreClient } from "@/lib/api/core-client";
// import type { CvFile, CvFolder } from "@/types/cv.types";
// import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

// export const cvsService = {
//   uploadResume: (file: File, folderId?: string) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     if (folderId) formData.append("folderId", folderId);
//     return coreClient.upload<ApiResponse<CvFile>>("/cvs/upload", formData);
//   },

//   getFolders: () => coreClient.get<PaginatedResponse<CvFolder>>("/cvs/folders"),

//   getFolderById: (folderId: string) =>
//     coreClient.get<ApiResponse<CvFolder>>(`/cvs/folders/${folderId}`),

//   getFilesByFolder: (folderId: string) =>
//     coreClient.get<PaginatedResponse<CvFile>>(`/cvs/folders/${folderId}/files`),

//   getRecentFiles: () => coreClient.get<PaginatedResponse<CvFile>>("/cvs/recent"),

//   createFolder: (name: string) =>
//     coreClient.post<ApiResponse<CvFolder>>("/cvs/folders", { name }),
// };

import { coreClient } from "@/lib/api/core-client";
import { env } from "@/lib/api/env";
import { mockStore } from "@/lib/api/mock-store";
import type { CvFile, CvFolder } from "@/types/cv.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export const cvsService = {
  uploadResume: async (file: File, folderId?: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.uploadResume(file.name, folderId);
      return { success: true, data } satisfies ApiResponse<CvFile>;
    }
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", folderId);
    return coreClient.upload<ApiResponse<CvFile>>("/cvs/upload", formData);
  },

  getFolders: async () => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getFolders();
      return { success: true, data, meta: { total: data.length, page: 1, pageSize: data.length } } satisfies PaginatedResponse<CvFolder>;
    }
    return coreClient.get<PaginatedResponse<CvFolder>>("/cvs/folders");
  },

  getFolderById: async (folderId: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getFolderById(folderId);
      return { success: true, data } satisfies ApiResponse<CvFolder>;
    }
    return coreClient.get<ApiResponse<CvFolder>>(`/cvs/folders/${folderId}`);
  },

  getFilesByFolder: async (folderId: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getFilesByFolder(folderId);
      return { success: true, data, meta: { total: data.length, page: 1, pageSize: data.length } } satisfies PaginatedResponse<CvFile>;
    }
    return coreClient.get<PaginatedResponse<CvFile>>(`/cvs/folders/${folderId}/files`);
  },

  getRecentFiles: async () => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getRecentFiles();
      return { success: true, data, meta: { total: data.length, page: 1, pageSize: data.length } } satisfies PaginatedResponse<CvFile>;
    }
    return coreClient.get<PaginatedResponse<CvFile>>("/cvs/recent");
  },

  createFolder: async (name: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.createFolder(name);
      return { success: true, data } satisfies ApiResponse<CvFolder>;
    }
    return coreClient.post<ApiResponse<CvFolder>>("/cvs/folders", { name });
  },
};

src/lib/api/analysis.service.ts
// import { aiClient } from "@/lib/api/ai-client";
// import type { JobCriterion } from "@/types/job.types";
// import type { ApiResponse } from "@/types/api.types";

// export interface GenerateCriteriaPayload {
//   jobTitle: string;
//   description: string;
//   skills: string[];
//   numberOfCriteria: number;
// }

// /**
//  * Everything AI-generated (criteria suggestions today, resume scoring
//  * later) funnels through here, using aiClient (separate base URL, longer
//  * timeout) — never coreClient. Components/hooks never need to know or
//  * care that this hits a different service than jobsService; they just
//  * call analysisService.generateCriteria(...).
//  */
// export const analysisService = {
//   generateCriteria: (payload: GenerateCriteriaPayload) =>
//     aiClient.post<ApiResponse<JobCriterion[]>>("/criteria/generate", payload),
// };

import { aiClient } from "@/lib/api/ai-client";
import { env } from "@/lib/api/env";
import { mockStore } from "@/lib/api/mock-store";
import type { JobCriterion } from "@/types/job.types";
import type { ApiResponse } from "@/types/api.types";

export interface GenerateCriteriaPayload {
  jobTitle: string;
  description: string;
  skills: string[];
  numberOfCriteria: number;
}

export const analysisService = {
  generateCriteria: async (payload: GenerateCriteriaPayload) => {
    if (env.useMockData) {
      const data = await mockStore.criteria.generate(payload.numberOfCriteria);
      return { success: true, data } satisfies ApiResponse<JobCriterion[]>;
    }
    return aiClient.post<ApiResponse<JobCriterion[]>>("/criteria/generate", payload);
  },
};
src/lib/api/auth.service.ts
import { coreClient } from "./core-client";
import type { 
  RegisterRequest, 
  VerifyRegistrationOtpRequest, 
  LoginRequest, 
  ForgotPasswordRequest, 
  VerifyResetOtpRequest, 
  ResetPasswordRequest, 
  AuthResponse 
} from "@/types/auth.types";

export const authService = {
  register: async (data: RegisterRequest): Promise<void> => {
    return coreClient.post<void>("/auth/register", data);
  },

  verifyRegistrationOtp: async (data: VerifyRegistrationOtpRequest): Promise<AuthResponse> => {
    return coreClient.post<AuthResponse>("/auth/register/verify", data);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return coreClient.post<AuthResponse>("/auth/login", data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    return coreClient.post<void>("/auth/forgot-password", data);
  },

  verifyResetOtp: async (data: VerifyResetOtpRequest): Promise<{ resetToken: string }> => {
    return coreClient.post<{ resetToken: string }>("/auth/forgot-password/verify", data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    return coreClient.post<void>("/auth/reset-password", data);
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return coreClient.post<AuthResponse>("/auth/refresh", { refreshToken });
  },

  logout: async (refreshToken: string): Promise<void> => {
    return coreClient.post<void>("/auth/logout", { refreshToken });
  }
};

src/lib/hooks/use-auth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth.service";
import type { ApiError } from "@/types/api.types";
import type { AuthUser, LoginRequest } from "@/types/auth.types";

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Rehydrate user from storage if available
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          const parsedUser: unknown = JSON.parse(storedUser);
          if (isAuthUser(parsedUser)) {
            setUser(parsedUser);
          }
        }
      } catch {
        // Ignore storage and parse errors
      } finally {
        setIsInitializing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      
      // Store tokens and user
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      setUser(response.user);
      
      // Redirect to dashboard
      router.push("/jobs");
    } catch (err: unknown) {
      const message = isApiError(err)
        ? err.message
        : err instanceof Error
          ? err.message
          : "Invalid email or password.";

      if (isApiError(err) && err.status === 403 && message.includes("unverified")) {
        // Backend indicated account is unverified, push to OTP screen
        router.push(`/register/verify?email=${encodeURIComponent(credentials.email)}`);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors, still clear local state
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
      setUser(null);
      router.push("/login");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isInitializing,
    login,
    logout,
    isLoading,
    error,
  };
}

src/lib/hooks/use-register.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth.service";
import type { RegisterRequest, VerifyRegistrationOtpRequest } from "@/types/auth.types";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      router.push(`/register/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: VerifyRegistrationOtpRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyRegistrationOtp(data);
      
      // Store tokens and user
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      
      // Redirect to dashboard
      router.push("/jobs");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    // In a real system, you might have a dedicated resend endpoint. 
    // Here we'll just call register again with no password to trigger a new OTP,
    // or rely on a specific endpoint if one exists.
    // Assuming backend handles a duplicate register request for unverified user by resending OTP.
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({ email });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resend OTP."));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    verifyOtp,
    resendOtp,
    isLoading,
    error,
  };
}

src/lib/hooks/use-register.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth.service";
import type { ForgotPasswordRequest, VerifyResetOtpRequest, ResetPasswordRequest } from "@/types/auth.types";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export function useResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data);
      router.push(`/forgot-password/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to process request. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: VerifyResetOtpRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyResetOtp(data);
      router.push(`/reset-password?token=${encodeURIComponent(response.resetToken)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid or expired OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data);
      // Redirect to login on success
      router.push("/login?reset=success");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to reset password. The link might be expired."));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    forgotPassword,
    verifyOtp,
    resetPassword,
    isLoading,
    error,
  };
}

src/lib/api/mock-store.ts

src/lib/api/mock-store.ts
import jobsSeed from "@/lib/mock-data/jobs.json";
import jobDetailSeed from "@/lib/mock-data/job-detail.json";
import candidatesSeed from "@/lib/mock-data/candidates.json";
import criteriaSeed from "@/lib/mock-data/criteria.json";
import cvFoldersSeed from "@/lib/mock-data/cv-folders.json";
import cvFilesSeed from "@/lib/mock-data/cv-files.json";

import type { Job, JobDetail, JobCriterion, CreateJobPayload } from "@/types/job.types";
import type { JobCandidatesResponse } from "@/types/candidate.types";
import type { CvFolder, CvFile } from "@/types/cv.types";

/**
 * Module-scoped mutable arrays, seeded once from the JSON fixtures.
 * Because Next.js dev keeps this module loaded across requests within
 * the same server process, a folder/job created through "Add Folder" or
 * the wizard will actually show up on the next fetch — not just the
 * static JSON contents every time. Resets on server restart, which is
 * expected and fine for local preview purposes.
 */
let jobs: Job[] = [...(jobsSeed as Job[])];
const cvFolders: CvFolder[] = [...(cvFoldersSeed as CvFolder[])];
const cvFiles: CvFile[] = [...(cvFilesSeed as CvFile[])];

const NETWORK_DELAY_MS = 500;

/** Simulates real network latency so loading.tsx skeletons are actually visible during preview. */
function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), NETWORK_DELAY_MS));
}

export const mockStore = {
  jobs: {
    getAll: (search?: string) => {
      const filtered = search
        ? jobs.filter(
            (j) =>
              j.title.toLowerCase().includes(search.toLowerCase()) ||
              j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
          )
        : jobs;
      return delay(filtered);
    },

    getById: (jobId: string) => {
      // Preview limitation: always returns the same fixture detail
      // regardless of which id is requested, so any job (including
      // ones just "created" through the wizard) opens a fully-populated
      // detail page instead of a 404 during UI preview.
      return delay({ ...(jobDetailSeed as JobDetail), id: jobId });
    },

    create: (payload: CreateJobPayload) => {
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: payload.title,
        category: payload.category,
        description: payload.description,
        skills: payload.skills,
        shortListCount: 0,
        resumeCount: payload.resumeFileIds.length,
        analysisRatio: { matchedPercent: 0, rejectedPercent: 0 },
        createdAt: new Date().toISOString(),
        createdByEmail: "leonard_campbell@xyz.com",
      };
      jobs = [newJob, ...jobs];
      return delay(newJob);
    },
  },

  candidates: {
    getForJob: (_jobId: string) => {
      // Same fixture regardless of jobId — sufficient for previewing
      // the candidate list/score UI before the real backend exists.
      return delay(candidatesSeed as JobCandidatesResponse);
    },
  },

  criteria: {
    generate: (numberOfCriteria: number) => {
      const sliced = (criteriaSeed as JobCriterion[]).slice(0, numberOfCriteria);
      return delay(sliced);
    },
  },

  cvs: {
    getFolders: () => delay(cvFolders),

    getFolderById: (folderId: string) => {
      const found = cvFolders.find((f) => f.id === folderId);
      return delay(found ?? { id: folderId, name: "Folder", fileCount: 0, createdAt: new Date().toISOString() });
    },

    getFilesByFolder: (folderId: string) => delay(cvFiles.filter((f) => f.folderId === folderId)),

    getRecentFiles: () => delay(cvFiles.slice(0, 5)),

    createFolder: (name: string) => {
      const newFolder: CvFolder = {
        id: `folder-${Date.now()}`,
        name,
        fileCount: 0,
        createdAt: new Date().toISOString(),
      };
      cvFolders.unshift(newFolder);
      return delay(newFolder);
    },

    uploadResume: (fileName: string, folderId?: string) => {
      const newFile: CvFile = {
        id: `file-${Date.now()}`,
        candidateName: fileName.replace(/\.(pdf|docx?)$/i, ""),
        fileType: fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
        fileSizeMb: Math.round(Math.random() * 5 * 10) / 10,
        folderId: folderId ?? null,
        uploadedAt: new Date().toISOString(),
        downloadUrl: "#",
      };
      cvFiles.unshift(newFile);
      return delay(newFile);
    },
  },
};


src/lib/mock-data/candidates.json
{
  "recommended": [
    {
      "id": "cand-1",
      "name": "Liam Smith",
      "role": "App Developer",
      "email": "liamsmith02@gmail.com",
      "phone": "+14844578334",
      "address": "123 Maple Avenue, Greenfield, New York",
      "status": "recommended",
      "scoreBreakdown": { "experience": 10, "skills": 9, "education": 8 },
      "cvFileId": "file-1",
      "cvDownloadUrl": "#",
      "uploadedAt": "2025-11-20T15:30:00.000Z"
    },
    {
      "id": "cand-2",
      "name": "Noah Johnson",
      "role": "App Developer",
      "email": "noaj_joh@gmail.com",
      "phone": "+15852095380",
      "address": "456 Oak Street, Rivertown, New York",
      "status": "recommended",
      "scoreBreakdown": { "experience": 8, "skills": 12, "education": 5 },
      "cvFileId": "file-2",
      "cvDownloadUrl": "#",
      "uploadedAt": "2025-11-20T15:30:00.000Z"
    },
    {
      "id": "cand-3",
      "name": "Ethan Brown",
      "role": "App Developer",
      "email": "ethnabrown@gmail.com",
      "phone": "+18943512480",
      "address": "789 Pine Lane, Lakeview, New York",
      "status": "recommended",
      "scoreBreakdown": { "experience": 8, "skills": 9, "education": 9 },
      "cvFileId": "file-3",
      "cvDownloadUrl": "#",
      "uploadedAt": "2025-11-20T15:30:00.000Z"
    },
    {
      "id": "cand-4",
      "name": "Liam Carter",
      "role": "App Developer",
      "email": "limcarter02@gmail.com",
      "phone": "+14844845836",
      "address": "456 Maple Street, Riverbend, New York",
      "status": "recommended",
      "scoreBreakdown": { "experience": 10, "skills": 8, "education": 8 },
      "cvFileId": "file-4",
      "cvDownloadUrl": "#",
      "uploadedAt": "2025-11-20T15:30:00.000Z"
    }
  ],
  "rejected": [
    {
      "id": "cand-5",
      "name": "Sophia Martinez",
      "role": "App Developer",
      "email": "sophia.martinez@gmail.com",
      "phone": "+13035550123",
      "address": "22 Birch Road, Elmhurst, New York",
      "status": "rejected",
      "scoreBreakdown": { "experience": 3, "skills": 4, "education": 6 },
      "cvFileId": "file-5",
      "cvDownloadUrl": "#",
      "uploadedAt": "2025-11-20T15:30:00.000Z"
    },
    {
      "id": "cand-6",
      "name": "Mason Lee",
      "role": "App Developer",
      "email": "mason.lee@gmail.com",
      "phone": "+12125550456",
      "address": "9 Cedar Court, Fairview, New York",
      "status": "rejected",
      "scoreBreakdown": { "experience": 2, "skills": 5, "education": 4 },
      "cvFileId": "file-6",
      "cvDownloadUrl": "#",
      "uploadedAt": "2025-11-20T15:30:00.000Z"
    }
  ],
  "jobScore": { "matchedPercent": 68, "rejectedPercent": 32 }
}

src/lib/mock-data/criteria.json
[
  {
    "id": "crit-1",
    "title": "2-3 years of full-time recruiting experience",
    "ratingCalculationExplanation": "The requirement for 2-3 years of experience at a US-based recruiting firm highlights the need for a candidate with a solid background in recruitment.",
    "idealAnswer": ""
  },
  {
    "id": "crit-2",
    "title": "Strong communication and interpersonal skills",
    "ratingCalculationExplanation": "The ability to build rapport with candidates and clients is emphasized, making this skill critical for successful recruitment.",
    "idealAnswer": ""
  },
  {
    "id": "crit-3",
    "title": "Proficiency with applicant tracking systems (ATS)",
    "ratingCalculationExplanation": "Hands-on experience with ATS platforms indicates the candidate can manage a high-volume pipeline efficiently.",
    "idealAnswer": ""
  },
  {
    "id": "crit-4",
    "title": "Track record of closing technical roles",
    "ratingCalculationExplanation": "Prior success placing candidates in similar technical positions suggests domain familiarity and sourcing effectiveness.",
    "idealAnswer": ""
  },
  {
    "id": "crit-5",
    "title": "Client relationship management experience",
    "ratingCalculationExplanation": "Since this role interfaces directly with client hiring managers, prior account management experience is a strong signal.",
    "idealAnswer": ""
  },
  {
    "id": "crit-6",
    "title": "Familiarity with US employment compliance",
    "ratingCalculationExplanation": "Understanding of US-specific hiring regulations reduces onboarding time and legal risk for the firm.",
    "idealAnswer": ""
  }
]

src/lib/mock-data/cv-files.json
[
  {
    "id": "file-1",
    "candidateName": "Maya Johnson",
    "fileType": "docx",
    "fileSizeMb": 64.7,
    "folderId": "folder-4",
    "uploadedAt": "2025-11-20T15:30:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-2",
    "candidateName": "Liam Carter",
    "fileType": "pdf",
    "fileSizeMb": 128.3,
    "folderId": "folder-4",
    "uploadedAt": "2025-11-20T15:00:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-3",
    "candidateName": "Noah Smith",
    "fileType": "pdf",
    "fileSizeMb": 512.5,
    "folderId": "folder-5",
    "uploadedAt": "2025-11-20T14:45:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-4",
    "candidateName": "Sophie Turner",
    "fileType": "docx",
    "fileSizeMb": 2561.5,
    "folderId": "folder-1",
    "uploadedAt": "2025-11-20T14:30:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-5",
    "candidateName": "Emma Wilson",
    "fileType": "docx",
    "fileSizeMb": 1024.0,
    "folderId": "folder-2",
    "uploadedAt": "2025-11-20T14:15:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-6",
    "candidateName": "Lila Thompson",
    "fileType": "docx",
    "fileSizeMb": 52.3,
    "folderId": "folder-1",
    "uploadedAt": "2025-11-19T10:00:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-7",
    "candidateName": "Ava Taylor",
    "fileType": "pdf",
    "fileSizeMb": 13.9,
    "folderId": "folder-1",
    "uploadedAt": "2025-11-19T09:45:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-8",
    "candidateName": "Isabella Lee",
    "fileType": "docx",
    "fileSizeMb": 57.9,
    "folderId": "folder-2",
    "uploadedAt": "2025-11-19T09:30:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-9",
    "candidateName": "Mia Anderson",
    "fileType": "pdf",
    "fileSizeMb": 44.3,
    "folderId": "folder-3",
    "uploadedAt": "2025-11-19T09:15:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-10",
    "candidateName": "Zoe Thomas",
    "fileType": "pdf",
    "fileSizeMb": 32.5,
    "folderId": "folder-3",
    "uploadedAt": "2025-11-19T09:00:00.000Z",
    "downloadUrl": "#"
  },
  {
    "id": "file-11",
    "candidateName": "Lily Jackson",
    "fileType": "pdf",
    "fileSizeMb": 12.0,
    "folderId": "folder-2",
    "uploadedAt": "2025-11-19T08:45:00.000Z",
    "downloadUrl": "#"
  }
]

src/lib/mock-data/cv-folders.json
[
  {
    "id": "folder-1",
    "name": "Graphic Designers",
    "fileCount": 18,
    "createdAt": "2025-10-01T09:00:00.000Z"
  },
  {
    "id": "folder-2",
    "name": "UI/UX Designers",
    "fileCount": 32,
    "createdAt": "2025-10-02T09:00:00.000Z"
  },
  {
    "id": "folder-3",
    "name": "Data Analysis",
    "fileCount": 64,
    "createdAt": "2025-10-03T09:00:00.000Z"
  },
  {
    "id": "folder-4",
    "name": "Web Development",
    "fileCount": 129,
    "createdAt": "2025-10-04T09:00:00.000Z"
  },
  {
    "id": "folder-5",
    "name": "App Design Developer",
    "fileCount": 239,
    "createdAt": "2025-10-05T09:00:00.000Z"
  },
  {
    "id": "folder-6",
    "name": "SEP",
    "fileCount": 51,
    "createdAt": "2025-10-06T09:00:00.000Z"
  },
  {
    "id": "folder-7",
    "name": "Digital Marketing",
    "fileCount": 9,
    "createdAt": "2025-10-07T09:00:00.000Z"
  },
  {
    "id": "folder-8",
    "name": "User Research",
    "fileCount": 18,
    "createdAt": "2025-10-08T09:00:00.000Z"
  },
  {
    "id": "folder-9",
    "name": "AI Applications",
    "fileCount": 41,
    "createdAt": "2025-10-09T09:00:00.000Z"
  },
  {
    "id": "folder-10",
    "name": "Cybersecurity Measures",
    "fileCount": 32,
    "createdAt": "2025-10-10T09:00:00.000Z"
  },
  {
    "id": "folder-11",
    "name": "Data Science",
    "fileCount": 64,
    "createdAt": "2025-10-11T09:00:00.000Z"
  },
  {
    "id": "folder-12",
    "name": "DevOps",
    "fileCount": 8,
    "createdAt": "2025-10-12T09:00:00.000Z"
  }
]

src/lib/mock-data/job-detail.json
{
  "id": "job-2",
  "title": "iOS Developer",
  "category": "Development",
  "description": "We are seeking an iOS Developer with a minimum of 3 years of experience. The ideal candidate will possess a strong understanding of the iOS platform and its ecosystem.",
  "skills": ["WebRTC", "Twilio SDK", "Mercurial or SVN"],
  "shortListCount": 63,
  "resumeCount": 124,
  "analysisRatio": { "matchedPercent": 68, "rejectedPercent": 32 },
  "createdAt": "2025-11-20T15:30:00.000Z",
  "createdByEmail": "hr@360expertsolutions.com",
  "criteria": [
    {
      "id": "crit-1",
      "title": "2-3 years of full-time recruiting experience",
      "ratingCalculationExplanation": "The requirement for 2-3 years of experience at a US-based recruiting firm highlights the need for a candidate with a solid background in recruitment.",
      "idealAnswer": ""
    },
    {
      "id": "crit-2",
      "title": "Strong communication and interpersonal skills",
      "ratingCalculationExplanation": "The ability to build rapport with candidates and clients is emphasized, making this skill critical for successful recruitment.",
      "idealAnswer": ""
    }
  ],
  "candidates": [
    { "candidateId": "cand-1", "status": "recommended" },
    { "candidateId": "cand-2", "status": "recommended" },
    { "candidateId": "cand-3", "status": "recommended" },
    { "candidateId": "cand-4", "status": "recommended" },
    { "candidateId": "cand-5", "status": "rejected" },
    { "candidateId": "cand-6", "status": "rejected" }
  ]
}

src/lib/mock-data/jobs.json
[
  {
    "id": "job-1",
    "title": "AI Machine Learning",
    "category": "AI/ML",
    "description": "Design and build applications for the iOS platform, ensuring performance, quality, and responsiveness of applications.",
    "skills": ["Deep Learning", "Python", "TensorFlow", "NLP"],
    "shortListCount": 12,
    "resumeCount": 124,
    "analysisRatio": { "matchedPercent": 68, "rejectedPercent": 32 },
    "createdAt": "2025-11-20T15:30:00.000Z",
    "createdByEmail": "jobs4u.360expertsolutions.com"
  },
  {
    "id": "job-2",
    "title": "iOS Developer",
    "category": "Development",
    "description": "We are seeking an iOS Developer with a minimum of 3 years of experience. The ideal candidate will possess a strong understanding of the iOS platform.",
    "skills": ["Swift", "WebRTC", "Twilio SDK"],
    "shortListCount": 10,
    "resumeCount": 63,
    "analysisRatio": { "matchedPercent": 55, "rejectedPercent": 45 },
    "createdAt": "2025-11-20T15:30:00.000Z",
    "createdByEmail": "hr@360expertsolutions.com"
  },
  {
    "id": "job-3",
    "title": "AWS Full Stack Developer",
    "category": "Development",
    "description": "We are looking for an AWS Full Stack Developer with at least three years of experience building software solutions.",
    "skills": ["AWS", "Node.js", "React", "TypeScript"],
    "shortListCount": 8,
    "resumeCount": 47,
    "analysisRatio": { "matchedPercent": 40, "rejectedPercent": 60 },
    "createdAt": "2025-11-20T15:30:00.000Z",
    "createdByEmail": "alena_cordy@360expertsolutions.com"
  },
  {
    "id": "job-4",
    "title": "Senior Technical Recruiter",
    "category": "Human Resources",
    "description": "We are a growing recruitment firm specializing in placing top-tier technical and non-technical talent for our clients based in the United States.",
    "skills": ["Sourcing", "ATS", "LinkedIn Recruiter"],
    "shortListCount": 15,
    "resumeCount": 89,
    "analysisRatio": { "matchedPercent": 72, "rejectedPercent": 28 },
    "createdAt": "2025-11-20T15:30:00.000Z",
    "createdByEmail": "hr@360expertsolutions.com"
  },
  {
    "id": "job-5",
    "title": "Delivery Manager",
    "category": "Logistics",
    "description": "A US-based AI company that wants to create innovative commercial and research AI infrastructure is looking for a Delivery Manager.",
    "skills": ["Agile", "Scrum", "Stakeholder Management"],
    "shortListCount": 6,
    "resumeCount": 34,
    "analysisRatio": { "matchedPercent": 50, "rejectedPercent": 50 },
    "createdAt": "2025-11-20T15:30:00.000Z",
    "createdByEmail": "jobs4u.360expertsolutions.com"
  },
  {
    "id": "job-6",
    "title": "Data Scientist",
    "category": "Data Science",
    "description": "Join our data science team to build predictive models and extract actionable insights from large-scale datasets.",
    "skills": ["Python", "SQL", "Machine Learning", "Statistics"],
    "shortListCount": 9,
    "resumeCount": 58,
    "analysisRatio": { "matchedPercent": 63, "rejectedPercent": 37 },
    "createdAt": "2025-11-19T11:15:00.000Z",
    "createdByEmail": "jobs4u.360expertsolutions.com"
  }
]


src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

src/lib/utils/format-date.ts
/**
 * Formats an ISO date string to match the mockup's style: "Nov.20.24 03:30PM".
 * Centralized here so every card/list that shows "Created on..." formats
 * identically — a lone toLocaleDateString() scattered per-component would
 * drift in format over time.
 */
export function formatCardDate(isoString: string): string {
  const date = new Date(isoString);

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${month}.${day}.${year} ${hours.toString().padStart(2, "0")}:${minutes}${ampm}`;
}

src/lib/utils/get-error-message.ts
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message) return message;
  }

  return fallback;
}

src/lib/constants.ts
import { LayoutGrid, FolderOpen, User, HelpCircle, LucideIcon } from "lucide-react";

export const ROUTES = {
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

src/types/job.types.ts
export interface AnalysisRatio {
  matchedPercent: number;
  rejectedPercent: number;
}

export interface Job {
  id: string;
  title: string;
  category: JobCategory;
  description: string;
  skills: string[];
  shortListCount: number;
  resumeCount: number;
  analysisRatio: AnalysisRatio;
  createdAt: string;
  createdByEmail: string;
}

export type JobCategory =
  | "Development"
  | "Human Resources"
  | "AI/ML"
  | "Software Engineering"
  | "Data Science"
  | "Product Design"
  | "User Experience"
  | "Quality Assurance"
  | "Logistics";

export interface JobCriterion {
  id: string;
  title: string;
  ratingCalculationExplanation: string;
  idealAnswer: string;
}

export interface CreateJobPayload {
  title: string;
  category: JobCategory;
  jobCode?: string;
  embeddedEmail?: string;
  description: string;
  skills: string[];
  criteria: Omit<JobCriterion, "id">[];
  resumeFileIds: string[];
}

export interface JobDetail extends Job {
  criteria: JobCriterion[];
  candidates: JobCandidateSummary[];
}

export interface JobCandidateSummary {
  candidateId: string;
  status: "recommended" | "shortlisted" | "rejected";
}

src/types/candidate.types.ts
export interface CandidateScoreBreakdown {
  experience: number;
  skills: number;
  education: number;
}

export type CandidateStatus = "recommended" | "shortlisted" | "rejected";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  status: CandidateStatus;
  scoreBreakdown: CandidateScoreBreakdown;
  cvFileId: string;
  cvDownloadUrl: string;
  uploadedAt: string;
}

export interface JobCandidatesResponse {
  recommended: Candidate[];
  rejected: Candidate[];
  jobScore: {
    matchedPercent: number;
    rejectedPercent: number;
  };
}
src/types/auth.types.ts
export interface RegisterRequest {
  email: string;
  password?: string;
}

export interface VerifyRegistrationOtpRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

src/types/cv.types.ts
export type CvFileType = "pdf" | "docx";

/**
 * A single uploaded CV file, whether shown in "Recent Files"
 * or inside a folder listing.
 */
export interface CvFile {
  id: string;
  candidateName: string;
  fileType: CvFileType;
  fileSizeMb: number;
  folderId: string | null;
  uploadedAt: string; // ISO string
  downloadUrl: string;
}

/**
 * A folder on the "Your CV's" page (e.g. "Graphic Designers", "Data Science").
 * `fileCount` is denormalized so the grid doesn't need a join on every render.
 */
export interface CvFolder {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
}

src/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
}


.env.local
# Toggle preview mode: keep mock data on while backend is not running
NEXT_PUBLIC_USE_MOCK_DATA=true

# Main backend — jobs, candidates, CV storage/folders
NEXT_PUBLIC_CORE_API_URL=http://localhost:4000/api

# Separate AI analysis service — criteria generation, resume scoring
NEXT_PUBLIC_AI_API_URL=http://localhost:5000/api

# TODO(auth): add auth-related env vars here once the auth strategy is decided
# e.g. NEXT_PUBLIC_AUTH_DOMAIN=, CORE_API_SECRET_KEY= (server-only, no NEXT_PUBLIC_ prefix)