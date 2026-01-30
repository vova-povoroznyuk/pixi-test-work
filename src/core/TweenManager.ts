import * as PIXI from "pixi.js";
import { Group, Tween, Easing } from "@tweenjs/tween.js";

class TweenManager {
  private static _instance: TweenManager | null = null;
  private installed = false;

  public readonly group = new Group();
  public readonly easing = Easing;

  private constructor() {}

  static getInstance(): TweenManager {
    if (!this._instance) this._instance = new TweenManager();
    return this._instance;
  }

  installTicker(app: PIXI.Application) {
    if (this.installed) return;
    this.installed = true;

    app.ticker.add(() => {
      this.group.update(); // ключ
    });
  }

  tween<T extends object>(target: T) {
    return new Tween(target, this.group); // ключ
  }
}

export default TweenManager.getInstance();
