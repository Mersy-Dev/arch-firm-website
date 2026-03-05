import { CONSTANTS } from '../config/constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const getPaginationParams = (
  pageQuery: unknown,
  limitQuery: unknown,
): PaginationParams => {
  const page = Math.max(1, parseInt(String(pageQuery || 1)));
  const limit = Math.min(
    CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(String(limitQuery || CONSTANTS.DEFAULT_PAGE_SIZE))),
  );
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / limit);
  return {
    data, total, page, limit, totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};