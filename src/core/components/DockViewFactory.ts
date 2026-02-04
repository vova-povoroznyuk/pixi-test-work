import { Dock } from "./Dock";
import {
  SCREEN_H,
  DOCK_HEIGHT,
  GAP,
  DOCK_COUNT,
  START_PORT_X,
  START_PORT_Y,
  PORT_START_GAP,
  DOCK_WIDTH,
  SHIP_HALF_HEIGHT,
  SHIP_WIDTH,
} from "../constans";
import type { SceneLike } from "../types";

export function createDocks(scene: SceneLike): Dock[] {
  const docks: Dock[] = [];
  const topGap = (SCREEN_H - (DOCK_HEIGHT + GAP) * DOCK_COUNT) / 2;

  for (let i = 0; i < DOCK_COUNT; i++) {
    const y = topGap + i * (DOCK_HEIGHT + GAP);

    const targetY = y + DOCK_HEIGHT / 2 - SHIP_HALF_HEIGHT;
    const dockX = PORT_START_GAP + DOCK_WIDTH;

    const route = [
      { x: START_PORT_X, y: START_PORT_Y },
      { x: START_PORT_X - SHIP_WIDTH * 3, y: targetY },
      { x: dockX, y: targetY },
    ];

    docks.push(new Dock(route, scene, y));
  }

  return docks;
}
