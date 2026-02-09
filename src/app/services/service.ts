import { Injectable } from '@angular/core';
import { User, UserFormData } from '../models/user'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St, Bangkok',
      birthDate: new Date('1990-05-15'),
      age: 33
    }
  ]
  ;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<{ status: boolean; userdata: User[]; message: string }> {
    return this.http.get<{ status: boolean; userdata: User[]; message: string }>(`${this.apiUrl}/Users/GetUserData`);
  }


  addUser(userData: UserFormData): Observable<{ status: boolean; userdata: User; message: string }> {
    return this.http.post<{ status: boolean; userdata: User; message: string }>(`${this.apiUrl}/Users/CreateUser`, userData);
  }

  updateUser(id: number, userData: UserFormData): User | null {
    const index = this.users.findIndex(user => user.id === id);
    
    if (index !== -1) {
      const birthDate = new Date(userData.birthDate);
      const age = this.calculateAge(birthDate);
      
      this.users[index] = {
        ...this.users[index],
        ...userData,
        birthDate: birthDate,
        age
      };
      
      return this.users[index];
    }
    
    return null;
  }

  private generateId(): number {
    return this.users.length > 0 
      ? Math.max(...this.users.map(user => user.id)) + 1 
      : 1;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}