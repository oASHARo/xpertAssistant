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
        rejectedCount: 0,
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