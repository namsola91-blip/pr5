import { Component, OnInit } from '@angular/core';

import { Contact } from './contact';

import { ContactService } from './contact.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  contacts: Contact[] = [];

  selectedId: string | null = null;

  form: Contact = this.emptyContact();

  loading = false;

  error = '';

  constructor(
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  emptyContact(): Contact {
    return {
      username: '',
      email: '',
      telephone: {
        mobile: '',
        home: ''
      }
    };
  }

  async loadContacts(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.contacts =
        await this.contactService.getContacts();
    } catch {
      this.error = 'Не удалось загрузить контакты';
    } finally {
      this.loading = false;
    }
  }

  newContact(): void {
    this.selectedId = null;
    this.form = this.emptyContact();
    this.error = '';
  }

  selectContact(contact: Contact): void {
    this.selectedId = contact._id || null;

    this.form = {
      username: contact.username,
      email: contact.email,
      telephone: {
        mobile: contact.telephone.mobile,
        home: contact.telephone.home
      }
    };

    this.error = '';
  }

  async saveContact(): Promise<void> {
    if (
      !this.form.username.trim() ||
      !this.form.email.includes('@')
    ) {
      this.error = 'Заполните имя и корректный email';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      if (this.selectedId) {
        await this.contactService.updateContact(
          this.selectedId,
          this.form
        );
      } else {
        await this.contactService.createContact(
          this.form
        );
      }

      this.contacts =
        await this.contactService.getContacts();

      this.newContact();
    } catch {
      this.error = 'Ошибка сохранения контакта';
    } finally {
      this.loading = false;
    }
  }

  async deleteContact(): Promise<void> {
    if (!this.selectedId) {
      return;
    }

    if (!confirm('Удалить выбранный контакт?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.contactService.deleteContact(
        this.selectedId
      );

      this.contacts =
        await this.contactService.getContacts();

      this.newContact();
    } catch {
      this.error = 'Ошибка удаления контакта';
    } finally {
      this.loading = false;
    }
  }

  async deleteAll(): Promise<void> {
    if (!confirm('Удалить все контакты?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.contactService.deleteAll();

      this.contacts = [];

      this.newContact();
    } catch {
      this.error = 'Не удалось удалить контакты';
    } finally {
      this.loading = false;
    }
  }
}
