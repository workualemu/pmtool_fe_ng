export interface Column<T = any>{
  key: keyof T;
  label: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  justify?: 'left' | 'center' | 'right';
}

export interface TableAction<T = any>{
  id: string;
  label?: string;
  icon?: string;
}
