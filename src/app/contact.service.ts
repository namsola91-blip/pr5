import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { Contact } from './contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly apiUrl = '/v1/contact';

  constructor(private http: HttpClient) {}

  getContacts(): Promise<Contact[]> {
    return firstValueFrom(
      this.http.get<Contact[]>(this.apiUrl)
    );
  }

  getContact(id: string): Promise<Contact> {
    return firstValueFrom(
      this.http.get<Contact>(`${this.apiUrl}/${id}`)
    );
  }

  createContact(contact: Contact): Promise<Contact> {
    return firstValueFrom(
      this.http.post<Contact>(this.apiUrl, contact)
    );
  }

  updateContact(
    id: string,
    contact: Contact
  ): Promise<Contact> {
    return firstValueFrom(
      this.http.put<Contact>(
        `${this.apiUrl}/${id}`,
        contact
      )
    );
  }

  deleteContact(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/${id}`)
    );
  }

  deleteAll(): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(this.apiUrl)
    );
  }
}
