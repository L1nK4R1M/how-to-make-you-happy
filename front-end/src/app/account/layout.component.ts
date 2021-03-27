import { Renderer2 } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@app/_services';

@Component({ 
    selector: 'layout',
    templateUrl: 'layout.component.html',
    styleUrls: ['layout.component.scss']
 })
export class LayoutComponent {
    @ViewChild('background') bg: ElementRef;
    constructor(
        private router: Router,
        private accountService: AccountService,
        private renderer: Renderer2
    ) {
        // redirect to home if already logged in
        if (this.accountService.userValue) {
            this.router.navigate(['/']);
        }
    }
    
    ngAfterViewInit() {
        this.setBackground(this.bg, 10, 14)

    }
    setBackground(bg: ElementRef, max: number, min: number) {
        var rnd = Math.floor(Math.random() * (max - min + 1)) + min;
        var bgUrl = "url('../assets/images/jewelry" + rnd + ".jpg')";
    
        this.renderer.setStyle(bg.nativeElement, 'background-image', bgUrl)
      }
}