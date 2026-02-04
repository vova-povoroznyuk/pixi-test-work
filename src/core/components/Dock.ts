import * as PIXI from "pixi.js";
import {
  PORT_COLOR,
  DOCK_WIDTH,
  DOCK_HEIGHT,
  PORT_START_GAP,
  DOCK_STROKE_WIDTH,
  DOCK_LOADING_TIME,
} from "../constans";
import type { Vec2, SceneLike } from "../types";

export class Dock {
  private route: Vec2[];
  private shipId: string | null;
  private isLoading: boolean;
  private isShipReady: boolean;

  private _isCargo: boolean;
  private dock: PIXI.Graphics;

  constructor(route: Vec2[], scene: SceneLike, y: number) {
    this.route = route;

    this.shipId = null;
    this.isLoading = false;
    this.isShipReady = false;

    this._isCargo = false;

    this.dock = new PIXI.Graphics();
    this.dock.y = y;
    scene.portLayer.addChild(this.dock);

    this.updateDock();
  }

  getRoute() {
    return this.route;
  }

  getShipId() {
    return this.shipId;
  }
  setShipId(id: string | null) {
    this.shipId = id;
  }

  getIsLoading() {
    return this.isLoading;
  }

  getIsCargo() {
    return this._isCargo;
  }

  getIsShipReady() {
    return this.isShipReady;
  }
  setIsShipReady(value: boolean) {
    this.isShipReady = value;
  }
  get isCargo() {
    return this._isCargo;
  }
  set isCargo(value: boolean) {
    if (this._isCargo === value) return;
    this._isCargo = value;
    this.updateDock();
  }

  addShip(shipId: string) {
    this.shipId = shipId;
  }

  deleteShip() {
    this.shipId = null;
    this.isShipReady = false;
  }

  startLoading(toggleShip: () => void, callTrigger: () => void) {
    this.isLoading = true;

    setTimeout(() => {
      this.isCargo = !this.isCargo;
      this.isShipReady = true;
      toggleShip();
      callTrigger();
      this.isLoading = false;
    }, DOCK_LOADING_TIME);
  }

  private updateDock() {
    this.dock.clear();

    if (this._isCargo) {
      this.dock
        .rect(PORT_START_GAP, 0, DOCK_WIDTH, DOCK_HEIGHT)
        .fill({ color: PORT_COLOR });
      return;
    }

    this.dock
      .rect(PORT_START_GAP, 0, DOCK_WIDTH, DOCK_HEIGHT)
      .stroke({ width: DOCK_STROKE_WIDTH, color: PORT_COLOR });
  }
}
