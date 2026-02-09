import { Component , signal} from '@angular/core';
import { UserListComponent } from '../app/components/user-list/user-list';
import { UserModalComponent } from '../app/components/user-modal/user-modal';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserListComponent, UserModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('info-project-web');
}

bootstrapApplication(App, {
  providers: [ importProvidersFrom(HttpClientModule) ]
}).catch(err => console.error(err));
