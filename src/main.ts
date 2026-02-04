import { App } from "./core/App";
import { Scene } from "./core/Scene";

import { PortController } from "./core/PortCoordinator";

const app = new App();
const scene = new Scene();

const port = new PortController(scene);

window.addEventListener("DOMContentLoaded", async () => {
  await app.init();
  port.start();
  if (!app.app) return;

  app.app.stage.addChild(scene.root);
});
