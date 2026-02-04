import { ShipQueue } from "./ShipQueue";
import {
  PORT_WIDTH,
  START_QUEUE_GAP,
  SCREEN_H,
  PORT_WALL_HEIGHT,
  QUEUE_SLOT_W,
  SHIP_HEIGHT,
} from "../constans";

export function createCargoQueue() {
  return new ShipQueue(
    { x: PORT_WIDTH + START_QUEUE_GAP, y: SCREEN_H - PORT_WALL_HEIGHT },
    { x: QUEUE_SLOT_W, y: 0 },
  );
}

export function createEmptyQueue() {
  return new ShipQueue(
    { x: PORT_WIDTH + START_QUEUE_GAP, y: PORT_WALL_HEIGHT - SHIP_HEIGHT },
    { x: QUEUE_SLOT_W, y: 0 },
  );
}
