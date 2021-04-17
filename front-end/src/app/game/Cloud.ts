import { GameUtils } from "./Game-utils";
import { Runner } from "./Runner";

    /**
     * Cloud background item.
     * Similar to an obstacle object but without collision boxes.
     * @param {HTMLCanvasElement} canvas Canvas element.
     * @param {Object} spritePos Position of image in sprite.
     * @param {number} containerWidth
     */
    export class Cloud {
        canvasCtx = this.canvas.getContext('2d');
        xPos = this.containerWidth;
        yPos = 0;
        remove = false;
        cloudGap = GameUtils.getRandomNum(Cloud.config.MIN_CLOUD_GAP,
            Cloud.config.MAX_CLOUD_GAP);
            
        constructor(private canvas, private spritePos, private containerWidth) {
            this.canvas = canvas;
            this.spritePos = spritePos;
            this.containerWidth = containerWidth;

            this.init();
        }
        /**
         * Initialise the cloud. Sets the Cloud height.
         */
        init() {
            this.yPos = GameUtils.getRandomNum(Cloud.config.MAX_SKY_LEVEL,
                Cloud.config.MIN_SKY_LEVEL);
            this.draw();
        }
        /**
         * Draw the cloud.
         */
        draw() {
            this.canvasCtx.save();
            var sourceWidth = Cloud.config.WIDTH;
            var sourceHeight = Cloud.config.HEIGHT;

            if (GameUtils.IS_HIDPI) {
                sourceWidth = sourceWidth * 2;
                sourceHeight = sourceHeight * 2;
            }

            this.canvasCtx.drawImage(Runner.imageSprite, this.spritePos.x,
                this.spritePos.y,
                sourceWidth, sourceHeight,
                this.xPos, this.yPos,
                Cloud.config.WIDTH, Cloud.config.HEIGHT);

            this.canvasCtx.restore();
        }
        /**
         * Update the cloud position.
         * @param {number} speed
         */
        update(speed) {
            if (!this.remove) {
                this.xPos -= Math.ceil(speed);
                this.draw();

                // Mark as removeable if no longer in the canvas.
                if (!this.isVisible()) {
                    this.remove = true;
                }
            }
        }
        /**
         * Check if the cloud is visible on the stage.
         * @return {boolean}
         */
        isVisible() {
            return this.xPos + Cloud.config.WIDTH > 0;
        }
    };


    /**
     * Cloud object config.
     * @enum {number}
     */
    export namespace Cloud {
     export const config = {
        HEIGHT: 14,
        MAX_CLOUD_GAP: 400,
        MAX_SKY_LEVEL: 30,
        MIN_CLOUD_GAP: 100,
        MIN_SKY_LEVEL: 71,
        WIDTH: 46
    };
}