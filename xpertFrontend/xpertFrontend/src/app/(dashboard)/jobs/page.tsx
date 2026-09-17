"use client";

import { useState, useEffect, use } from "react";
import { JobGrid } from "./components/job-grid";
import { JobSearchBar } from "./components/job-search-bar";
import { jobsService } from "@/lib/api/jobs.service";
import type { Job } from "@/types/job.types";

interface JobDashboardPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default function JobDashboardPage({ searchParams }: JobDashboardPageProps) {
  const [search, setSearch] = useState<string | undefined>();
  const [isParamsResolved, setIsParamsResolved] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    searchParams.then((p) => {
      setSearch(p.search);
      setIsParamsResolved(true);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!isParamsResolved) return;
    let isMounted = true;
    setIsLoading(true);
    setFetchFailed(false);

    jobsService.getAll(search ? { search } : undefined)
      .then((response) => {
        if (isMounted) {
          setJobs(response.data);
          setTotal(response.meta.total);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFetchFailed(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [search, isParamsResolved]);

  return (
    <div className="flex h-full flex-col">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Job Dashboard</h1>
        <div className="mt-4">
          <JobSearchBar />
        </div>
        {isLoading ? (
          <p className="mt-4 text-sm text-gray-500">Loading jobs...</p>
        ) : fetchFailed ? (
          <p className="mt-4 text-sm text-amber-600">Failed to load jobs. Please check your connection.</p>
        ) : (
          <div className="mt-8">
            <h2 className="text-[15px] font-semibold text-text-main">
              Showing {total} related results
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Search as per your reference
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 min-w-0 flex-1 overflow-y-auto pr-1">
        {!isLoading && !fetchFailed && <JobGrid jobs={jobs} />}
      </div>
    </div>
  );
}
