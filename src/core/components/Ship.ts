import * as PIXI from "pixi.js";
import type { ShipType, Trajectory, Vec2, MovePriority } from "../types";
import TweenTicker from "../TweenTicker";
import { SHIP_WIDTH, SHIP_HEIGHT, SHIP_STROKE_WIDTH } from "../constans";
import type { Tween } from "@tweenjs/tween.js";

export class Ship {
  id: string;
  shipType: ShipType;
  private _isCargo: boolean;
  private activePriority: MovePriority = 0;

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
  async move(traj: Trajectory & { priority?: MovePriority }): Promise<void> {
    const prio: MovePriority = traj.priority ?? 0;

    if (this.moving && this.activePriority > prio) return;

    if (this.moving && this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.moving = true;
    this.activePriority = prio;

    const runSegment = (to: Vec2, duration: number) => {
      return new Promise<void>((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          if (this.activeTween === tw) this.activeTween = null;
          resolve();
        };

        const tw = TweenTicker.tween(this.pos)
          .to({ x: to.x, y: to.y }, duration)
          .easing(TweenTicker.easing.Linear.None)
          .onUpdate(() => {
            if (this.destroyed) return;
            this.ship.position.set(this.pos.x, this.pos.y);
          })
          .onComplete(finish);

        (tw as any).onStop?.(finish);

        this.activeTween = tw;
        tw.start();
      });
    };

    const pts = traj.points;
    if (!pts || pts.length === 0) {
      this.moving = false;
      this.activePriority = 0;
      return;
    }

    const segCount = pts.length;
    const segDur = Math.max(1, Math.floor(traj.speed / segCount));

    await runSegment(pts[0], segDur);
    for (let i = 0; i < pts.length - 1; i++) {
      await runSegment(pts[i + 1], segDur);
    }

    this.moving = false;
    this.activePriority = 0;
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
