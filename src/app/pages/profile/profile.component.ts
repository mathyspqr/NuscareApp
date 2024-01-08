import { Component, OnChanges, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { NurscareService } from '../../shared/services/nuscare.service';

@Component({
  templateUrl: 'profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  employee: any = {};
  colCountByScreen: object;

  constructor(
    private authService: AuthService,
    private nurscareService: NurscareService
  ) {
    this.colCountByScreen = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
    };
  }

  ngOnInit() {
    const userId = this.authService._user?.id_personnel;

    if (userId !== undefined) {
      this.authService.getUserInfo(userId).subscribe({
        next: (userResponse) => {
          if (userResponse.isOk && userResponse.data) {
            this.employee = {
              id_personnel: userResponse.data.id_personnel,
              Email: userResponse.data.email_personnel,
              nom_personnel: userResponse.data.nom_personnel,
              prenom_personnel: userResponse.data.prenom_personnel,
              adresse_personnel: userResponse.data.adresse_personnel,
              date_naissance_personnel:
              userResponse.data.date_naissance_personnel,
            };
          }
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
        },
      });
    }
  }
  
  onFormValueChanged(e: any) {
    this.employee[e.dataField] = e.value;
    console.log('Field Changed:', e.dataField, 'New Value:', e.value);
  }

  submitForm() {
    console.log('data', this.employee);
    this.nurscareService.updateinfouser(this.employee).subscribe({
      next: (response) => {
        console.log('Form successfully submitted:', this.employee);
      },
      error: (error) => {
        console.error('Error submitting form:', error);
      },
    });
  }
}
