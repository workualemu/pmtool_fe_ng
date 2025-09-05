// Interceptor to always send cookies to your API origin
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const BASE = environment.apiUrl.replace(/\/+$/, '');

export const withCredentials: HttpInterceptorFn = (req, next) => {
  const shouldAttach = req.url.startsWith(BASE) || req.url.startsWith('/api'); 
  return next(shouldAttach ? req.clone({ withCredentials: true }) : req);
};
