export interface PaginatedResult<T> {
  data: T[];
  count: number;
  pageIndex: number;
  pageSize: number;
}
