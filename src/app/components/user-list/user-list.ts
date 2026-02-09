import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModalComponent } from '../user-modal/user-modal';
import { User } from '../../models/user';
import { UserService } from '../../services/service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserModalComponent],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isModalOpen = false;
  selectedUserId?: number;
  modalMode: 'view' | 'add' | 'edit' = 'view';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (response) => {
        if (response && response.status) {
          this.users = (response.userdata ?? []).map(u => {
            const d = new Date((u as any).birthDate);
            return {
              ...u,
              birthDate: isNaN(d.getTime()) ? null : d
            } as User;
          });
        } else {
          this.users = [];
        }
      },
      (err) => {
        console.error(err);
        this.users = [];
      }
    );
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedUserId = undefined;
    this.isModalOpen = true;
  }

  openViewModal(id: number): void {
    this.modalMode = 'view';
    this.selectedUserId = id;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  handleUserSaved(eventOrUser: any): void {
    // If child emitted a DOM Event (fallback), reload full list
    if (eventOrUser instanceof Event) {
      this.loadUsers();
    } else if (eventOrUser && typeof eventOrUser === 'object' && 'id' in eventOrUser) {
      // If child emitted the created User object, append it
      this.users = [...this.users, eventOrUser as User];
    } else {
      // fallback: reload full list
      this.loadUsers();
    }
    this.closeModal();
  }
}