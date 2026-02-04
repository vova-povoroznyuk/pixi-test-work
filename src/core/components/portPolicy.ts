import type { Dock } from "./Dock";
import type { QueueController } from "./QueueController";

export function pickDockForEnter(
  emptyDocs: Dock[],
  hasEmptyShips: boolean,
  hasCargoShips: boolean,
): Dock | null {
  if (!hasEmptyShips && !hasCargoShips) return null;

  const withCargo = emptyDocs.filter((d) => d.getIsCargo());
  const withoutCargo = emptyDocs.filter((d) => !d.getIsCargo());

  if (!withCargo.length && !withoutCargo.length) return null;

  return hasEmptyShips && withCargo.length
    ? withCargo[0]
    : (withoutCargo[0] ?? null);
}

export function pickQueueForDock(
  dock: Dock,
  emptyQueue: QueueController,
  cargoQueue: QueueController,
) {
  return dock.getIsCargo() ? emptyQueue : cargoQueue;
}
