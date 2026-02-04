import type { Vec2, DequeueExitResult } from "../types";

export class QueueController {
  basePos: Vec2;
  step: Vec2;
  slots: Array<string | null>;

  constructor(basePos: Vec2, step: Vec2) {
    this.basePos = basePos;
    this.step = step;
    this.slots = [];
  }

  getPos(index: number): Vec2 {
    return {
      x: this.basePos.x + this.step.x * index,
      y: this.basePos.y + this.step.y * index,
    };
  }
  getSlots() {
    return this.slots;
  }

  assign(shipId: string): { slotIndex: number; target: Vec2 } {
    this.slots.push(shipId);
    const index = this.slots.length - 1;
    return { slotIndex: index, target: this.getPos(index) };
  }

  dequeueWithExit(): DequeueExitResult | null {
    const shipId = this.slots.shift();

    if (!shipId) return null;

    return { shipId: shipId };
  }
  deleteFirst() {
    this.slots.shift();
  }
  updateQueue() {
    return this.slots.map((shipId, index) => ({
      shipId,
      target: this.getPos(index),
    }));
  }
}
