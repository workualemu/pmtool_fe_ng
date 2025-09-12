import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Column, TableAction } from '../../models/wpm-column.model';
import { NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-wpm-table',
  imports: [NgClass, LucideAngularModule],
  templateUrl: './wpm-table.component.html',
  styleUrl: './wpm-table.component.css'
})
export class WpmTableComponent <T = any> {
  @Input() data: T[] = [];
  @Input() columns: Column<T>[] = [];
  @Input() actions: TableAction<T>[] = [];

  @Output() action = new EventEmitter<{ id: string; row: T }>();

  onAction(id: string, row: T){
    this.action.emit({id, row});
  }
}
