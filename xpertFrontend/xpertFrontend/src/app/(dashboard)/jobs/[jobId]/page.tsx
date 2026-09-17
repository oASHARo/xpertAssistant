"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { JobScorePanel } from "./components/job-score-panel";
import { CandidateList } from "./components/candidate-list";
import { jobsService } from "@/lib/api/jobs.service";
import { candidatesService } from "@/lib/api/candidates.service";

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    params.then((p) => setJobId(p.jobId));
  }, [params]);

  useEffect(() => {
    if (!jobId) return;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const [jobData, candidatesData] = await Promise.all([
          jobsService.getById(jobId).then((r) => r.data),
          candidatesService.getForJob(jobId).then((r) => r.data).catch(() => ({ recommended: [], rejected: [] })),
        ]);
        
        if (!isMounted) return;

        setJob(jobData);
        setCandidates(candidatesData);
        setIsLoading(false);

        // If backend reports there are still pending analysis jobs, keep polling
        if (jobData.isProcessing) {
          timeoutId = setTimeout(fetchData, 3000);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId]);

  if (error) {
    return notFound();
  }

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading job details...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_1fr]">
      <JobScorePanel job={job} />
      <CandidateList 
        recommended={candidates?.recommended || []} 
        rejected={candidates?.rejected || []} 
        isProcessing={job?.isProcessing} 
      />
    </div>
  );
}
