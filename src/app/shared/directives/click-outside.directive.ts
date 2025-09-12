// click-outside.directive.ts
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Input() clickOutsideEnabled = true;
  @Output() clickOutside = new EventEmitter<Event>(); 

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('document:pointerdown', ['$event'])
  onPointerDown(ev: Event) {
    if (!this.clickOutsideEnabled) return;
    const target = ev.target as Node | null;
    if (target && this.host.nativeElement.contains(target)) return; // inside -> ignore
    this.clickOutside.emit(ev);
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (!this.clickOutsideEnabled) return;
    this.clickOutside.emit();
  }

}
