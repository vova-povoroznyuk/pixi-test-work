import * as PIXI from "pixi.js";
import tweenManager from "./TweenManager";

export class App {
  app: PIXI.Application | null = null;

  async init() {
    this.app = new PIXI.Application();
    await this.app.init({ width: 900, height: 600, backgroundColor: 0x4d35ff });

    document.body.appendChild(this.app.canvas);
    tweenManager.installTicker(this.app);
  }
}
