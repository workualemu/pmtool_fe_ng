import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Client, ListClientsOptions, PageResponse } from '../models/client.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  
  constructor(private http: HttpClient) { }

  // getClients(pageNumber: number, pageSize: number, sortBy: string, sortDir: 'asc' | 'desc') {
  //   return this.http.get<any>(`environment.apiUrl/clients`, {
  // }

  getClients(opts: Partial<ListClientsOptions> = {}): Observable<PageResponse<Client>> {
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

    return this.http.get<PageResponse<Client>>(`${environment.apiUrl}/system/clients`, { params });
  }
}
