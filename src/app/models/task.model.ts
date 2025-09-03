export interface Task {
  id: number;
  title: string;
  start_date_planned: string;
  end_date_planned: string;
  start_date_actual: string | null;
  end_date_actual: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  description?: string;
}
