// import { coreClient } from "@/lib/api/core-client";
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
//  * later) funnels through here, using coreClient. Components/hooks never need to know or
//  * care that this hits a different service than jobsService; they just
//  * call analysisService.generateCriteria(...).
//  */
// export const analysisService = {
//   generateCriteria: (payload: GenerateCriteriaPayload) =>
//     coreClient.post<ApiResponse<JobCriterion[]>>("/criteria/generate", payload, { timeoutMs: 30000 }),
// };

import { coreClient } from "@/lib/api/core-client";
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
    return coreClient.post<ApiResponse<JobCriterion[]>>("/criteria/generate", payload, { timeoutMs: 30000 });
  },
  listCriteria: () =>
    coreClient.get<ApiResponse<JobCriterion[]>>("/criteria"),
  createCriterion: (payload: {
    title: string;
    description: string;
    metadata?: { ratingCalculationExplanation?: string; idealAnswer?: string };
  }) => coreClient.post<ApiResponse<JobCriterion>>("/criteria", payload),
  updateCriterion: (id: string, payload: {
    title?: string;
    description?: string;
    status?: "active" | "inactive";
    metadata?: { ratingCalculationExplanation?: string; idealAnswer?: string };
  }) => coreClient.patch<ApiResponse<JobCriterion>>(`/criteria/${id}`, payload),
  deleteCriterion: (id: string) =>
    coreClient.delete<ApiResponse<null>>(`/criteria/${id}`),
};
