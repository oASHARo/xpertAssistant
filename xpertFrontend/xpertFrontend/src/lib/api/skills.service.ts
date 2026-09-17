import { coreClient } from "@/lib/api/core-client";
import type { ApiResponse } from "@/types/api.types";

export interface Skill {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const skillsService = {
  list: () => coreClient.get<ApiResponse<Skill[]>>("/skills"),
  create: (name: string) =>
    coreClient.post<ApiResponse<Skill>>("/skills", { name }),
};
