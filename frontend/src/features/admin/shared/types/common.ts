export type PaginatedResponse<T> = {
  results: T[];
  page: number;
  page_size: number;
  total: number;
};

export type ListFilters = {
  search?: string;
  page?: number;
  pageSize?: number;
};
