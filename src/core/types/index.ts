export type ShipType = "FULL" | "EMPTY";

export type Vec2 = { x: number; y: number };

export type Trajectory = {
  points: Vec2[];
  durationMs: number;
  easing?: "quadOut" | "quadInOut";
};

export type MoveUpdate = { shipId: string | null; target: Vec2 };
export type SceneLike = {
  portLayer: import("pixi.js").Container;
  queueLayer: import("pixi.js").Container;
};

export type EasingType = "quadOut" | "quadInOut";

export type DequeueExitResult = {
  shipId: string;
  fromSlotIndex: number;
  route: [Vec2];
} | null;
