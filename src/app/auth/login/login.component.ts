import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = signal(false);
  error = signal('');
  private returnUrl = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ){

  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
  }

  get userEmail(){
    return this.loginForm.get('username');
  }

  get userPassword(){
    return this.loginForm.get('password');
  }

  // onSubmit(){
  //   if(this.loginForm.invalid || this.loading()) return;
  //   this.loading.set(true);
  //   this.error.set('');
  //   const {username, password} = this.loginForm.value;
  // }

  onSubmit() {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email: email!, password: password! } as any)      
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: (err) => {
          const msg =
            err?.error?.message ??
            err?.error?.error ??
            (Array.isArray(err?.error?.errors) ? err.error.errors.join(', ') : null) ??
            'Invalid username or password';
          this.error.set(msg);
        },
      });
  }

}
