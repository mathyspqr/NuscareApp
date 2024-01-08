import {
  Component,
  NgModule,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService, IUser } from '../../services';
import { UserPanelModule } from '../user-panel/user-panel.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { ThemeService } from '../../services/theme.service';
import { ThemeSelectorModule } from '../theme-selector/theme-selector.component';

import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title!: string;

  user: IUser | null = { email_personnel: '' };

  userMenuItems = [
    {
      text: 'Profile',
      icon: 'user',
      onClick: () => {
        this.router.navigate(['/profile']);
      },
    },
    {
      text: 'Déconnexion',
      icon: 'runner',
      onClick: () => {
        this.authService.logOut();
      },
    },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const userId = this.authService._user?.id_personnel;

    this.authService.getUserInfo(userId!).subscribe({
      next: (response) => {
        if (response.isOk && response.data) {
          this.user = response.data;
          console.log('user ici', this.user);
        } else {
          this.user = null;
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.user = null;
      },
    });
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  };
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelModule,
    DxToolbarModule,
    ThemeSelectorModule,
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent],
})
export class HeaderModule {}
