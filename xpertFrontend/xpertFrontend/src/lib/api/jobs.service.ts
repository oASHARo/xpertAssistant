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

  update: (jobId: string, payload: Partial<CreateJobPayload>) =>
    coreClient.patch<ApiResponse<JobDetail>>(`/jobs/${jobId}`, payload),

  delete: (jobId: string) => coreClient.delete<void>(`/jobs/${jobId}`),
};
