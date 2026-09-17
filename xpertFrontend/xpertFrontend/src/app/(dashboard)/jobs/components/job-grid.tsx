"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./job-card";
import type { Job } from "@/types/job.types";

export interface JobGridProps {
  jobs: Job[];
}

export function JobGrid({ jobs }: JobGridProps) {
  const [cols, setCols] = useState(0);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1280) setCols(4);
      else if (window.innerWidth >= 1024) setCols(3);
      else if (window.innerWidth >= 640) setCols(2);
      else setCols(1);
    };
    
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);
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

  // SSR fallback to standard grid
  if (cols === 0) {
    return (
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {jobs.map((job) => (
          <div key={job.id} className="min-w-0">
            <JobCard job={job} />
          </div>
        ))}
      </div>
    );
  }

  // Left-to-Right Masonry distribution
  const columns: Job[][] = Array.from({ length: cols }, () => []);
  jobs.forEach((job, index) => {
    columns[index % cols].push(job);
  });

  return (
    <div 
      className="grid gap-4" 
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {columns.map((colJobs, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4 min-w-0">
          {colJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ))}
    </div>
  );
}