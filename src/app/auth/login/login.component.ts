import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth.service'; // adjust path if needed
import { finalize } from 'rxjs';
import { UserDTO } from '../auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  user: UserDTO | null = null;
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // UI state
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });
  returnUrl = 'tasks';

  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

   submit() {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.getRawValue();

    this.auth.login({ email: email!, password: password! } as any)      
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.user = res;
          if(this.user?.clientId == 0){
            this.router.navigateByUrl('systemhome');
          } else {
            this.router.navigateByUrl('clienthome');
          }
        },
        error: (err) => {
          const msg =
            err?.error?.message ??
            (Array.isArray(err?.error?.errors) ? err.error.errors.join(', ') : null) ??
            'Invalid username or password';
          this.error.set(msg);
        },
      });
  }
}
