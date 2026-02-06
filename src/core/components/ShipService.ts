import { Ship } from "./Ship";
import {
  SCREEN_W,
  SHIP_WIDTH,
  SCREEN_H,
  SHIP_HEIGHT,
  EMPTY_SHIP_COLOR,
  CARGO_SHIP_COLOR,
} from "../constans";
import type { Vec2, SceneLike, ShipType, MovePriority } from "../types";

export class ShipService {
  ships = new Map<string, Ship>();

  get(id: string): Ship | undefined {
    return this.ships.get(id);
  }

  spawnShip(scene: SceneLike, id: string, type: ShipType): Ship {
    const color = type === "FULL" ? CARGO_SHIP_COLOR : EMPTY_SHIP_COLOR;

    const ship = new Ship(id, type, color, {
      x: SCREEN_W + SHIP_WIDTH,
      y: SCREEN_H / 2 - SHIP_HEIGHT,
    });

    ship.attach(scene.queueLayer);
    this.ships.set(id, ship);

    return ship;
  }

  async moveShip(
    shipId: string | null,
    points: Vec2[],
    speed: number,
    priority: MovePriority,
  ): Promise<void> {
    if (!shipId) return;
    const ship = this.ships.get(shipId);
    if (!ship) return;
    await ship.move({
      points,
      speed,
      priority,
    });
  }
  toggleCargo(shipId: string): void {
    const ship = this.ships.get(shipId);
    if (!ship) return;
    ship.isCargo = !ship.isCargo;
  }
  destroyShip(shipId: string | null): void {
    if (!shipId) return;

    const ship = this.ships.get(shipId);
    if (!ship) return;

    ship.destroy();
    this.ships.delete(shipId);
  }
}
