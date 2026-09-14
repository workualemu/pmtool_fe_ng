// wpm-input.directive.ts
import { Directive } from '@angular/core';
@Directive({ selector: 'input[wpmInput],textarea[wpmInput],select[wpmInput]', standalone: true, host: { class: 'wpm-input' }})
export class WpmInputDirective {}
