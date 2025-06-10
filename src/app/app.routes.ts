import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ServiceFolderComponent } from './components/dashboard/service-folder/service-folder.component';
import { ServiceDetailsComponent } from './components/dashboard/service-details/service-details.component';
import { ServiceProfileComponent } from './components/dashboard/service-profile/service-profile.component';
import { ServiceEntriesComponent } from './components/dashboard/service-entries/service-entries.component';
import { AccountInfoComponent } from './components/account-info/account-info.component';
import { GuidelineComponent } from './components/guideline/guideline.component';
import { VerifyOtpComponent } from './components/signup/verify-otp/verify-otp.component';
import { SupportComponent } from './components/support/support.component';
import { ShareComponent } from './components/share/share.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signup/verify-otp', component: VerifyOtpComponent },
  { path: 'signup/complete-registration', loadComponent: () => import('./components/signup/complete-registration/complete-registration.component').then(m => m.CompleteRegistrationComponent) },
  { 
    path: 'dashboard', 
    component: DashboardComponent
  },
  { 
    path: 'config', 
    component: ServiceFolderComponent
  },
  { 
    path: 'config/:serviceName', 
    component: ServiceDetailsComponent
  },
  { path: 'config/:serviceName/profiles', component: ServiceProfileComponent },
  { path: 'config/:serviceName/profiles/:profileName/entries', component: ServiceEntriesComponent },
  { path: 'account', component: AccountInfoComponent },
  {
    path: 'user',
    children: [
      { path: 'information', component: AccountInfoComponent },
      { path: 'guideline', component: GuidelineComponent },
      { path: 'support', component: SupportComponent }
    ]
  },
  { 
    path: 'share/:account/:service/:profile', 
    component: ShareComponent
  },
  { path: '**', redirectTo: '/login' }
];
