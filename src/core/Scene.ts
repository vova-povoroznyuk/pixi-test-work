import * as PIXI from "pixi.js";
import {
  PORT_WALL_HEIGHT,
  PORT_AREA_W,
  WALL_WIDTH,
  SCREEN_H,
  PORT_COLOR,
} from "./constans";

export class Scene {
  root = new PIXI.Container();
  queueLayer = new PIXI.Container();
  portLayer = new PIXI.Container();
  private drawPortWalls() {
    const topWall = new PIXI.Graphics()
      .rect(PORT_AREA_W, 0, WALL_WIDTH, PORT_WALL_HEIGHT)
      .fill(PORT_COLOR);

    const bottomWall = new PIXI.Graphics()
      .rect(
        PORT_AREA_W,
        SCREEN_H - PORT_WALL_HEIGHT,
        WALL_WIDTH,
        PORT_WALL_HEIGHT,
      )
      .fill(PORT_COLOR);

    this.root.addChild(topWall, bottomWall);
  }
  constructor() {
    this.root.addChild(this.queueLayer, this.portLayer);
    this.drawPortWalls();
  }
}
