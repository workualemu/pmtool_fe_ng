// src/app/auth/auth.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginBody, UserDTO } from './auth.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<UserDTO | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());

  constructor(private http: HttpClient) {}

  login(body: LoginBody) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, body)
      .pipe(
        tap(res => this.user.set(this.normalizeUser(res)))
      );
  }

  logout(){
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.user.set(null))
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private normalizeUser(res: any): UserDTO | null {
    if (!res || typeof res !== 'object') return this.user();
    const u: UserDTO = {
      id: res.id,
      email: res.email,
      first_name: res.first_name,
      last_name: res.last_name,
      client_id: res.client_id,
      recent_project_id: res.recent_project_id
    };
    return u;
  }
}
