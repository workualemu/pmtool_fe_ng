export interface Client {
  clientId: number;
  clientName: string;
  description?: string;
  createdByName?: string;
  updatedByName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageSize: number;     
  pageNumber: number;   
  lastPage?: boolean;
}

export interface ListClientsOptions {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

