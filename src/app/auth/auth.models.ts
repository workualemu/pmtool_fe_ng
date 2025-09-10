import { EmailValidator } from "@angular/forms";

export interface LoginBody {
  username: string;
  password: string;
}

export interface UserDTO {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
  clientId: number;
  recent_project_id?: number;
}