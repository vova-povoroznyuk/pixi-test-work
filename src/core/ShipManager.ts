import * as PIXI from "pixi.js";
import tweenManager from "./TweenManager";

export class ShipManager {
  ships: Record<string, PIXI.Graphics> = {};

  createShip(id: string, x: number, y: number, color: number) {
    const ship = new PIXI.Graphics().rect(0, 0, 60, 30).fill(color);
    ship.position.set(x, y);
    this.ships[id] = ship;
    return ship;
  }

  getShip(id: string) {
    return this.ships[id];
  }

  removeShip(id: string) {
    delete this.ships[id];
  }

  addShipToScene(scene: { root: PIXI.Container }, id: string, color: number) {
    const rightEdge = 900;
    const x = rightEdge;
    const baseY = 285;
    const y = baseY;

    const ship = this.createShip(id, x, y, color);
    const dockWidth = 40;

    const dockTargetX = 20 + dockWidth + 10;
    const dockTargetY = 285;

    const origin = { x, y };
    const pos = { x, y };

    console.log("Starting tween for ship id:", id);

    tweenManager
      .tween(pos)
      .to({ x: dockTargetX, y: dockTargetY }, 2000)
      .easing(tweenManager.easing.Quadratic.Out)
      .onStart(() => console.log("START", id))
      .onUpdate(() => {
        ship.position.set(pos.x, pos.y);
      })
      .onComplete(() => {
        tweenManager
          .tween(pos)
          .to({ x: origin.x, y: origin.y }, 2000)
          .easing(tweenManager.easing.Quadratic.InOut)
          .onUpdate(() => {
            ship.position.set(pos.x, pos.y);
          })
          .onComplete(() => {
            scene.root.removeChild(ship);
            this.removeShip(id);
          })
          .start();
      })
      .start();
  }
}
