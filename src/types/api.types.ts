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
  /** Mã lỗi Axios hoặc mã lỗi nghiệp vụ do backend trả về. */
  code?: string;
  /** Lỗi theo từng field từ server, map vào react-hook-form. */
  errors?: Record<string, string[]>;
  /** Payload gốc hữu ích cho logging hoặc xử lý đặc thù theo domain. */
  details?: unknown;
  /** Correlation id do backend trả về nếu có. */
  requestId?: string;
  /** Không nhận được HTTP response, thường là lỗi mạng/CORS. */
  isNetworkError?: boolean;
  /** Request hết thời gian chờ. */
  isTimeout?: boolean;
}
