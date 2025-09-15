import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpListOptions, HttpPageResponse } from '../models/utility.model';

const API = `${environment.apiUrl}/system/clients`;

export interface Client {
  clientId: number;
  code?: string;
  clientName: string;
  description: string;
  // add other fields your backend returns
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);

  getClients(opts: Partial<HttpListOptions> = {}): Observable<HttpPageResponse<Client>> {
    const {
      pageNumber = 0,
      pageSize = 5,
      sortBy = 'description',
      sortDir = 'desc',
    } = opts;

    const params = new HttpParams({
      fromObject: {
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
        sortBy,
        sortDir,
      },
    });

    // Thanks to your withCreds interceptor, cookies are included automatically.
    return this.http.get<HttpPageResponse<Client>>(API, { params });
  }
}
