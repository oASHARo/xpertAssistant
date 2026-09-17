import { Icon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import type { JobDetail } from "@/types/job.types";

export interface JobScorePanelProps {
  job: JobDetail;
}

export function JobScorePanel({ job }: JobScorePanelProps) {
  const matchedVal = job.shortListCount;
  const rejectedVal = job.rejectedCount ?? 0;

  const total = matchedVal + rejectedVal || 1;

  const outerRadius = 70;
  const outerCircumference = Math.PI * outerRadius;
  const greenDash = (matchedVal / total) * outerCircumference;

  const innerRadius = 61;
  const innerCircumference = Math.PI * innerRadius;
  const redDash = (rejectedVal / total) * innerCircumference;

  const formattedDate = new Date(job.createdAt)
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "")
    .replace(" AM", "AM")
    .replace(" PM", "PM");

  return (
    <Card className="sticky top-0 flex h-[calc(100vh-9rem)] flex-col border-none p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex shrink-0 items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#181818]">Job Score</h3>
        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF5F5] text-[#EA4335] transition-colors hover:bg-[#FFE5E5]"
          aria-label="Delete job"
        >
          <Icon src="/assets/icons/trash.svg" className="h-[15px] w-[15px]" />
        </button>
      </div>

      <div className="relative mt-5 flex shrink-0 justify-center">
        <svg viewBox="0 0 160 85" className="w-[150px]">
          {/* Outer Background Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Outer Green Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="#16a34a"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${greenDash} ${outerCircumference}`}
          />

          {/* Inner Background Arc */}
          <path
            d="M 19 80 A 61 61 0 0 1 141 80"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Inner Red Arc */}
          <path
            d="M 19 80 A 61 61 0 0 1 141 80"
            fill="none"
            stroke="#dc2626"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${redDash} 1000`}
            strokeDashoffset={-(innerCircumference - redDash)}
          />
        </svg>
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-[1.5rem]">
          <div className="text-center">
            <div className="text-base font-semibold tracking-tight text-[#16a34a]">
              • {matchedVal.toString().padStart(2, "0")}
            </div>
            <div className="mt-0.5 text-[0.55rem] font-medium leading-tight text-gray-400">
              Short-List
              <br />
              Resumes
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-semibold tracking-tight text-[#dc2626]">
              • {rejectedVal.toString().padStart(2, "0")}
            </div>
            <div className="mt-0.5 text-[0.55rem] font-medium leading-tight text-gray-400">
              Rejected
              <br />
              Resumes
            </div>
          </div>
        </div>
      </div>

      <div className="my-4 shrink-0 border-t border-gray-100" />

      <div className="shrink-0">
        <p className="text-[11px] font-medium text-gray-400">{job.category}</p>
        <h4 className="mt-0.5 text-[18px] font-semibold text-[#181818]">
          {job.title}
        </h4>
        <div className="mt-2.5 flex gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-medium text-[#16a34a]">
            Short-List: {job.shortListCount}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#E3F2FD] px-2 py-0.5 text-[10px] font-medium text-[#3BAEEB]">
            Resume: {job.resumeCount}
          </span>
        </div>
      </div>

      {job.skills.length > 0 && (
        <div className="mt-4 shrink-0">
          <p className="mb-2 text-[11px] font-medium text-[#181818]">
            Skills Set:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-[#E3F2FD] px-2 py-0.5 text-[10px] font-medium text-[#3BAEEB]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="my-4 shrink-0 border-t border-gray-100" />

      <div className="shrink-0">
        <p className="text-[11px] font-medium text-[#181818]">
          CV&apos;s Received:
        </p>
        <p className="mt-1 text-[11px] text-[#4A4A4A]">{job.createdByEmail}</p>
      </div>

      <div className="my-4 shrink-0 border-t border-gray-100" />

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-1.5 shrink-0 text-[11px] font-medium text-[#181818]">
          Description:
        </p>
        <div
          className="flex-1 overflow-y-auto pr-3 text-[10px] leading-relaxed text-[#4A4A4A] [&_b]:font-semibold [&_b]:text-[#181818] [&_strong]:font-semibold [&_strong]:text-[#181818]"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>

      <div className="mt-4 shrink-0">
        <p className="text-[9px] text-gray-400">
          Created on:{" "}
          <span className="font-semibold text-gray-600">{formattedDate}</span>
        </p>
      </div>
    </Card>
  );
}