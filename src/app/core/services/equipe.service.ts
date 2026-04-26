import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EquipeService {

  private api = 'http://localhost:8080/equipe';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api + '/all');
  }

  add(data: any) {
    return this.http.post(this.api + '/add', data);
  }

 delete(id: string) {
  return this.http.delete(this.api + '/delete/' + id, {
    responseType: 'text' // 🔥 important
  });
}

  update(data: any) {
    return this.http.put(this.api + '/update', data);
  }
}