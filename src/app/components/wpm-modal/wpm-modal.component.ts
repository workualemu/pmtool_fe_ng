import { Component, input, OnChanges, output, signal, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-wpm-modal',
  imports: [],
  templateUrl: './wpm-modal.component.html',
  styleUrl: './wpm-modal.component.css'
})
export class WpmModalComponent implements OnChanges{
// API
  open = input<boolean>(false);                       // controls visibility
  title = input<string>('');                     // optional header text
  widthClass = input<string>('w-96');                 // e.g., 'w-80', 'w-[28rem]', 'max-w-md'
  closeOnBackdrop = input<boolean>(true);             // click overlay to close
  closeOnEsc = input<boolean>(true);                  // press Esc to close

  // Outputs
  closed = output<void>();                            // fire after close animation
  openChange = output<boolean>();                     // enables [(open)] two-way if you want

  // Internal animation flag
  slideIn = signal(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) {
      if (this.open()) {
        setTimeout(() => this.slideIn.set(true), 0);
      } else {
        // If parent closes immediately, animate out (rare case when [(open)] is used)
        this.slideIn.set(false);
      }
    }
  }

  onOverlayClick(e: MouseEvent) {
    if (!this.closeOnBackdrop()) return;
    if (e.target === e.currentTarget) this.close();
  }

  onEsc() {
    if (this.closeOnEsc()) this.close();
  }

  close() {
    // animate out
    this.slideIn.set(false);
    // match Tailwind duration-300
    setTimeout(() => {
      this.closed.emit();
      this.openChange.emit(false); // support [(open)]
    }, 300);
  }
}
