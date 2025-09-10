import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { withCredentials } from './core/with-credentials.interceptor';
import { LucideAngularModule, Home, ClipboardList, SquareKanban, ChartGantt, ChartPie, Users, Settings, CircleUserRound, LogOut, Mail, 
          Shield, Flag, Tags, ListChecks, LayoutTemplate, Settings2, ChevronRight, ChevronLeft, Menu
       } from 'lucide-angular';



export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([withCredentials])),
    importProvidersFrom(
      LucideAngularModule.pick({
        Home,
        ClipboardList,
        SquareKanban,
        ChartGantt,
        ChartPie,
        Users,
        Settings,
        CircleUserRound,
        LogOut,
        Mail,
        Shield,
        Flag,
        Tags,
        ListChecks,
        LayoutTemplate,
        Settings2,
        ChevronRight,
        ChevronLeft,
        Menu
      })),
  ]
};
