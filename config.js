var config = {
  type: Phaser.AUTO,
  // Base 16:9 para aproximar o enquadramento de celular em modo paisagem.
  width: 854,
  height: 480,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
        debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export default config;
