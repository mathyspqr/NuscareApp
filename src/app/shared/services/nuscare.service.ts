import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class NurscareService {
  private baseUrl = '/nurscare';
  private googleMapsGeocodingApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  private apiKey = 'AIzaSyC6aoXl4XsKf8pHYAXD-SGcxZVO0D7R33c';

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/`);
  }

  getPatient(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/patient/`);
  }

  getInterventions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/agendasinterventions/`);
  }

  getInterventionsSoignant(idPersonnel: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/agendasinterventions/${idPersonnel}`);
  }  

  getPrestations(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/agendasprestations/`);
  }

  getPrestationsall(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/agendasprestationsall/`);
  }

  addIntervention(interventionForm: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/addintervention`, interventionForm).pipe(
    );
  }

  addPrestation(prestationForm: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/addprestation`, prestationForm).pipe(
    );
  }
    
  createPatient(patientData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createpatient`, patientData);
  }

  deletePatient(patientId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deletepatient/${patientId}`);
  }  

  deleteIntervention(id_intervention: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteintervention/${id_intervention}`);
  } 

  deletePrestation(id_prestation: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteprestation/${id_prestation}`);
  }

  modifiedPatient(patientId: number, patientData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updatepatient/${patientId}`, patientData);
  }
  
  updateinfouser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/submitform`, userData);
  }

  getItineraire(adresseInfo: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/calculate-routes`, adresseInfo);
  }

  updateIntervention(interventionInfo: any): Observable<any> {
    const idIntervention = interventionInfo.id_intervention;
    return this.http.put<any>(`${this.baseUrl}/updateintervention/${idIntervention}`, interventionInfo);
  }
  
  geocodeAddress(address: string): Observable<any> {
    const encodedAddress = encodeURIComponent(address);
    const apiUrl = `${this.googleMapsGeocodingApiUrl}?address=${encodedAddress}&key=${this.apiKey}`;
    return this.http.get(apiUrl);
  }

  addPrestationIntoExistentIntervention(idIntervention: number, prestationForm: any): Observable<any> {
    const url = `${this.baseUrl}/ajouter-prestation/${idIntervention}`;
    return this.http.post(url, prestationForm);
  }

  sendInvoice(mailOptions: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/envoiefacture`, mailOptions);
  }
  
}
