import { App } from "./core/App";
import { Scene } from "./core/Scene";

const app = new App();
const scene = new Scene();
let uiCounter = 0;

window.addEventListener("DOMContentLoaded", async () => {
  await app.init();
  if (app.app) {
    app.app.stage.addChild(scene.root);

    const addBtn = document.getElementById("add-ship");
    const removeBtn = document.getElementById("remove-ship");

    addBtn?.addEventListener("click", () => {
      const id = `ui-${Date.now()}-${uiCounter++}`;
      const color = Math.random() < 0.5 ? 0xff3333 : 0x33ff66;
      scene.shipManager.addShipToScene(scene, id, color);
    });

    removeBtn?.addEventListener("click", () => {
      const keys = Object.keys(scene.shipManager.ships);
      if (keys.length === 0) return;
      const last = keys[keys.length - 1];
      scene.shipManager.removeShipFromScene(scene, last);
    });
  }
});
