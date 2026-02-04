import { App } from "./core/App";
import { Scene } from "./core/Scene";

import { PortController } from "./core/PortController";

const app = new App();
const scene = new Scene();

const port = new PortController(scene);
port.start();
window.addEventListener("DOMContentLoaded", async () => {
  await app.init();
  if (!app.app) return;

  app.app.stage.addChild(scene.root);
});
