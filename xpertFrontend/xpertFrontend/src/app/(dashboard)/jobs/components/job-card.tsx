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
    <Link href={ROUTES.jobDetail(job.id)} className="block">
      <Card className="border-0 shadow-sm transition-shadow hover:shadow-md flex flex-col">
        <CardHeader className="flex-col items-stretch gap-1">
          <p className="text-xs text-gray-400">{job.category}</p>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="break-words whitespace-normal">{job.title}</CardTitle>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <Badge variant="green" className="px-2 py-0.5 text-xs">Short-List: {job.shortListCount}</Badge>
              <Badge variant="cyan" className="px-2 py-0.5 text-xs">Resume: {job.resumeCount}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div 
            className="mt-4 mb-4 max-h-[10rem] overflow-hidden relative"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 6rem, transparent 10rem)',
              maskImage: 'linear-gradient(to bottom, black 6rem, transparent 10rem)'
            }}
          >
            <p className="text-sm text-text-muted whitespace-pre-wrap">{job.description}</p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-text-main">Analysis Ratio</p>
            <RatioBar matchedPercent={job.analysisRatio.matchedPercent} />
          </div>

          {job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-text-main">Skills Set:</span>
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="cyan">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <span className="text-xs text-gray-400">
            Created on <span className="font-semibold text-text-main">{formatCardDate(job.createdAt)}</span>
          </span>
          <span className="text-xs text-gray-400 break-all">{job.createdByEmail}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}