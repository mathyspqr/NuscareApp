import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class NurscareService {
  private baseUrl = '/nurscare';

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/`);
  }

  getPatient(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/patient/`);
  }

  createPatient(patientData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createpatient`, patientData);
  }

  deletePatient(patientId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deletepatient/${patientId}`);
  }  

  modifiedPatient(patientId: number, patientData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updatepatient/${patientId}`, patientData);
  }
  
  updateinfouser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/submitform`, userData);
  }
}
