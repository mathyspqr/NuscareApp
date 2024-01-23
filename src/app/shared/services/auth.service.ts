import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IUser {
  email_personnel: string;
  id_personnel?: number;
  nom_personnel?: string;
  prenom_personnel?: string;
  adresse_personnel?: string;
  date_naissance_personnel?: Date;
  password?: string;
  role_personnel?:number;
}

const defaultPath = '/home';

@Injectable()
export class AuthService {
  public _user: IUser | null = null;

  get loggedIn(): boolean {
    return !!this._user;
  }

  private _lastAuthenticatedPath: string = defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(private router: Router, private http: HttpClient) {}

  async logIn(
    email: string,
    password: string
): Promise<{ isOk: boolean; data?: IUser; message?: string }> {
  try {
    const response = await fetch('/nurscare/loginaccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('User logged in before:', data);

    if (response.status === 200 && data.user) {
      this._user = {
        email_personnel: data.user.email_personnel,
        id_personnel: data.user.id_personnel,
        nom_personnel: data.user.nom_personnel,
        prenom_personnel: data.user.prenom_personnel,
        adresse_personnel: data.user.adresse_personnel,
        date_naissance_personnel: data.user.date_naissance_personnel,
        role_personnel : data.user.role_personnel
      };
      console.log('User logged in:', this._user);

      this._lastAuthenticatedPath = '/home';

      this.router.navigate([this._lastAuthenticatedPath]);

      return {
        isOk: true,
        data: this._user,
      };
    } else {
      return {
        isOk: false,
        message: data.message,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      isOk: false,
      message: 'Authentication failed due to an error',
    };
  }
}


  getUserInfo(idPersonnel: number): Observable<any> {
    return new Observable((subscriber) => {
      console.log(`Attempting to fetch user with id: ${idPersonnel}`);
      this.http.get<IUser>(`/nurscare/${idPersonnel}`).subscribe({
        next: (data) => {
          console.log('User data received:', data);
          subscriber.next({ isOk: true, data: data });
        },
        error: (error) => {
          console.error('Error fetching user:', error);
          subscriber.error({
            isOk: false,
            message: 'Failed to retrieve user data',
          });
        },
      });
    });
  }

  
  async createAccount(email: string, password: string): Promise<any> {
    try {
      const response = await this.http
        .post('/nurscare/createaccount', { email, password })
        .toPromise();
      this.router.navigate(['/create-account']);
      return {
        isOk: true,
      };
    } catch (error) {
      console.error('Failed to create account:', error);
      return {
        isOk: false,
        message: 'Failed to create account',
      };
    }
  }

  async changePassword(email: string, recoveryCode: string) {
    try {
      // Send request
      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to change password',
      };
    }
  }

  async resetPassword(email: string) {
    try {
      // Send request
      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to reset password',
      };
    }
  }

  async logOut() {
    this._user = null;
    this.router.navigate(['/login-form']);
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.loggedIn;
    const isAuthForm = [
      'login-form',
      'reset-password',
      'create-account',
      'change-password/:recoveryCode',
    ].includes(route.routeConfig?.path || defaultPath);
    if (isLoggedIn && isAuthForm) {
      this.authService.lastAuthenticatedPath = defaultPath;
      this.router.navigate([defaultPath]);
      return false;
    }
    if (!isLoggedIn && !isAuthForm) {
      this.router.navigate(['/login-form']);
    }
    if (isLoggedIn) {
      this.authService.lastAuthenticatedPath =
        route.routeConfig?.path || defaultPath;
    }
    return isLoggedIn || isAuthForm;
  }
}
