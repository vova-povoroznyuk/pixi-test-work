import * as PIXI from "pixi.js";
import { Group, Tween, Easing } from "@tweenjs/tween.js";

class TweenTicker {
  private installed = false;
  public readonly group = new Group();
  public readonly easing = Easing;

  installTicker(app: PIXI.Application) {
    if (this.installed) return;
    this.installed = true;
    app.ticker.start();
    app.ticker.add(() => this.group.update());
  }

  tween<T extends object>(target: T) {
    return new Tween(target, this.group);
  }
}

export default new TweenTicker();
