export interface Client {
  clientId: number;
  clientName: string;
  description?: string;
  createdByName?: string;
  updatedByName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}