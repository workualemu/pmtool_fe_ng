import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';

export interface ConfirmConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  closeOnBackdrop?: boolean; // default false
}

@Component({
  selector: 'app-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop (click disabled by default) -->
    <div
      class="fixed inset-0 z-[99990] bg-black/40"
      (click)="cfg.closeOnBackdrop && requestClose(false)"
      aria-hidden="true">
    </div>

    <!-- Centered container -->
    <div class="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
      <!-- Dialog panel -->
      <div
        #panel
        class="pointer-events-auto w-full max-w-md rounded-2xl
               bg-white dark:bg-gray-900 dark:text-gray-100 shadow-2xl transform-gpu"
        [attr.data-state]="state"
        role="dialog" aria-modal="true" aria-labelledby="confirm-title"
        (animationend)="onPanelAnimEnd($event)">

        <div class="p-6">
          <h2 id="confirm-title" class="text-lg font-semibold"
              [class.text-red-600]="cfg.danger">
            {{ cfg.title }}
          </h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {{ cfg.message }}
          </p>
        </div>

        <div class="px-6 pb-6 flex justify-between gap-2">
          <button type="button"
                  class="h-9 rounded-xl px-4 border border-gray-300 dark:border-gray-700
                         text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  (click)="requestClose(false)">
            {{ cfg.cancelText }}
          </button>

          <button #primary id="confirm-primary-btn" type="button"
                  class="h-9 rounded-xl px-4 text-white focus:outline-none transition-colors
                         disabled:opacity-60"
                  [class.bg-red-600]="cfg.danger" [class.hover\\:bg-red-700]="cfg.danger"
                  [class.bg-blue-600]="!cfg.danger" [class.hover\\:bg-blue-700]="!cfg.danger"
                  (click)="requestClose(true)">
            {{ cfg.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Bounce in/out is on the panel element (the one with [data-state]) */
    [data-state="in"]  { animation: dlgIn 260ms cubic-bezier(.2,.8,.2,1) forwards; }
    [data-state="out"] { animation: dlgOut 180ms cubic-bezier(.4,0,1,1) forwards; }

    @keyframes dlgIn {
      0%   { opacity: 0; transform: translateY(8px)  scale(.96); }
      60%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
      100% { opacity: 1; transform: translateY(0)    scale(1); }
    }
    @keyframes dlgOut {
      0%   { opacity: 1; transform: translateY(0)    scale(1); }
      100% { opacity: 0; transform: translateY(6px)  scale(.98); }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-state] { animation: none !important; }
    }
  `],
})
export class ConfirmComponent implements AfterViewInit {
  @Input({ required: true }) cfg!: ConfirmConfig;
  @Output() closed = new EventEmitter<boolean>();
  @ViewChild('panel',   { static: true }) panel!: ElementRef<HTMLElement>;
  @ViewChild('primary', { static: true }) primaryBtn!: ElementRef<HTMLButtonElement>;

  state: 'in' | 'out' = 'in';
  private result = false;
  private closedOnce = false;
  private fallbackTimer: any = null;

  ngAfterViewInit(): void {
    // autofocus primary for accessibility
    queueMicrotask(() => this.primaryBtn?.nativeElement.focus());
  }

  requestClose(val: boolean) {
    this.result = val;

    // If user prefers reduced motion, close immediately
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.finishClose();
      return;
    }

    // Play bounce-out, then close on animationend (with a safety timer)
    this.state = 'out';
    clearTimeout(this.fallbackTimer);
    this.fallbackTimer = setTimeout(() => this.finishClose(), 240);
  }

  onPanelAnimEnd(e: AnimationEvent) {
    if (this.state === 'out' && e.animationName === 'dlgOut') {
      this.finishClose();
    }
  }

  private finishClose() {
    if (this.closedOnce) return;
    this.closedOnce = true;
    clearTimeout(this.fallbackTimer);
    this.closed.emit(this.result);
  }

  // Keyboard: Esc cancels, Enter confirms
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); this.requestClose(false); }
    if (e.key === 'Enter')  { e.preventDefault(); this.requestClose(true); }
  }
}
