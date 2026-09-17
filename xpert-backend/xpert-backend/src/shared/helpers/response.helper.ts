export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message === undefined ? {} : { message }),
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  message?: string,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    meta: { total, page, pageSize },
    ...(message === undefined ? {} : { message }),
  };
}
