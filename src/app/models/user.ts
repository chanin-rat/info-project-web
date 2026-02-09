export interface User {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  birthDate: Date;
  age: number;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  address: string;
  birthDate: Date;
  age: number;
}

export interface UserFormDataResponse {
  status: boolean;
  userData: User;
  Message: string;
}