import { MIN_SPAWN_INTERVAL, MAX_SPAWN_INTERVAL } from "../constans";

export function getRandomVal(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function startRandomLoop(task: () => void): void {
  function loop(): void {
    task();

    const delay = getRandomVal(MIN_SPAWN_INTERVAL, MAX_SPAWN_INTERVAL);
    setTimeout(loop, delay);
  }

  loop();
}
