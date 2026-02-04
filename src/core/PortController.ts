import { Dock } from "./components/Dock";
import { ShipManager } from "./components/ShipManager";
import { createDocks } from "./components/dockFactory";
import { createCargoQueue, createEmptyQueue } from "./components/queueFactory";
import { pickDockForEnter, pickQueueForDock } from "./components/portPolicy";
import type { MoveUpdate, SceneLike, ShipType } from "./types";
import { SCREEN_W, SHIP_WIDTH, START_PORT_Y, SPAWN_INTERVAL } from "./constans";

export class PortController {
  private docs: Dock[] = [];
  private spawnTimerId: number | null = null;
  private exitTimerId: number | null = null;
  private counter = 0;

  private cargoShipQueueController = createCargoQueue();
  private emptyShipQueueController = createEmptyQueue();
  private shipManager = new ShipManager();
  private scene: SceneLike;

  constructor(scene: SceneLike) {
    this.scene = scene;
    this.docs = createDocks(scene);
  }

  start() {
    this.startDispatchLoop();
    this.startSpawnLoop();
  }

  stop() {
    if (this.spawnTimerId !== null) window.clearInterval(this.spawnTimerId);
    if (this.exitTimerId !== null) window.clearInterval(this.exitTimerId);
    this.spawnTimerId = null;
    this.exitTimerId = null;
  }

  private startDispatchLoop() {
    this.exitTimerId = window.setInterval(() => this.dispatchOnce(), 1000);
  }

  private startSpawnLoop() {
    this.spawnTimerId = window.setInterval(
      () => this.spawnOnce(),
      SPAWN_INTERVAL,
    );
  }

  private async dispatchOnce() {
    const docToExit = this.getReadyToExitDocs()[0];
    if (docToExit) {
      this.dispatchExit(docToExit);
      return;
    }
    const emptyDocs = this.getEmptyDocs();
    if (!emptyDocs.length) return;
    this.dispatchEnter(emptyDocs);
  }

  private async dispatchExit(doc: Dock) {
    const shipId = doc.getShipId();
    if (!shipId) return;

    doc.setShipId(null);
    doc.setIsShipReady(false);

    const routeToExit = doc.getRoute().slice().reverse();
    await this.shipManager.moveShip(
      shipId,
      [...routeToExit, { x: SCREEN_W + SHIP_WIDTH, y: START_PORT_Y }],
      1400,
      "quadInOut",
    );
    this.shipManager.destroyShip(shipId);
  }

  private async dispatchEnter(emptyDocs: Dock[]) {
    const hasEmptyShips = this.emptyShipQueueController.getSlots().length > 0;
    const hasCargoShips = this.cargoShipQueueController.getSlots().length > 0;

    const dock = pickDockForEnter(emptyDocs, hasEmptyShips, hasCargoShips);
    if (!dock) return;

    const queue = pickQueueForDock(
      dock,
      this.emptyShipQueueController,
      this.cargoShipQueueController,
    );
    const res = queue.dequeueWithExit();
    if (!res) return;

    dock.setShipId(res.shipId);

    await this.shipManager
      .moveShip(
        res.shipId,
        [...res.route, ...dock.getRoute()],
        1400,
        "quadInOut",
      )
      .then(() => {
        dock.startLoading(() => this.shipManager.toggleCargo(res.shipId));
      });
    this.applyQueueUpdates(queue.updateQueue());
  }

  private async spawnOnce() {
    const type: ShipType = Math.random() > 0.5 ? "FULL" : "EMPTY";
    const shipId = this.makeShipId(type);

    const queue =
      type === "FULL"
        ? this.cargoShipQueueController
        : this.emptyShipQueueController;

    this.shipManager.spawnShip(this.scene, shipId, type);

    const res = queue.assign(shipId);
    if (!res) return;

    await this.shipManager.moveShip(shipId, [res.target], SCREEN_W, "quadOut");
  }

  private applyQueueUpdates(updates: MoveUpdate[]) {
    for (const { shipId, target } of updates) {
      if (!shipId) continue;
      this.shipManager.moveShip(shipId, [target], 600, "quadOut");
    }
  }

  private getEmptyDocs() {
    return this.docs.filter((doc) => !doc.getShipId());
  }

  private getReadyToExitDocs() {
    return this.docs.filter((doc) => doc.getIsShipReady());
  }

  private makeShipId(type: ShipType) {
    return `${type}-${Date.now()}-${this.counter++}`;
  }
}
