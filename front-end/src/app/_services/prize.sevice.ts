import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Prize } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class PrizeService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

    store(prize: Prize) {
        return this.http.post(`${environment.apiUrl}/prizes/store`, prize);
    }

    getAll() {
        return this.http.get<Prize[]>(`${environment.apiUrl}/prizes`);
    }

    getByNameAndUser(name: string, user: string) {
        return this.http.get<Prize>(`${environment.apiUrl}/prizes/id/${name}&${user}`);
    }

    getByUser(user: string) {
        return this.http.get<Prize[]>(`${environment.apiUrl}/prizes/user/${user}`);
    }

    getByCategory(category: number) {
        return this.http.get<Prize[]>(`${environment.apiUrl}/prizes/category/${category}`);
    }

    getByTimeLeft(username: string) {
        var today = Date.now();
        return this.http.get<Prize[]>(`${environment.apiUrl}/prizes/timeleft/${username}`)
        .pipe(
            map(prizes => 
            prizes.filter(prize =>
                new Date(prize.time_end).getTime() <= today && prize.already_won == false
            )));
    }

    update(name: string, user: string, params) {
        return this.http.put(`${environment.apiUrl}/prizes/${name}&${user}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(name: string, user: string) {
        return this.http.delete(`${environment.apiUrl}/prizes/${name}&${user}`)
            .pipe(map(x => {
                return x;
            }));
    }

    uploadImage(image: File) {
        const formData = new FormData();
        formData.append('image', image);
        return this.http.post(`${environment.apiUrl}/prizes/image/`, formData);
    }
}