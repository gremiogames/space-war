import config from "./config.js";
import scene0 from "./scene0.js";
import tutorial from "./tutorial.js";
import TelaInicial from "./telainicial.js";
import "./banco.js";
import "./loja.js";

class Game extends Phaser.Game {
  constructor() {
    super(config);

    this.scene.add("telainicial", TelaInicial);
    this.scene.add("tutorial", tutorial);
    this.scene.add("scene0", scene0);
    this.scene.start("telainicial");

    if (location.hostname.match(/localhost|127\.0\.0\.1/)) {
      this.socket = io("http://localhost:3000");
    } else if (location.hostname.match(/github\.dev/)) {
      this.socket = io(location.hostname.replace("8080", "3000"));
    } else {
      this.socket = io();
    }

    this.room = "0";
    this.socket.on("connect", () => {
      console.log("Socket ID:", this.socket.id);

      this.socket.emit("join-room", this.room);
    });
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
