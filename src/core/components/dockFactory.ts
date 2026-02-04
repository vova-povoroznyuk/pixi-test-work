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
} from "../constans";
import type { SceneLike } from "../types";

export function createDocks(scene: SceneLike): Dock[] {
  const docs: Dock[] = [];
  const topGap = (SCREEN_H - (DOCK_HEIGHT + GAP) * DOCK_COUNT) / 2;

  for (let i = 0; i < DOCK_COUNT; i++) {
    const y = topGap + i * (DOCK_HEIGHT + GAP);
    const route = [
      { x: START_PORT_X, y: START_PORT_Y },
      {
        x: PORT_START_GAP + DOCK_WIDTH,
        y: y + DOCK_HEIGHT / 2 - SHIP_HALF_HEIGHT,
      },
    ];
    docs.push(new Dock(route, scene, y));
  }

  return docs;
}
