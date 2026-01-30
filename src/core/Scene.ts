import * as PIXI from "pixi.js";
import { ShipManager } from "./ShipManager";
export class Scene {
  root = new PIXI.Container();
  ships = new PIXI.Container();
  shipManager = new ShipManager();
  private drawDocks() {
    const color = 0xffd400;
    const dockWidth = 40;
    const dockHeight = 80;

    const x = 20;
    const startY = 80;
    const gap = 20;

    for (let i = 0; i < 4; i++) {
      const dock = new PIXI.Graphics()
        .rect(x, startY + i * (dockHeight + gap), dockWidth, dockHeight)
        .stroke({ width: 3, color });

      this.root.addChild(dock);
    }
  }
  private drawQueueWalls() {
    const color = 0xffd400;
    const thickness = 12;
    const topWall = new PIXI.Graphics()
      .rect(300, 0, thickness, 260)
      .fill(color);

    const bottomWall = new PIXI.Graphics()
      .rect(300, 340, thickness, 260)
      .fill(color);

    this.root.addChild(topWall, bottomWall);
  }
  private drawShips() {
    const pick = () => (Math.random() < 0.5 ? 0xff3333 : 0x33ff66);
    this.shipManager.addShipToScene(this, "ship1", pick());
    this.shipManager.addShipToScene(this, "ship2", pick());
  }
  constructor() {
    this.drawDocks();
    this.drawShips();
    this.drawQueueWalls();
  }
}
