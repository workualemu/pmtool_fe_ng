import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Column, TableAction } from '../../models/wpm-column.model';
import { NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HttpPageResponse } from '../../models/utility.model';

@Component({
  selector: 'app-wpm-table',
  imports: [NgClass, LucideAngularModule],
  templateUrl: './wpm-table.component.html',
  styleUrl: './wpm-table.component.css'
})
export class WpmTableComponent <T = any> {
  @Input() data: HttpPageResponse<T> | null = null;
  @Input() columns: Column<T>[] = [];
  @Input() actions: TableAction<T>[] = [];

  @Output() action = new EventEmitter<{ id: string; row: T }>();

  onAction(id: string, row: T){
    this.action.emit({id, row});
  }

  textOn(hexLike: unknown): string {
    const hex = this.normalizeHex(hexLike);
    if (!hex) return '#111827'; // slate-800 fallback
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const L = 0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255);
    return L > 0.54 ? '#111827' : '#ffffff';
  }

  private normalizeHex(v: unknown): string | null {
    if (typeof v !== 'string') return null;
    const m = /^#?([0-9a-f]{6})$/i.exec(v.trim());
    return m ? `#${m[1].toLowerCase()}` : null;
  }
}
