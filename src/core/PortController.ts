import { Dock } from "./components/Dock";
import { ShipManager } from "./components/ShipManager";
import { createDocks } from "./components/dockFactory";
import { createCargoQueue, createEmptyQueue } from "./components/queueFactory";
import { pickDockForEnter, pickQueueForDock } from "./components/portPolicy";
import type { MoveUpdate, SceneLike, ShipType } from "./types";
import {
  SCREEN_W,
  SHIP_WIDTH,
  START_PORT_Y,
  SPAWN_INTERVAL,
  START_PORT_X,
  SHIP_MOVE_DURATION,
  SHIP_QUEUE_SPEED,
} from "./constans";

export class PortController {
  private docs: Dock[] = [];
  private spawnTimerId: number | null = null;
  private exitTimerId: number | null = null;
  private counter = 0;

  private cargoShipQueueController = createCargoQueue();
  private emptyShipQueueController = createEmptyQueue();
  private shipManager = new ShipManager();
  private scene: SceneLike;
  private running = false;
  private pending = false;
  private entranceBusy = false;

  constructor(scene: SceneLike) {
    this.scene = scene;
    this.docs = createDocks(scene);
  }

  start() {
    this.startSpawnLoop();
  }

  stop() {
    if (this.spawnTimerId !== null) window.clearInterval(this.spawnTimerId);
    if (this.exitTimerId !== null) window.clearInterval(this.exitTimerId);
    this.spawnTimerId = null;
    this.exitTimerId = null;
  }

  private startSpawnLoop() {
    this.spawnTimerId = window.setInterval(
      () => this.spawnOnce(),
      SPAWN_INTERVAL,
    );
  }

  private async dispatchExit(doc: Dock) {
    const shipId = doc.getShipId();
    if (!shipId) return;

    doc.setShipId(null);
    doc.setIsShipReady(false);

    const routeToExit = doc.getRoute().slice().reverse();
    await this.shipManager.moveShip(
      shipId,
      [...routeToExit, { x: START_PORT_X + SHIP_WIDTH, y: START_PORT_Y }],
      SHIP_MOVE_DURATION,
    );

    this.trigger();
    this.shipManager
      .moveShip(
        shipId,
        [{ x: SCREEN_W + SHIP_WIDTH, y: START_PORT_Y }],
        SHIP_MOVE_DURATION,
      )
      .then(() => this.shipManager.destroyShip(shipId));
  }

  private async dispatchEnter(emptyDocs: Dock[]) {
    if (this.entranceBusy) return false;
    const hasEmptyShips = this.emptyShipQueueController.getSlots().length > 0;
    const hasCargoShips = this.cargoShipQueueController.getSlots().length > 0;

    const dock = pickDockForEnter(emptyDocs, hasEmptyShips, hasCargoShips);
    if (!dock) return false;

    const queue = pickQueueForDock(
      dock,
      this.emptyShipQueueController,
      this.cargoShipQueueController,
    );
    const res = queue.dequeueWithExit();
    if (!res) return false;

    dock.setShipId(res.shipId);
    this.entranceBusy = true;
    this.shipManager
      .moveShip(res.shipId, [...dock.getRoute()], SHIP_MOVE_DURATION)
      .then(() => {
        this.entranceBusy = false;

        dock.startLoading(
          () => this.shipManager.toggleCargo(res.shipId),
          () => this.trigger(),
        );
      });
    this.trigger();
    this.applyQueueUpdates(queue.updateQueue());
    return false;
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

    await this.shipManager.moveShip(shipId, [res.target], SHIP_MOVE_DURATION);
    this.trigger();
  }

  private applyQueueUpdates(updates: MoveUpdate[]) {
    for (const { shipId, target } of updates) {
      if (!shipId) continue;
      this.shipManager.moveShip(shipId, [target], SHIP_QUEUE_SPEED).then(() => {
        this.trigger();
      });
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
  private trigger() {
    this.pending = true;
    if (!this.running) void this.run();
  }

  private async run(): Promise<void> {
    this.running = true;
    this.pending = false;

    const didWork = await this.stepOne();

    if (didWork) {
      return this.run();
    }

    this.running = false;
    if (this.pending) {
      return this.run();
    }
  }
  private async stepOne(): Promise<boolean> {
    if (this.entranceBusy) return false;
    const docToExit = this.getReadyToExitDocs()[0];
    if (docToExit) {
      await this.dispatchExit(docToExit);
      return true;
    }

    const emptyDocs = this.getEmptyDocs();
    if (!emptyDocs.length) return false;

    return await this.dispatchEnter(emptyDocs);
  }
}
