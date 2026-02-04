import * as PIXI from "pixi.js";
import TweenTicker from "./TweenTicker";
import { SCREEN_H, SCREEN_W, SEA_COLOR } from "./constans";

export class App {
  app: PIXI.Application | null = null;

  async init() {
    this.app = new PIXI.Application();
    await this.app.init({
      width: SCREEN_W,
      height: SCREEN_H,
      backgroundColor: SEA_COLOR,
      antialias: true,
      resolution: 1,
    });

    document.body.appendChild(this.app.canvas);
    TweenTicker.installTicker(this.app);
  }
}
