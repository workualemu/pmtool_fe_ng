import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';
import { HttpPageResponse } from '../../../models/utility.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css'],
})
export class ClientListComponent implements OnInit {

  constructor(private svc: ClientService) {}
  // query params
  pageNumber = signal(0);
  pageSize   = signal(5);
  sortBy     = signal<'description' | 'name' | 'id' >('id');
  sortDir    = signal<'asc' | 'desc'>('asc');

  // data state
  loading = signal(false);
  error   = signal<string | null>(null);
  page    = signal<HttpPageResponse<Client> | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.svc.getClients({
      pageNumber: this.pageNumber(),
      pageSize:   this.pageSize(),
      sortBy:     this.sortBy(),
      sortDir:    this.sortDir(),
    }).subscribe({
      next: (res) => { this.page.set(res); this.loading.set(false); },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load clients');
        this.loading.set(false);
      }
    });
  }

  // UI helpers
  trackById = (_: number, c: Client) => c.clientId;

  changePage(delta: number) {
    const p = this.page();
    const next = Math.max(0, (p?.pageNumber ?? 0) + delta);
    const lastIndex = Math.max(0, (p?.totalPages ?? 1) - 1);
    this.pageNumber.set(Math.min(next, lastIndex));
    this.load();
  }

  goToPage(index: number) {
    this.pageNumber.set(Math.max(0, index));
    this.load();
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.pageNumber.set(0);
    this.load();
  }

  sort(col: 'description' | 'name' | 'id' ) {
    if (this.sortBy() === col) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(col);
      this.sortDir.set('asc');
    }
    this.load();
  }
}
