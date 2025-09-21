import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

type Hex = `#${string}`;

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
  template: `
  <div class="relative inline-block">
    <!-- Trigger -->
    <button
      type="button"
      class="flex items-center gap-2 rounded border px-3 py-2 w-[12rem] justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      [attr.aria-expanded]="open"
      [attr.aria-label]="label || 'Color picker'"
      (click)="toggle()"
      [disabled]="disabled"
    >
      <span class="inline-flex items-center gap-2">
        <span class="h-5 w-5 rounded border shadow-inner" [style.background]="value || '#ffffff'"></span>
        <span class="text-sm font-medium tabular-nums">{{ value?.toUpperCase() }}</span>
      </span>
      <svg class="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.185l3.71-3.955a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
      </svg>
    </button>

    <!-- Popover (fixed so it cannot be clipped by modal header/body) -->
    @if (open) {
      <div
        #panel
        class="fixed z-[9999] min-w-[18rem] max-w-[90vw] rounded-xl border bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        [style.left.px]="panelX"
        [style.top.px]="panelY"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-label="Color options"
      >
        <!-- Preset palette -->
        <div class="mb-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Preset</span>
            <button class="text-xs underline opacity-70 hover:opacity-100" type="button" (click)="reset()">Reset</button>
          </div>

          <div class="grid grid-cols-10 gap-2">
            @for (c of presets; track c) {
              <button
                type="button"
                class="group relative h-7 w-7 rounded-md border shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                [style.background]="c"
                (click)="pick(c)"
                [attr.aria-label]="c"
              >
                @if (c.toLowerCase() === (value || '').toLowerCase()) {
                  <span class="absolute inset-0 rounded-md ring-2 ring-blue-500"></span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Custom -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Custom</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              class="h-9 w-12 rounded border"
              [value]="value"
              (input)="onColorInput($any($event.target).value)"
            >
            <input
              #hexBox
              type="text"
              class="flex-1 rounded border px-2 py-2 font-mono text-sm"
              [value]="value"
              (input)="onHexTyped($any($event.target).value)"
              placeholder="#AABBCC"
              maxlength="7"
            >
            <button type="button" class="rounded border px-2 py-2 text-sm" (click)="applyHex(hexBox.value)">Apply</button>
          </div>
          @if (hexError) {
            <p class="text-xs text-red-600">Enter a valid 6-digit HEX like #3B82F6</p>
          }
        </div>

        <!-- Recents -->
        @if (recents.length) {
          <div class="mt-3">
            <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Recent</div>
            <div class="flex flex-wrap gap-2">
              @for (c of recents; track c) {
                <button
                  type="button"
                  class="h-6 w-6 rounded border shadow-inner"
                  [style.background]="c"
                  [attr.aria-label]="c"
                  (click)="pick(c)"
                ></button>
              }
            </div>
          </div>
        }

        <!-- Actions -->
        <div class="mt-3 flex items-center justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2" (click)="close()">Close</button>
          <button type="button" class="rounded bg-blue-600 px-3 py-2 text-white" (click)="confirm()">Use Color</button>
        </div>
      </div>
    }
  </div>
  `,
})
export class ColorPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label?: string;
  @ViewChild('panel') panelRef?: ElementRef<HTMLDivElement>;

  open = false;
  value: Hex = '#3b82f6';
  disabled = false;
  touched = false;

  hexError = false;

  panelX = 0;
  panelY = 0;

  presets: Hex[] = [
    '#000000','#111827','#374151','#6B7280','#9CA3AF','#D1D5DB','#E5E7EB','#F3F4F6','#FFFFFF',
    '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6',
    '#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e'
  ];
  recents: Hex[] = [];

  private onChange: (val: Hex) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void { this.loadRecents(); }
  ngOnDestroy(): void {}

  writeValue(val: Hex | null): void { if (val) this.value = val; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  toggle() { if (!this.disabled) (this.open ? this.close() : this.openPanel()); }
  openPanel() {
    this.open = true;
    queueMicrotask(() => this.reposition());
  }
  close() { this.open = false; this.markTouched(); }
  confirm() { this.pick(this.value); this.close(); }
  reset() { this.pick('#3b82f6'); }

  pick(c: string) {
    const hex = this.normalizeHex(c);
    if (!hex) return;
    this.value = hex as Hex;
    this.onChange(this.value);
    this.saveRecent(this.value);
    this.hexError = false;
  }

  onColorInput(hex: string) { this.pick(hex); }
  onHexTyped(raw: string) { this.hexError = !this.normalizeHexLoose(raw); }
  applyHex(raw: string) {
    const hex = this.normalizeHex(raw);
    this.hexError = !hex;
    if (hex) this.pick(hex);
  }

  private reposition() {
    const panel = this.panelRef?.nativeElement;
    if (!panel) return;

    const trigger = panel.parentElement as HTMLElement;
    const t = trigger.getBoundingClientRect();

    const gap = 8;
    const panelW = panel.offsetWidth || 288;
    const panelH = panel.offsetHeight || 240;

    let x = t.left;
    let y = t.bottom + gap;

    if (x + panelW > window.innerWidth - 8) x = Math.max(8, t.right - panelW);
    if (x < 8) x = 8;

    if (y + panelH > window.innerHeight - 8) y = Math.max(8, t.top - panelH - gap);

    this.panelX = Math.round(x);
    this.panelY = Math.round(y);
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange() { if (this.open) this.reposition(); }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.open) return;
    const panel = this.panelRef?.nativeElement;
    const host = (panel?.parentElement ?? null) as HTMLElement | null;
    if (host && !host.contains(ev.target as Node)) this.close();
  }

  private markTouched() {
    if (!this.touched) { this.onTouched(); this.touched = true; }
  }

  private normalizeHexLoose(input: string): Hex | null {
    const txt = input.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{6}$/.test(txt)) return (`#${txt.toLowerCase()}`) as Hex;
    return null;
  }
  private normalizeHex(input: string): Hex | null {
    const hx = this.normalizeHexLoose(input);
    return hx ? hx : null;
  }

  private loadRecents() {
    try {
      const raw = localStorage.getItem('app.color.recents');
      this.recents = raw ? JSON.parse(raw) : [];
    } catch { this.recents = []; }
  }
  private saveRecent(hex: Hex) {
    const list = [hex, ...this.recents.filter(c => c.toLowerCase() !== hex.toLowerCase())].slice(0, 10);
    this.recents = list;
    try { localStorage.setItem('app.color.recents', JSON.stringify(list)); } catch {}
  }
}
