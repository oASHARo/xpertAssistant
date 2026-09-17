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
  rejectedCount: number;
  resumeCount: number;
  analysisRatio: AnalysisRatio;
  isProcessing?: boolean;
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