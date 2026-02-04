import { Dock } from "./components/Dock";
import { ShipService } from "./components/ShipService";
import { createDocks } from "./components/DockViewFactory";
import {
  createCargoQueue,
  createEmptyQueue,
} from "./components/ShipQueueFactory";
import {
  pickDockForEnter,
  pickQueueForDock,
} from "./components/DockAssignmentPolicy";
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
  private shipService = new ShipService();
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
    await this.shipService.moveShip(
      shipId,
      [...routeToExit, { x: START_PORT_X + SHIP_WIDTH, y: START_PORT_Y }],
      SHIP_MOVE_DURATION,
    );

    this.trigger();
    this.shipService
      .moveShip(
        shipId,
        [{ x: SCREEN_W + SHIP_WIDTH, y: START_PORT_Y }],
        SHIP_MOVE_DURATION,
      )
      .then(() => this.shipService.destroyShip(shipId));
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
    this.shipService
      .moveShip(res.shipId, [...dock.getRoute()], SHIP_MOVE_DURATION)
      .then(() => {
        this.entranceBusy = false;

        dock.startLoading(
          () => this.shipService.toggleCargo(res.shipId),
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

    this.shipService.spawnShip(this.scene, shipId, type);

    const res = queue.assign(shipId);
    if (!res) return;

    await this.shipService.moveShip(shipId, [res.target], SHIP_MOVE_DURATION);
    this.trigger();
  }

  private applyQueueUpdates(updates: MoveUpdate[]) {
    for (const { shipId, target } of updates) {
      if (!shipId) continue;
      this.shipService.moveShip(shipId, [target], SHIP_QUEUE_SPEED).then(() => {
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
