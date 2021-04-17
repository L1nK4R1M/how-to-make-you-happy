import { GameUtils } from "./Game-utils";
import { Runner } from "./Runner";

    /**
     * Handles displaying the distance meter.
     * @param {!HTMLCanvasElement} canvas
     * @param {Object} spritePos Image position in sprite.
     * @param {number} canvasWidth
     * @constructor
     */
    export class DistanceMeter {
        canvasCtx = this.canvas.getContext('2d');
        image = Runner.imageSprite;

        x = 0;
        y = 5;

        currentDistance = 0;
        maxScore = 0;
        userScore = 0;
        highScore = [];
        container = null;

        digits = [];
        acheivement = false;
        defaultString = '';
        flashTimer = 0;
        flashIterations = 0;
        invertTrigger = false;

        config = DistanceMeter.config;
        maxScoreUnits = this.config.MAX_DISTANCE_UNITS;
      constructor(private canvas, private spritePos, private canvasWidth) {
        this.canvas = canvas;
        
        this.spritePos = spritePos;
        this.init(canvasWidth);
      }
      /**
       * Initialise the distance meter to '00000'.
       * @param {number} width Canvas width in px.
       */
      init(width: number) {
        var maxDistanceStr = '';

        this.calcXPos(width);
        this.maxScore = this.maxScoreUnits;
        for (var i = 0; i < this.maxScoreUnits; i++) {
          this.draw(i, 0);
          this.defaultString += '0';
          maxDistanceStr += '9';
        }

        this.maxScore = parseInt(maxDistanceStr);
      }
      /**
       * Calculate the xPos in the canvas.
       * @param {number} canvasWidth
       */
      calcXPos(canvasWidth: number) {
        this.x = canvasWidth - (DistanceMeter.dimensions.DEST_WIDTH *
          (this.maxScoreUnits + 1));
      }
      /**
       * Draw a digit to canvas.
       * @param {number} digitPos Position of the digit.
       * @param {number} value Digit value 0-9.
       * @param {boolean} opt_highScore Whether drawing the high score.
       */
      draw(digitPos: number, value: number, opt_highScore?) {
        var sourceWidth = DistanceMeter.dimensions.WIDTH;
        var sourceHeight = DistanceMeter.dimensions.HEIGHT;
        var sourceX = DistanceMeter.dimensions.WIDTH * value;
        var sourceY = 0;

        var targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
        var targetY = this.y;
        var targetWidth = DistanceMeter.dimensions.WIDTH;
        var targetHeight = DistanceMeter.dimensions.HEIGHT;

        // For high DPI we 2x source values.
        if (GameUtils.IS_HIDPI) {
          sourceWidth *= 2;
          sourceHeight *= 2;
          sourceX *= 2;
        }

        sourceX += this.spritePos.x;
        sourceY += this.spritePos.y;

        this.canvasCtx.save();

        if (opt_highScore) {
          // Left of the current score.
          var highScoreX = this.x - (this.maxScoreUnits * 2) *
            DistanceMeter.dimensions.WIDTH;
          this.canvasCtx.translate(highScoreX, this.y);
        } else {
          this.canvasCtx.translate(this.x, this.y);
        }

        this.canvasCtx.drawImage(this.image, sourceX, sourceY,
          sourceWidth, sourceHeight,
          targetX, targetY,
          targetWidth, targetHeight
        );

        this.canvasCtx.restore();
      }
      /**
       * Covert pixel distance to a 'real' distance.
       * @param {number} distance Pixel distance ran.
       * @return {number} The 'real' distance ran.
       */
      getActualDistance(distance: number): number {
        return distance ? Math.round(distance * this.config.COEFFICIENT) : 0;
      }
      /**
       * Update the distance meter.
       * @param {number} distance
       * @param {number} deltaTime
       * @return {boolean} Whether the acheivement sound fx should be played.
       */
      update(deltaTime: number, distance = 0): boolean {
        var paint = true;
        var playSound = false;

        if (!this.acheivement) {
          distance = this.getActualDistance(distance);
          // Score has gone beyond the initial digit count.
          if (distance > this.maxScore && this.maxScoreUnits ==
            this.config.MAX_DISTANCE_UNITS) {
            this.maxScoreUnits++;
            this.maxScore = parseInt(this.maxScore + '9');
          } else {
            //this.distance = 0;
          }

          if (distance > 0) {
            // Acheivement unlocked
            if (distance % this.config.ACHIEVEMENT_DISTANCE == 0) {
              // Flash score and play sound.
              this.acheivement = true;
              this.flashTimer = 0;
              playSound = true;
            }

            // Create a string representation of the distance with leading 0.
            var distanceStr = (this.defaultString +
              distance).substr(-this.maxScoreUnits);
            this.digits = distanceStr.split('');
          } else {
            this.digits = this.defaultString.split('');
          }
        } else {
          // Control flashing of the score on reaching acheivement.
          if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
            this.flashTimer += deltaTime;

            if (this.flashTimer < this.config.FLASH_DURATION) {
              paint = false;
            } else if (this.flashTimer >
              this.config.FLASH_DURATION * 2) {
              this.flashTimer = 0;
              this.flashIterations++;
            }
          } else {
            this.acheivement = false;
            this.flashIterations = 0;
            this.flashTimer = 0;
          }
        }

        // Draw the digits if not flashing.
        if (paint) {
          for (var i = this.digits.length - 1; i >= 0; i--) {
            this.draw(i, parseInt(this.digits[i]));
          }
        }

        this.drawHighScore();
        return playSound;
      }
      /**
       * Draw the high score.
       */
      drawHighScore() {
        this.canvasCtx.save();
        this.canvasCtx.globalAlpha = .8;
        for (var i = this.highScore.length - 1; i >= 0; i--) {
          this.draw(i, parseInt(this.highScore[i], 10), true);
        }
        this.canvasCtx.restore();
      }
      /**
       * Set the highscore as a array string.
       * Position of char in the sprite: H - 10, I - 11.
       * @param {number} distance Distance ran in pixels.
       */
      setHighScore(distance: number) {
        distance = this.getActualDistance(distance);
        var highScoreStr = (this.defaultString +
          distance).substr(-this.maxScoreUnits);

        this.userScore = parseInt(highScoreStr);
         
        this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
      }

      getHighscore() {
        return this.userScore;
      }
      /**
       * Reset the distance meter back to '00000'.
       */
      reset() {
        this.update(0);
        this.acheivement = false;
      }
    };


    /**
     * @enum {number}
     */
    export namespace DistanceMeter {
      export enum dimensions {
        WIDTH = 10,
          HEIGHT = 13,
          DEST_WIDTH = 11
      };


      /**
       * Y positioning of the digits in the sprite sheet.
       * X position is always 0.
       * @type {Array<number>}
       */
      export const yPos: Array<number> = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];


      /**
       * Distance meter config.
       * @enum {number}
       */
      export const config = {
        // Number of digits.
        MAX_DISTANCE_UNITS : 5,

          // Distance that causes achievement animation.
          ACHIEVEMENT_DISTANCE : 100,

          // Used for conversion from pixel distance to a scaled unit.
          COEFFICIENT : 0.025,

          // Flash duration in milliseconds.
          FLASH_DURATION : 1000 / 4,

          // Flash iterations for achievement animation.
          FLASH_ITERATIONS : 3
      };
    }
