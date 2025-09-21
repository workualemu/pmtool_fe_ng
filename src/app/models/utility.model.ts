export interface MainSidebarItem {
  icon: string;
  label: string;
  tooltip: string;
  redirectTo: string;
  children?: MainSidebarItem[];
}

export interface HttpPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  lastPage?: boolean;
}


export type SortDir = 'asc' | 'desc';

export interface HttpListOptions {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDir: SortDir;
}
