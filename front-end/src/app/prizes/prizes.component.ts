﻿import { Component} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalConstants } from '@app/common/global-constants';
import { Utils } from '@app/common/utils';

import { Prize, User } from '@app/_models';
import { AccountService, AlertService, PrizeService } from '@app/_services';
import { timer } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Component({ 
    selector: 'prizes-page',
    templateUrl: 'prizes.component.html',
    styleUrls: ['prizes.component.scss'] 
})
export class PrizesComponent {
    currentUser: User;
    form: FormGroup;
    formEdit: FormGroup;
    loading = false;
    submitted = false;
    needToAdd = false;
    needToEdit = false;
    sortAsc: boolean = false;
    prizeToEdit: Prize;
    pictureName = "";
    pictureFile: any;
    prizes: Prize[] = [];
    prizesWon: Prize[] = [];
     
    constructor(private accountService: AccountService, private router: Router, private route: ActivatedRoute,
        private alertService: AlertService, private formBuilder: FormBuilder, private prizeService: PrizeService) {
        
    }

    ngOnInit() {
        this.currentUser = this.accountService.userValue;
        if (!this.currentUser) {
            this.alertService.info("You need to login to see the list of prizes");
        } else {
            this.form = this.formBuilder.group({
                name: ['', Validators.required],
                cost: ['', [Validators.required, Validators.pattern("^[0-9]*")]],
                picture: [''],
            });

            this.formEdit = this.formBuilder.group({
                name: ['', Validators.required],
                cost: ['', [Validators.required, Validators.pattern("^[0-9]*")]],
                category: ['', [Validators.required, Validators.pattern("^[0-9]*")]],
                countdown_time: ['', Validators.required],
                already_won: ['', Validators.required],
                user: ['', Validators.required],
                picture: ['']
            });
        
            this.prizeService.getByUser(this.currentUser.username)
                .pipe(first())
                .subscribe(prizes => {
                    this.prizes = prizes.filter(p => p.already_won == false);
                    this.prizesWon = prizes.filter(p => p.already_won)
                    this.sortByTimer(false);
                    this.prizes.map((prize: Prize) => this.initializePrize(prize))
                    this.prizesWon.map((prize: Prize) => prize.picture = (prize.picture ? GlobalConstants.pathToPrize+prize.picture : ""));
                });
        }
    }

    ngAfterViewInit() {
    }

    initializePrize(prize: Prize) {
        prize.picture = (prize.picture ? GlobalConstants.pathToPrize+prize.picture : "");
        prize.timer =  timer(0,1000).pipe(map(() => this.getCountdownPrize(prize)))
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
    get f2() { return this.formEdit.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        this.loading = true;

        if (this.needToAdd){
            if(this.form.invalid) return;
            this.createPrize();
        } else {
            if (this.needToEdit){
                if(this.formEdit.invalid) return;
                this.updatePrize();
            }
        }
    }

    createPrize() {
        this.prizeService.store(this.addValuesToPrize(this.form.value))
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Prize stored successfully', { keepAfterRouteChange: true });
                    if(this.pictureFile) this.uploadPicture();
                    else window.location.reload();
                    this.needToAdd = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                    this.needToAdd = false;
                }
            }); 
    }

    updatePrize() {
        var newUpdatedPrize = Object.assign(this.prizeToEdit, this.formEdit.value)
        this.prizeService.update(newUpdatedPrize.name, newUpdatedPrize.user, this.formEdit.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Prize updated successfully', { keepAfterRouteChange: true });
                    if(this.pictureFile) this.uploadPicture();
                    else window.location.reload();
                    this.loading = false;
                    this.needToEdit = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                    this.needToEdit = false;
                }
            }); 
    }

    editPrize(prize: Prize) {
        this.prizeToEdit = prize;
        this.formEdit.patchValue(prize);
        this.needToEdit = !this.needToEdit;
    }

    deletePrize(name: string, user: string) {
        const prizeToDelete = this.prizes.find(x => x.name == name && x.user == user);
        prizeToDelete.isDeleting = true;
        this.prizeService.delete(name, user)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.prizes = this.prizes.filter(x => (x.name !== name && x.user !== user))
                    this.alertService.success(name + ' deleted successfully', { keepAfterRouteChange: true });
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    uploadPicture() {
        const reader = new FileReader();
    
        reader.addEventListener('load', (event: any) => {    
          this.prizeService.uploadImage(this.pictureFile).subscribe(
            (res) => {
                this.alertService.success('Picture uploaded successfully!', { keepAfterRouteChange: true });
                this.pictureFile = null;
                this.pictureName = '';
                this.loading = false;
                window.location.reload();
            },
            (error) => {
                this.alertService.error(error);
                this.loading = false;
            })
        });
    
        reader.readAsDataURL(this.pictureFile);
    }

    updateName(imageInput: any) {
        this.pictureFile = imageInput.target.files[0];
        this.pictureName = imageInput.target.files[0].name;
      }

    resetCountdownPrize(prize: Prize) {
            var newCountDown = new Date().getTime() + prize.countdown_time;
            prize.time_end = new Date(newCountDown)
            this.prizeService.update(prize.name, prize.user, prize)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Timer of ' + prize.name + ' has been reset.', { keepAfterRouteChange: true });
                },
                error: error => {
                    this.alertService.error(error);
                }
            });
    }

    getCountdownPrize(prize: Prize) {
        var today = Date.now();

        var interval;

        var newDate_end_24h = new Date(new Date(prize.time_end_24h).setUTCHours(new Date(prize.time_end_24h).getUTCHours() - 1) ).getTime()
        var newDate_end = new Date(new Date(prize.time_end).setUTCHours(new Date(prize.time_end).getUTCHours() - 1) ).getTime()

        if  (newDate_end <= today && newDate_end_24h >= today) {
            interval = newDate_end_24h - today;
            if(interval < 0) this.resetCountdownPrize(prize);
            return Utils.getTimer(interval);
        } else {
            interval = newDate_end - today;
            return Utils.getTimer(interval);
        }
    }

    sortFunction(boolean, variable) {
        if (boolean == true){
            this.prizes.sort((a, b) => a[variable] < b[variable] ? 1 : a[variable]  > b[variable]  ? -1 : 0)
            this.sortAsc = !this.sortAsc
        }
        else{
            this.prizes.sort((a, b) => a[variable]  > b[variable]  ? 1 : a[variable]  < b[variable]  ? -1 : 0)
            this.sortAsc = !this.sortAsc
        }
    }

    sortFunctionWon(boolean, variable) {
        if (boolean == true){
            this.prizesWon.sort((a, b) => a[variable] < b[variable] ? 1 : a[variable]  > b[variable]  ? -1 : 0)
            this.sortAsc = !this.sortAsc
        }
        else{
            this.prizesWon.sort((a, b) => a[variable]  > b[variable]  ? 1 : a[variable]  < b[variable]  ? -1 : 0)
            this.sortAsc = !this.sortAsc
        }
    }

    sortByTimer(boolean) {
        if (boolean == true){
            this.prizes.sort((a, b) => new Date(a.time_end).getTime() < new Date(b.time_end).getTime() ? 
            1 : new Date(a.time_end).getTime()  > new Date(b.time_end).getTime()  ? -1 : 0)
            this.sortAsc = !this.sortAsc
        }
        else{
            this.prizes.sort((a, b) => new Date(a.time_end).getTime()  > new Date(b.time_end).getTime()  ? 
            1 : new Date(a.time_end).getTime()  < new Date(b.time_end).getTime()  ? -1 : 0)
            this.sortAsc = !this.sortAsc
        }
    }

    addValuesToPrize(prize: Prize) : Prize {
        var newPrize = prize;
        newPrize.category = Utils.addCategory(newPrize.cost);

        if (this.prizes.length == 0 && this.prizesWon.length == 0) {
            newPrize.countdown_time = 0;
        } else {
            newPrize.countdown_time = Utils.addCountDown(newPrize.category)
        }
        
        newPrize.picture = this.pictureName

        var today = Date.now();
        newPrize.time_end = new Date(today + newPrize.countdown_time);

        newPrize.user = this.accountService.userValue.username;

        return newPrize;
    }
}