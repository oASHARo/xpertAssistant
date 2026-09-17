// import { coreClient } from "@/lib/api/core-client";
// import type { JobCandidatesResponse } from "@/types/candidate.types";
// import type { ApiResponse } from "@/types/api.types";

// export const candidatesService = {
//   getForJob: (jobId: string) =>
//     coreClient.get<ApiResponse<JobCandidatesResponse>>(`/jobs/${jobId}/candidates`),
// };
import { coreClient } from "@/lib/api/core-client";
import { env } from "@/lib/api/env";
import { mockStore } from "@/lib/api/mock-store";
import type { JobCandidatesResponse } from "@/types/candidate.types";
import type { ApiResponse } from "@/types/api.types";

export const candidatesService = {
  getForJob: async (jobId: string) => {
    if (env.useMockData) {
      const data = await mockStore.candidates.getForJob(jobId);
      return { success: true, data } satisfies ApiResponse<JobCandidatesResponse>;
    }
    return coreClient.get<ApiResponse<JobCandidatesResponse>>(`/jobs/${jobId}/candidates`);
  },
};
