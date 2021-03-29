import { Component,  ElementRef,  OnDestroy,  OnInit,  Renderer2,  ViewChild } from '@angular/core';
import { ActivatedRoute,  Router} from '@angular/router';
import { GlobalConstants } from '@app/common/global-constants';

import { User} from '@app/_models';
import { AccountService } from '@app/_services';

import LocomotiveScroll from 'locomotive-scroll';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Fireworks } from 'fireworks-js'

import { timer } from 'rxjs';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User;
  scroll: any;
  isBirthday: Boolean = false;
  hasCelebrated = false;
  fireworks: any;
  randomJewelryPic = "../../assets/images/jewelry" + this.randomInteger(16, 19) +".jpg"
  randomBagsPic = "../../assets/images/bags" + this.randomInteger(10, 15) +".jpg"
  randomDressPic = "../../assets/images/dress" + this.randomInteger(5, 10) +".jpg"
  randomShoesPic = "../../assets/images/shoes" + this.randomInteger(9, 11) +".jpg"
  @ViewChild('background1') bg1: ElementRef;
  @ViewChild('background2') bg2: ElementRef;
  @ViewChild('background3') bg3: ElementRef;
  @ViewChild('background4') bg4: ElementRef;
  @ViewChild('smoothscroll') smoothScroll: ElementRef;

  constructor(private accountService: AccountService, private router: Router, private route: ActivatedRoute, private renderer: Renderer2, private viewportScroller: ViewportScroller) {

  }

  randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onClickScroll(elementId: string): void { 
    console.log(elementId);
    gsap.to(window, { duration: 1, scrollTo: elementId , ease: "power4.inOut" });
}

  ngOnInit() {
    this.currentUser = this.accountService.userValue;
    if (this.currentUser) {
      var today = new Date(Date.now());
      var bd = new Date(this.currentUser.birthdate);

      this.isBirthday = today.getMonth() == bd.getMonth() && today.getDate() == bd.getDate();

      var user: User = JSON.parse(localStorage.getItem('user'));

      this.hasCelebrated = user.hadCelebrate;

      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  ngAfterViewInit() {
    if (this.isBirthday && !this.hasCelebrated) {

      //setup text animation
      $('#hbMessage').textition({
        animation: 'ease-in-out',
        map: {
          x: 200,
          y: 100,
          z: 0
        },
        perspective: 30,
        speed: 1,
        handler: 'mouseenter mouseleave'
      });

      //setup fireworks animation
      const container = document.querySelector('.birthday-fireworks')
      this.fireworks = new Fireworks({
        target: container,
        hue: 120,
        startDelay: 1,
        minDelay: 20,
        maxDelay: 30,
        speed: 4,
        acceleration: 1.05,
        friction: 0.98,
        gravity: 0.8,
        particles: 100,
        trace: 10,
        explosion: 50,
        boundaries: {
          top: 50,
          bottom: container.clientHeight,
          left: 50,
          right: container.clientWidth
        },
        sound: {
          enable: true,
          list: [
            '../assets/sounds/explosion0.mp3',
            '../assets/sounds/explosion1.mp3',
            '../assets/sounds/explosion2.mp3'
          ],
          min: 4,
          max: 8
        }
      })

      this.fireworks.start();

    } else {
      //renderer randomly all backgrounds
      this.setAllBackground();

      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      //initialize Locomotive-scroll with
      const scroll = new LocomotiveScroll({
        el: this.smoothScroll.nativeElement,
        smooth: true,
        reloadOnContextChange: true,
        smartphone: {
          smooth: true
        },
        tablet: {
          smooth: true
        }
        //multiplier: 2
      });

      // each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
      scroll.on("scroll", ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(this.smoothScroll.nativeElement, {
        scrollTop(value) {
          return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
        }, // we don't have to define a scrollLeft because we're only scrolling vertically.
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
          };
        },
        /* LocomotiveScroll handles things completely differently on mobile devices 
          - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, 
          we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied 
          to the container (the LocomotiveScroll-controlled element).*/
        pinType: gsap.getProperty(this.smoothScroll.nativeElement, "transform") ? "transform" : "fixed"
      });

      const showAnim = gsap.from($(".smart-scroll"), {
        yPercent: -100,
        paused: true,
        duration: 0.2
      }).progress(1);

      ScrollTrigger.create({
        start: "top top",
        end: 99999,
        scroller: this.smoothScroll.nativeElement,
        onUpdate: (self) => {
          self.direction === -1 ? showAnim.play() : showAnim.reverse()
        }
      });

      gsap.utils.toArray($(".panel")).forEach(panel => {
        ScrollTrigger.create({
          trigger: panel as Element,
          start: "top top",
          scroller: this.smoothScroll.nativeElement,
          pin: true,
          pinSpacing: false
        });
      });

      gsap.utils.toArray($(".gs_reveal_fromRight")).forEach((imgTextContainer) => {
        const image = (imgTextContainer as Element).querySelector(".img-right-container");
        const text = (imgTextContainer as Element).querySelector(".text-right-container");

        const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: imgTextContainer as Element,
              start: "center bottom",
              scroller: this.smoothScroll.nativeElement,
              toggleActions: "play none none reverse"
            }
          })
          .from(image, {
            x: 200,
            opacity: 0,
            duration: 1
          })
          .from(text, {
            x: -250,
            opacity: 0,
            duration: 1,
            stagger: 0.2
          }, "-= 1");
      });

      gsap.utils.toArray($(".gs_reveal_fromLeft")).forEach((imgTextContainer) => {
        const image = (imgTextContainer as Element).querySelector(".img-left-container");
        const text = (imgTextContainer as Element).querySelector(".text-left-container");

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: imgTextContainer as Element,
            start: "center bottom",
            scroller: this.smoothScroll.nativeElement,
            toggleActions: "play none none reverse"
          }
        }).from(image, {
          x: -200,
          opacity: 0,
          duration: 1,
        }).from(text, {
          x: 250,
          opacity: 0,
          duration: 1,
          stagger: 0.2
        }, "-= 1");
      });


      ScrollTrigger.create({
        scroller: this.smoothScroll.nativeElement,
        snap: 1 / 4 // snap whole page to the closest section!
      });

      this.scroll = scroll;

      // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
      ScrollTrigger.addEventListener("refresh", () => {
        try {
          scroll.update();
        } catch {
          console.log("Error on resize caught")
        }
      });

      timer(100).subscribe(() => ScrollTrigger.refresh());
    }
  }

  ngOnDestroy() {
    this.scroll.destroy();

    let triggers = ScrollTrigger.getAll();
    triggers.forEach(trigger => {
      trigger.kill();
    });
  }

  stopAnimation() {
    this.fireworks.stop();

    this.hasCelebrated = true;
    var user: User = JSON.parse(localStorage.getItem('user'));
    user.hadCelebrate = this.hasCelebrated;
    localStorage.setItem('user', JSON.stringify(user));

    window.location.reload();
  }

  setAllBackground() {
    this.setBackground(this.bg1, 1);
    this.setBackground(this.bg2, 2);
    this.setBackground(this.bg3, 3);
    this.setBackground(this.bg4, 4);
  }

  setBackground(bg: ElementRef, typeBg: Number) {
    var rnd = Math.floor(Math.random() * GlobalConstants.TotalBgs) + 1;
    var bgUrl;
    switch (typeBg) {
      case 1:
        bgUrl = "url('../assets/images/jewelry" + rnd + ".jpg')";
        break;
      case 2:
        bgUrl = "url('../assets/images/bags" + rnd + ".jpg')";
        break;
      case 3:
        bgUrl = "url('../assets/images/travel" + rnd + ".jpg')";
        break;
      case 4:
        bgUrl = "url('../assets/images/cosmetic" + rnd + ".jpg')";
    }

    this.renderer.setStyle(bg.nativeElement, 'background-image', bgUrl)
  }
}
