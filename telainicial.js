class TelaInicial extends Phaser.Scene {
  constructor() {
    super("telainicial");
    this.tutorialButton = null;
    this.playOfflineButton = null;
    this.playOnlineButton = null;
    this.statusText = null;
    this.menuMusic = null;
  }

  preload() {
    this.load.image("menuBackground", "assets/telamenu2.png");
    this.load.audio("menuMusic", "assets/musicamenu.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const pixelFont = '"Press Start 2P", monospace';

    this.add
      .image(width / 2, height / 2, "menuBackground")
      .setDisplaySize(width, height)
      .setDepth(-1);

    this.menuMusic =
      this.sound.get("menuMusic") ||
      this.sound.add("menuMusic", {
        loop: true,
        volume: 0.35,
      });

    if (!this.menuMusic.isPlaying) {
      this.menuMusic.play();
    }

    this.events.once("shutdown", () => {
      if (this.menuMusic && this.menuMusic.isPlaying) {
        this.menuMusic.stop();
      }
    });

    this.tutorialButton = this.createButton({
      x: width / 2,
      y: height * 0.62,
      label: "Tutorial",
      fillColor: 0x0f0f0f,
      hoverColor: 0x1b1b1b,
      onClick: () => {
        if (this.menuMusic && this.menuMusic.isPlaying) {
          this.menuMusic.stop();
        }
        this.scene.start("tutorial");
      },
    });

    this.playOfflineButton = this.createButton({
      x: width / 2,
      y: height * 0.72,
      label: "Jogar Offline",
      fillColor: 0x0f0f0f,
      hoverColor: 0x1b1b1b,
      onClick: () => {
        if (this.menuMusic && this.menuMusic.isPlaying) {
          this.menuMusic.stop();
        }
        this.scene.start("scene0");
      },
    });

    this.playOnlineButton = this.createButton({
      x: width / 2,
      y: height * 0.82,
      label: "Jogar Online",
      fillColor: 0x0f0f0f,
      hoverColor: 0x1b1b1b,
      onClick: () => {
        this.statusText.setText("Modo online em breve").setVisible(true);
      },
    });

    this.statusText = this.add
      .text(width / 2, height * 0.91, "", {
        fontFamily: pixelFont,
        fontSize: "12px",
        color: "#bfbfbf",
      })
      .setOrigin(0.5)
      .setVisible(false);
  }

  createButton({ x, y, label, fillColor, hoverColor, onClick }) {
    const width = 210;
    const height = 42;

    const background = this.add
      .rectangle(x, y, width, height, fillColor)
      .setStrokeStyle(2, 0x2a2a2a)
      .setAlpha(0.58)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        fontStyle: "bold",
        color: "#ededed",
      })
      .setOrigin(0.5);

    background.on("pointerover", () => {
      background.setFillStyle(hoverColor);
      background.setAlpha(0.66);
      text.setScale(1.03);
    });

    background.on("pointerout", () => {
      background.setFillStyle(fillColor);
      background.setAlpha(0.58);
      text.setScale(1);
    });

    background.on("pointerdown", () => {
      onClick();
    });

    return { background, text };
  }
}

export default TelaInicial;
