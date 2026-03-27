var config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  }
}

export default config;
