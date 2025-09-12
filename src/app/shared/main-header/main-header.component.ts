import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ClickOutsideDirective],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.css'
})
export class MainHeaderComponent {
  @Input() collapsed: boolean = false;
  notificationsCount = 3;
  isDark = signal(false);
  lang = signal<'EN' | 'FR'>('EN');
  showLang = signal(false);
  showProfile = signal(false);

  ngOnInit() {
    // Initialize theme from localStorage / OS preference
    // const saved = localStorage.getItem('theme');
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // const shouldDark = saved ? saved === 'dark' : prefersDark;
    // this.applyDark(shouldDark);
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeAll(); }

  closeAll() {
    this.showLang.set(false);
    this.showProfile.set(false);
  }

  toggleDark() {
    this.applyDark(!this.isDark());
  }

  private applyDark(value: boolean) {
    this.isDark.set(value);
    const root = document.documentElement;
    if (value) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  setLang(code: 'EN' | 'FR') {
    this.lang.set(code);
    this.showLang.set(false);
    // TODO: hook into your i18n service here
  }

  onNotifClick() {
    // TODO: open notifications panel / route
    console.log('Open notifications');
  }
}

