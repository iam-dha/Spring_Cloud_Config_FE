import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { HeaderComponent } from './components/shared/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'spring_cloud_config_fe';
  isLoginPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginPage = ['/login', '/signup', '/signup/verify-otp', '/signup/complete-registration'].includes(event.urlAfterRedirects);
    });
  }

  shouldShowHeader(): boolean {
    const currentRoute = this.router.url;
    return !['/login', '/signup', '/signup/verify-otp', '/signup/complete-registration'].includes(currentRoute);
  }
}
