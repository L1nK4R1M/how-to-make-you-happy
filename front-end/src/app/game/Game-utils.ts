import { Runner } from "./Runner";


export class GameUtils {
  /**
   * Get random number.
   * @param {number} min
   * @param {number} max
   * @param {number}
   */
  public static getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  /**
   * Vibrate on mobile devices.
   * @param {number} duration Duration of the vibration in milliseconds.
   */
  public static vibrate(duration) {
    if (GameUtils.IS_MOBILE && window.navigator.vibrate) {
      window.navigator.vibrate(duration);
    }
  }


  /**
   * Create canvas element.
   * @param {HTMLElement} container Element to append canvas to.
   * @param {number} width
   * @param {number} height
   * @param {string} opt_classname
   * @return {HTMLCanvasElement}
   */
  public static createCanvas(container, width, height, opt_classname ? ) {
    var canvas = document.createElement('canvas');
    canvas.className = opt_classname ? Runner.classes.CANVAS + ' ' + opt_classname : Runner.classes.CANVAS;
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    return canvas;
  }


  /**
   * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
   * @param {string} base64String
   */
  public static decodeBase64ToArrayBuffer(base64String) {
    var len = (base64String.length / 4) * 3;
    var str = atob(base64String);
    var arrayBuffer = new ArrayBuffer(len);
    var bytes = new Uint8Array(arrayBuffer);

    for (var i = 0; i < len; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
  }


  /**
   * Return the current timestamp.
   * @return {number}
   */
  public static getTimeStamp() {
    return GameUtils.IS_IOS ? new Date().getTime() : performance.now();
  }


  /**
   * Default game width.
   * @const
   */
  static DEFAULT_WIDTH = 720;

  /**
   * Frames per second.
   * @const
   */
  static FPS = 60;

  /** @const */
  static IS_HIDPI = window.devicePixelRatio > 1;

  /** @const */
  static IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform);

  /** @const */
  static IS_MOBILE = /Android/.test(window.navigator.userAgent) || GameUtils.IS_IOS;

  /** @const */
  static IS_TOUCH_ENABLED = 'ontouchstart' in window;

}
