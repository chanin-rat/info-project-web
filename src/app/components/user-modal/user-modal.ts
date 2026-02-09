import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User, UserFormData } from '../../models/user';
import { UserService } from '../../services/service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-modal.html',
  styleUrls: ['./user-modal.css']
})
export class UserModalComponent implements OnInit {
  @Input() userId?: number;
  @Input() mode: 'view' | 'add' | 'edit' = 'view';
  @Output() close = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<User | void>();

  userForm: FormGroup;
  user?: User;
  today = new Date().toISOString().split('T')[0];
  maxDate = this.today;

  private userSubject = new BehaviorSubject<User | null>(null);
  private calculatedAgeSubject = new BehaviorSubject<number | null>(null);
  
  user$ = this.userSubject.asObservable();
  calculatedAge$ = this.calculatedAgeSubject.asObservable();
  
  displayAge$: Observable<string | number> = this.calculatedAge$.pipe(
    map(age => age !== null ? age : 'ไม่ทราบ')
  );

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      birthDate: ['', [Validators.required]]
    });

    this.userForm.get('birthDate')?.valueChanges.subscribe((value) => {
      this.calculateAge();
    });
  }

  ngOnInit(): void {
    
    if (this.userId) {
      this.loadUserById(this.userId);
    }

    if (this.mode === 'view') {
      this.userForm.disable();
    }

    if (this.userForm.get('birthDate')?.value) {
      this.calculateAge();
    }
  }

  private formatDateToInput(value: any): string {
    if (!value) return '';
    
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10); 
    } catch (e) {
      return '';
    }
  }

  private calculateAgeFromDate(birthdate: string | Date): number | null {
    if (!birthdate) return null;
    
    try {
      const d = new Date(birthdate);
      if (isNaN(d.getTime())) return null;
      
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const monthDiff = today.getMonth() - d.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      return null;
    }
  }

  private loadUserById(id: number): void {
    
    this.userService.getUsers().subscribe(
      (resp) => {
        
        if (resp && resp.status && resp.userdata) {
          const found = resp.userdata.find(u => u.id === id);
          
          if (found) {
            this.userSubject.next(found);
            this.user = found;
            
            const birthDateFormatted = this.formatDateToInput(found.birthDate);
            
            let age: number | null = null;
            if (birthDateFormatted) {
              age = this.calculateAgeFromDate(birthDateFormatted);
            } else if (found.age !== undefined && found.age !== null) {
              age = found.age;
            }
            
            
            this.calculatedAgeSubject.next(age);
            
            this.userForm.patchValue({
              firstName: found.firstName,
              lastName: found.lastName,
              address: found.address,
              birthDate: birthDateFormatted
            });
            
          }
        }
      },
      (err) => {
        console.error('Error loading user by ID:', err);
      }
    );
  }

  // คำนวณอายุจากค่าปัจจุบันใน form
  calculateAge(): void {
    const birthDateValue = this.userForm.get('birthDate')?.value;
    
    if (birthDateValue) {
      const age = this.calculateAgeFromDate(birthDateValue);
      this.calculatedAgeSubject.next(age);
    } else {
      this.calculatedAgeSubject.next(null);
    }
  }

  get formTitle(): string {
    switch(this.mode) {
      case 'add': return 'เพิ่มผู้ใช้ใหม่';
      case 'edit': return 'แก้ไขข้อมูลผู้ใช้';
      case 'view': return 'รายละเอียดผู้ใช้';
      default: return 'ผู้ใช้';
    }
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  onClose(): void {
    this.close.emit();
  }

   onSubmit(): void {
    
    if (this.userForm.valid) {
      // รับค่าอายุล่าสุด
      const currentAge = this.calculatedAgeSubject.value;
      
      const formData: UserFormData = {
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        address: this.userForm.get('address')?.value,
        birthDate: new Date(this.userForm.get('birthDate')?.value),
        age: currentAge || 0
      };


      if (this.mode === 'add') {
        this.userService.addUser(formData).subscribe({
          next: (response) => {
            if (response && response.status) {
              // Emit user object ที่สร้างจาก API
              this.userSaved.emit(response.userdata);
            } else {
              // Emit without value
              this.userSaved.emit();
            }
          },
          error: (err) => {
            this.userSaved.emit();
          }
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }


  hasError(controlName: string, errorType: string): boolean {
    const control = this.userForm.get(controlName);
    return control ? control.hasError(errorType) && (control.dirty || control.touched) : false;
  }
}