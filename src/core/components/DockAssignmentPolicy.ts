import type { Dock } from "./Dock";
import type { ShipQueue } from "./ShipQueue";
import { getRandomVal } from "../utils";

export function pickDockForEnter(
  emptyDocs: Dock[],
  hasEmptyShips: boolean,
  hasCargoShips: boolean,
): Dock | null {
  if (!hasEmptyShips && !hasCargoShips) return null;

  const withCargo = emptyDocs.filter((d) => d.getIsCargo());
  const withoutCargo = emptyDocs.filter((d) => !d.getIsCargo());
  if (!withCargo.length && !withoutCargo.length) return null;
  if (hasEmptyShips && withCargo.length) {
    const index = getRandomVal(0, withCargo.length - 1);
    return withCargo[index];
  }
  if (hasCargoShips && withoutCargo.length) {
    const index = getRandomVal(0, withoutCargo.length - 1);
    const dock = withoutCargo[index];
    return dock;
  }
  return null;
}

export function pickQueueForDock(
  dock: Dock,
  emptyQueue: ShipQueue,
  cargoQueue: ShipQueue,
) {
  return dock.getIsCargo() ? emptyQueue : cargoQueue;
}
