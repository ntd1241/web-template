/** Kiểu response/request dùng chung cho toàn app. */

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Lỗi đã được chuẩn hóa bởi axios interceptor (xem `@/lib/axios`). */
export interface ApiError {
  message: string;
  status?: number;
  /** Lỗi theo từng field từ server, map vào react-hook-form. */
  errors?: Record<string, string[]>;
}
