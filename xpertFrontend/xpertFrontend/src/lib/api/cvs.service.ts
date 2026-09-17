// import { coreClient } from "@/lib/api/core-client";
// import type { CvFile, CvFolder } from "@/types/cv.types";
// import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

// export const cvsService = {
//   uploadResume: (file: File, folderId?: string) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     if (folderId) formData.append("folderId", folderId);
//     return coreClient.upload<ApiResponse<CvFile>>("/cvs/upload", formData);
//   },

//   getFolders: () => coreClient.get<PaginatedResponse<CvFolder>>("/cvs/folders"),

//   getFolderById: (folderId: string) =>
//     coreClient.get<ApiResponse<CvFolder>>(`/cvs/folders/${folderId}`),

//   getFilesByFolder: (folderId: string) =>
//     coreClient.get<PaginatedResponse<CvFile>>(`/cvs/folders/${folderId}/files`),

//   getRecentFiles: () => coreClient.get<PaginatedResponse<CvFile>>("/cvs/recent"),

//   createFolder: (name: string) =>
//     coreClient.post<ApiResponse<CvFolder>>("/cvs/folders", { name }),
// };

import { coreClient } from "@/lib/api/core-client";
import { env } from "@/lib/api/env";
import { mockStore } from "@/lib/api/mock-store";
import type { CvFile, CvFolder } from "@/types/cv.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export const cvsService = {
  uploadResume: async (file: File, folderId?: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.uploadResume(file.name, folderId);
      return { success: true, data } satisfies ApiResponse<CvFile>;
    }
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", folderId);
    return coreClient.upload<ApiResponse<CvFile>>("/cvs/upload", formData);
  },

  getFolders: async () => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getFolders();
      return { success: true, data, meta: { total: data.length, page: 1, pageSize: data.length } } satisfies PaginatedResponse<CvFolder>;
    }
    return coreClient.get<PaginatedResponse<CvFolder>>("/cvs/folders");
  },

  getFolderById: async (folderId: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getFolderById(folderId);
      return { success: true, data } satisfies ApiResponse<CvFolder>;
    }
    return coreClient.get<ApiResponse<CvFolder>>(`/cvs/folders/${folderId}`);
  },

  getFilesByFolder: async (folderId: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getFilesByFolder(folderId);
      return { success: true, data, meta: { total: data.length, page: 1, pageSize: data.length } } satisfies PaginatedResponse<CvFile>;
    }
    return coreClient.get<PaginatedResponse<CvFile>>(`/cvs/folders/${folderId}/files`);
  },

  getRecentFiles: async () => {
    if (env.useMockData) {
      const data = await mockStore.cvs.getRecentFiles();
      return { success: true, data, meta: { total: data.length, page: 1, pageSize: data.length } } satisfies PaginatedResponse<CvFile>;
    }
    return coreClient.get<PaginatedResponse<CvFile>>("/cvs/recent");
  },

  createFolder: async (name: string) => {
    if (env.useMockData) {
      const data = await mockStore.cvs.createFolder(name);
      return { success: true, data } satisfies ApiResponse<CvFolder>;
    }
    return coreClient.post<ApiResponse<CvFolder>>("/cvs/folders", { name });
  },
};
