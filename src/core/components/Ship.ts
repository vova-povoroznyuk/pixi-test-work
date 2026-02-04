import * as PIXI from "pixi.js";
import type { ShipType, Trajectory, Vec2 } from "../types";
import tweenManager from "../TweenManager";
import { SHIP_WIDTH, SHIP_HEIGHT, SHIP_STROKE_WIDTH } from "../constans";
import type { Tween } from "@tweenjs/tween.js";

export class Ship {
  id: string;
  shipType: ShipType;
  private _isCargo: boolean;

  pos: Vec2;
  ship: PIXI.Graphics;
  color: number;
  private moving = false;
  private destroyed = false;
  private activeTween: Tween<any> | null = null;

  constructor(id: string, shipType: ShipType, color: number, start: Vec2) {
    this.color = color;
    this.id = id;
    this.shipType = shipType;
    this._isCargo = shipType === "FULL";
    this.pos = { ...start };

    this.ship = new PIXI.Graphics();
    this.updateShip();
    this.ship.position.set(this.pos.x, this.pos.y);
  }
  get isCargo() {
    return this._isCargo;
  }
  set isCargo(value: boolean) {
    if (this._isCargo === value) return;
    this._isCargo = value;
    this.updateShip();
  }
  attach(container: PIXI.Container) {
    container.addChild(this.ship);
  }

  detach() {
    this.ship.parent?.removeChild(this.ship);
  }

  async move(traj: Trajectory): Promise<void> {
    if (this.moving) return;
    this.moving = true;

    const easing =
      traj.easing === "quadOut"
        ? tweenManager.easing.Quadratic.Out
        : tweenManager.easing.Quadratic.InOut;

    const runSegment = (to: Vec2, durationMs: number) =>
      new Promise<void>((resolve) => {
        const tw = tweenManager
          .tween(this.pos)
          .to({ x: to.x, y: to.y }, durationMs)
          .easing(easing)
          .onUpdate(() => {
            if (this.destroyed) return;
            this.ship.position.set(this.pos.x, this.pos.y);
          })
          .onComplete(() => {
            if (this.activeTween === tw) this.activeTween = null;
            resolve();
          });

        this.activeTween = tw;
        tw.start();
      });

    const pts = traj.points;
    if (!pts || pts.length === 0) {
      this.moving = false;
      return;
    }
    const segCount = pts.length;
    const segDur = Math.max(1, Math.floor(traj.durationMs / segCount));
    this.ship.position.set(this.pos.x, this.pos.y);
    await runSegment(pts[0], segDur);
    for (let i = 0; i < pts.length - 1; i++) {
      await runSegment(pts[i + 1], segDur);
    }

    this.moving = false;
  }
  private updateShip() {
    this.ship.clear();

    if (this._isCargo) {
      this.ship.rect(0, 0, SHIP_WIDTH, SHIP_HEIGHT).fill({ color: this.color });
      return;
    }

    this.ship
      .rect(0, 0, SHIP_WIDTH, SHIP_HEIGHT)
      .stroke({ width: SHIP_STROKE_WIDTH, color: this.color });
  }
  destroy() {
    this.destroyed = true;

    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.detach();
    this.ship.destroy();
  }
}
