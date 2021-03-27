import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Utils } from '@app/common/utils';

import { Prize, User } from '@app/_models';
import { AccountService, AlertService, PrizeService } from '@app/_services';
import { timer } from 'rxjs';
import { first, map} from 'rxjs/operators';

import { Fireworks } from 'fireworks-js';
import * as bootstrap from "bootstrap";


@Component({ 
    selector: 'play-page',
    templateUrl: 'play.component.html',
    styleUrls: ['play.component.scss'] 
})
export class PlayComponent implements OnInit {
    currentUser: User;
    prizes: Prize[] = [];
    sortAsc: boolean = false;
    isPlaying = false;
    isLoading = false;
    resultRandom= null;
    hasWon = false;
    displayWon = false;
    fireworks: any;

    constructor(private accountService: AccountService, private prizeService: PrizeService, private router: Router, private route: ActivatedRoute, private alertService: AlertService) {   
    }

    ngOnInit(): void {
        this.currentUser = this.accountService.userValue;
        if (!this.currentUser) {
            this.alertService.info("You need to login to play");
        } else {
            this.isLoading = true;
            this.prizeService.getByTimeLeft(this.currentUser.username)
                .pipe(first())
                .subscribe(prizes => {
                        this.prizes = prizes;
                        this.sortByTimer(false);
                        this.prizes.map((prize: Prize) => this.initializePrize(prize))
                        this.isLoading = false;
                });
        }
    }

    initializePrize(prize: Prize) {
        prize.timer =  timer(0,1000).pipe(map(() => this.getCountdownPrize(prize)))
    }

    ngAfterViewInit() {
    }

    play() {
        var started = Date.now();
        var output = $("#output");
        var duration = 3000;
        var result = this.generatePrizeResult().prize
        var prize =  this.prizes.find(p => p.name == result)
        this.hasWon = false;
        if (prize) {
            this.hasWon = true;
            prize.already_won = true;
        } 
        this.resultRandom = result;
        var roulette = this.prizes.map(p => p.name).concat(["Loose", "Dare"]);
        this.isPlaying = !this.isPlaying
        var animationTimer = timer(0, 24).subscribe(() => {
            // If the value is what we want, stop animating
            // or if the duration has been exceeded, stop animating
            if (Date.now() - started > duration) {
                this.isPlaying = !this.isPlaying;
                output.text("")
                if (this.hasWon) {
                    this.displayWon = true;
                    timer(100).subscribe(() => {
                        $(".congrats-fireworks").addClass("active");
                        this.startAnimation();
                    });
                } else {
                    $('#modalLoose').modal('show');
                    $('#modalLoose').on('hidden.bs.modal', function (e) {
                        window.location.reload();
                      })
                }
                this.updatePrize(prize);
                animationTimer.unsubscribe();
            } else {
                // Generate a random string to use for the next animation step
                output.text(roulette[Math.floor(Math.random() *  roulette.length)]);
            }
        }); 
    }

    startAnimation() {
        //setup fireworks animation
      const container = document.querySelector('.congrats-fireworks')
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
    }

    stopAnimation() {
        $(".congrats-fireworks").removeClass("active");
        this.fireworks.stop();
        this.displayWon = false;

        window.location.reload();
      }

    updatePrize(prize: Prize) {
        if(this.hasWon) {
            prize.won_date = new Date(Date.now()) ;
            this.prizeService.update(prize.name, prize.user, prize)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Prize updated successfully', { keepAfterRouteChange: true });
                    },
                    error: error => {
                        this.alertService.error(error);
                    }
                }); 
        } else {
            this.prizes.forEach(p => {
                if (p.countdown_time == 0)
                p.countdown_time = Utils.addCountDown(Utils.addCategory(p.cost));
            });
            if(!prize) {
                this.prizes.forEach(p => this.resetCountdownPrize(p));
            }
        }
    }

    generatePrizeResult(){
        var prizeWithWeight = this.prizes.map(p => {
          switch (p.category) {
                case 1: return this.createPrizeWithWeight(3, 3, p.name);
                case 2: return this.createPrizeWithWeight(2, 2, p.name);
                case 3: return this.createPrizeWithWeight(1, 2,  p.name);
                case 4: return this.createPrizeWithWeight(0.5, 2, p.name);
                case 5: return this.createPrizeWithWeight(0.3, 2, p.name);
                case 6: return this.createPrizeWithWeight(0.2, 1,  p.name);
                case 7: return this.createPrizeWithWeight(0.1, 1,  p.name);
            }
        });

        const randomizer = (values) => {
            let i, pickedValue,
                    randomNr = Math.random(),
                    threshold = 0;
        
            for (i = 0; i < values.length; i++) {
                if (values[i].probability === '*') {
                    continue;
                }
        
                threshold += values[i].probability;
                if (threshold > randomNr) {
                        pickedValue = values[i];
                        break;
                }
        
                if (!pickedValue) {
                    //nothing found based on probability value, so pick element marked with wildcard
                    pickedValue = values.filter(value => value.probability === '*')[0];
                }
            }
            return pickedValue;
        }
        
        return randomizer(prizeWithWeight[Math.floor(Math.random() * prizeWithWeight.length)]);
    }

    createPrizeWithWeight(win: number, dare: number, prize: string) {
        return [
            {prize: prize, probability: win/10},
            {prize: 'Dare', probability: dare/10},
            {prize: 'Loose', probability: '*'}
        ];
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

    /*
    For next version ?
    */
    wheelOfFortune() {
        const sectors = [
            {
                color: "#f82",
                label: "Stack"
        },
            {
                color: "#0bf",
                label: "PS5"
        },
            {
                color: "#fb0",
                label: "SWITCH"
        },
            {
                color: "#0fb",
                label: "XSX"
        },
            {
                color: "#b0f",
                label: "SHOES"
        }
    ];
    
        const rand = (m, M) => Math.random() * (M - m) + m;
        const tot = sectors.length;
        const EL_spin = document.querySelector("#spin");
        const ctx = (document.querySelector("#wheel") as HTMLCanvasElement).getContext('2d');
        const dia = ctx.canvas.width;
        const rad = dia / 2;
        const PI = Math.PI;
        const TAU = 2 * PI;
        const arc = TAU / sectors.length;
    
        const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
        let angVel = 0; // Angular velocity
        let ang = 0; // Angle in radians
    
        const getIndex = () => Math.floor(tot - ang / TAU * tot) % tot;
    
        function drawSector(sector, i) {
            const ang = arc * i;
            ctx.save();
            // COLOR
            ctx.beginPath();
            ctx.fillStyle = sector.color;
            ctx.moveTo(rad, rad);
            ctx.arc(rad, rad, rad, ang, ang + arc);
            ctx.lineTo(rad, rad);
            ctx.fill();
            // TEXT
            ctx.translate(rad, rad);
            ctx.rotate(ang + arc / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 30px sans-serif";
            ctx.fillText(sector.label, rad - 10, 10);
            //
            ctx.restore();
        };
    
        function rotate() {
            const sector = sectors[getIndex()];
            ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
            EL_spin.textContent = sector.label;
            (EL_spin as HTMLElement).style.background = sector.color;
        }
    
        function frame() {
            if (!angVel) return;
            angVel *= friction; // Decrement velocity by friction
            if (angVel < 0.002) angVel = 0; // Bring to stop
            ang += angVel; // Update angle
            ang %= TAU; // Normalize angle
            rotate();
        }
    
        function engine() {
            frame();
            requestAnimationFrame(engine)
        }
    
        // INIT
        sectors.forEach(drawSector);
        rotate(); // Initial rotation
        engine(); // Start engine
        EL_spin.addEventListener("click", () => {
            if (!angVel) angVel = rand(2.25, 4.75);
            console.log(angVel)
        });
    }




}