// Matches exactly what the Express backend returns
export interface ApiResponse<T> {
  success: boolean; statusCode: number;
  message: string;  data: T;
}
export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number;
  limit: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
}