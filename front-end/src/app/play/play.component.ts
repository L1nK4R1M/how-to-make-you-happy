import { Component,  OnInit} from '@angular/core';
import { Router,  ActivatedRoute} from '@angular/router';
import { Utils} from '@app/common/utils';

import { Prize,  User} from '@app/_models';
import { AccountService,  AlertService,  PrizeService} from '@app/_services';
import { timer} from 'rxjs';
import { first,  map} from 'rxjs/operators';

import { Fireworks} from 'fireworks-js';
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
  resultRandom = null;
  hasWon = false;
  displayWon = false;
  fireworks: any;
  sectors: any;

  constructor(private accountService: AccountService, private prizeService: PrizeService, private router: Router, private route: ActivatedRoute, private alertService: AlertService) {}

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
          this.isLoading = false;

          if (this.prizes.length > 0) {
            this.initializeWheelFortune();
          }
        });
    }

    
  }

  ngAfterViewInit() {
    
  }

  initializeWheelFortune () {
    this.sectors = this.prizes.map((p, i) => ({'label': p.name}))
    .concat(
      Array.apply(null, Array(this.prizes.length*7))
      .map((a, i )=> ({'label': "Loose"})
      ))
    .concat(
      Array.apply(null, Array(Math.ceil(this.prizes.length/2)))
      .map((a, i ) => ({'label': "Dare"})
      ))
      
    this.sectors = multipleShuffle(this.sectors, 5).map((sector, i: number) => ({'label': sector.label, 'color': Utils.getColor(i, this.sectors.length)}));

    timer(200).subscribe(() => this.wheelOfFortune(this.sectors));

    function multipleShuffle(a, number) {
      var array = a;
      for (var i=0; i < number; i++) array = shuffle(array);
      return array;
    }

    function shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
    }
  }

  announceResult(result: string) {
    var prize = this.prizes.find(p => p.name == result)
    this.resultRandom = result;
    if (prize) {
      this.hasWon = true;
      prize.already_won = true;
    }
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
  }

  findExpensivePrize() {
    return this.prizes.reduce(function(prev, current) {
      return (prev.category > current.category) ? prev : current
    })
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
    if (this.hasWon) {
      prize.won_date = new Date(Date.now());
      this.prizeService.update(prize.name, prize.user, prize)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Prize updated successfully', { keepAfterRouteChange: true });
            this.prizes.forEach(p => {
                this.prizes.forEach(p => this.resetCountdownPrize(p, prize.countdown_time));
            });
          },
          error: error => {
            this.alertService.error(error);
          }
        });

    } else {
      if (!prize) {
        this.prizes.forEach((p, i) => this.resetCountdownPrize(p, ((24 * 60 * 60 * 1000) * (i+1))));
      }
    }
  }

  generatePrizeResult() {
    var prizeWithWeight = this.prizes.map(p => {
      switch (p.category) {
        case 1:
          return this.createPrizeWithWeight(3, 3, p.name);
        case 2:
          return this.createPrizeWithWeight(1, 2, p.name);
        case 3:
          return this.createPrizeWithWeight(0.3, 2, p.name);
        case 4:
          return this.createPrizeWithWeight(0.2, 1, p.name);
        case 5:
          return this.createPrizeWithWeight(0.1, 1, p.name);
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
    return [{
        prize: prize,
        probability: win / 10
      },
      {
        prize: 'Dare',
        probability: dare / 10
      },
      {
        prize: 'Loose',
        probability: '*'
      }
    ];
  }

  sortFunction(boolean, variable) {
    if (boolean == true) {
      this.prizes.sort((a, b) => a[variable] < b[variable] ? 1 : a[variable] > b[variable] ? -1 : 0)
      this.sortAsc = !this.sortAsc
    } else {
      this.prizes.sort((a, b) => a[variable] > b[variable] ? 1 : a[variable] < b[variable] ? -1 : 0)
      this.sortAsc = !this.sortAsc
    }
  }

  resetCountdownPrize(prize: Prize, cd: number) {
    prize.time_end = new Date(Date.now() + cd);
    this.prizeService.update(prize.name, prize.user, prize)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Timer of ' + prize.name + ' has been reset.', {
            keepAfterRouteChange: true
          });
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  wheelOfFortune(sectors) {
    const rand = (m, M) => Math.random() * (M - m) + m;
    const tot = sectors.length;
    const EL_spin = document.querySelector("#spin");
    const ctx = (document.querySelector("#wheel") as HTMLCanvasElement).getContext('2d');
    const dia = ctx.canvas.width;
    const rad = dia / 2;
    const PI = Math.PI;
    const TAU = 2 * PI;
    const arc = TAU / sectors.length;
    const component =  this;

    const friction = 0.993; // 0.995=soft, 0.99=mid, 0.98=hard
    let angVel = 0; // Angular velocity
    let ang = 0; // Angle in radians

    const getIndex = () => Math.floor(tot - ang / TAU * tot) % tot;

    function drawSector (sector, i) {
      const ang = arc * i;
      ctx.save();
      // COLOR
      ctx.beginPath();
      ctx.fillStyle = sectors[i].color
      ctx.moveTo(rad, rad);
      ctx.arc(rad, rad, rad, ang, ang + arc);
      ctx.lineTo(rad, rad);
      ctx.fill();
      // TEXT
      ctx.translate(rad, rad);
      ctx.rotate(ang + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "30px ABChanel Corpo Regular";
      ctx.fillText(sector.label, rad - 10, 10);
      //
      ctx.restore();
    };

    function rotate () {
      const sector = sectors[getIndex()];
      ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
      EL_spin.textContent = sector.label;
      (EL_spin as HTMLElement).style.background = sector.color;
    }

    function engine() {
      frame();
      requestAnimationFrame(engine)
    }

    
    function frame() {
      if (!angVel) return;
      angVel *= friction; // Decrement velocity by friction
      if (angVel < 0.001) {
        angVel = 0; // Bring to stop
        component.announceResult(EL_spin.textContent);
      }
      ang += angVel; // Update angle
      ang %= TAU; // Normalize angle
      rotate();
    }
      sectors.forEach(drawSector);
      rotate(); // Initial rotation
      engine(); // Start engine
      EL_spin.textContent = "SPIN";
      EL_spin.addEventListener("click", () => {
      if (!angVel) angVel = rand(0.5, 3.75);
    });
  }




}
