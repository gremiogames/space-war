import config from "./config.js";
import scene0 from "./scene0.js";
import TelaInicial from "./telainicial.js";

class Game extends Phaser.Game {
  constructor() {
    super(config);

    this.scene.add("telainicial", TelaInicial);
    this.scene.add("scene0", scene0);
    this.scene.start("telainicial");
  }
}    

async function waitForPixelFont() {
  if (!document.fonts || !document.fonts.load) return;

  const fontLoad = document.fonts.load('16px "Press Start 2P"');
  const timeout = new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  await Promise.race([fontLoad, timeout]);
}

window.onload = async () => {
  await waitForPixelFont();
  window.game = new Game();
};
