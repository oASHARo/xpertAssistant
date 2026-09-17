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