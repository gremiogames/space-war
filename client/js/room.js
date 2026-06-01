class room extends Phaser.Scene {
  constructor() {
    super("room");
    this.qrcodeContainer = document.getElementById("qr-code");
    this.menuMusic = null;
    this.tutorialButton = null;
    this.storeButton = null;
    this.playButton = null;
  }

  preload() {
    this.load.setPath("assets/");

    if (!this.textures.exists("room-background")) {
      this.load.image("room-background", "room-background.png");
    }

    if (!this.textures.exists("menuBackground")) {
      this.load.image("menuBackground", "telamenu2.png");
    }

    if (!this.cache.audio.exists("menuMusic")) {
      this.load.audio("menuMusic", "musicamenu.mp3");
    }
  }

  create() {
    const hasRoomFromUrl = new URLSearchParams(location.search).has("room");
    const width = this.scale.width;
    const height = this.scale.height;
    const pixelFont = '"Press Start 2P", monospace';

    if (!this.game.room) {
      this.game.room = (Math.random() * 10000).toString().split(".")[0];
    }

    if (this.qrcodeContainer) {
      this.qrcodeContainer.innerHTML = "";
      this.qrcodeContainer.style.display = hasRoomFromUrl ? "none" : "block";
    }

    this.events.once("shutdown", () => {
      if (this.menuMusic && this.menuMusic.isPlaying) {
        this.menuMusic.stop();
      }
    });

    if (!hasRoomFromUrl) {
      this.add
        .image(width / 2, height / 2, "room-background")
        .setDisplaySize(width, height);

      this.add.text(50, 50, this.game.room, {
        fontFamily: pixelFont,
        fontSize: "32px",
        fill: "#000000",
      });

      if (this.qrcodeContainer) {
        this.qrcodeContainer.innerHTML = "";
        new QRCode(this.qrcodeContainer, {
          text: location.href + "?room=" + this.game.room,
          width: 450,
          height: 450,
        });
      }

      this.add
        .text(400, 420, "Compartilhe o QR code", {
          fontFamily: pixelFont,
          fontSize: "12px",
          fill: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
    } else {
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

      this.add
        .text(width / 2, height * 0.845, `Sala ${this.game.room}`, {
          fontFamily: pixelFont,
          fontSize: "12px",
          color: "#bfbfbf",
          align: "center",
        })
        .setOrigin(0.5);

      this.tutorialButton = this.createButton({
        x: width / 2,
        y: height * 0.66,
        label: "Tutorial",
        fillColor: 0x0f0f0f,
        hoverColor: 0x1b1b1b,
        onClick: () => {
          this.scene.launch("tutorial");
        },
      });

      this.storeButton = this.createShopButton();

      this.playButton = this.createButton({
        x: width / 2,
        y: height * 0.76,
        label: "Jogar",
        fillColor: 0x16411f,
        hoverColor: 0x225d2c,
        onClick: () => {
          this.game.socket.emit("reset-room-match", this.game.room);
          this.game.socket.emit("join-room", this.game.room);
          this.game.socket.emit("select-player", this.game.room, "android");
          this.scene.stop("room");
          this.scene.start("scene0");
        },
      });
    }

    if (!hasRoomFromUrl) {
      console.log("Joining room:", this.game.room);
      this.game.socket.emit("join-room", this.game.room);
    }

    this.game.socket.on("player-selected", (player) => {
      console.log(
        "Player selected in room:",
        this.game.room,
        "player:",
        player,
      );

      if (player === "android") this.game.localPlayer = "character";
      else this.game.localPlayer = "android";

      if (this.qrcodeContainer) {
        this.qrcodeContainer.remove();
      }

      this.scene.stop("room");
      let artifacts = [];
      for (let x = 0; x < 50; x++) {
        artifacts.push({
          x: Math.random(),
          y: Math.random(),
        });
      }
      this.scene.start("scene0", artifacts);
    });
  }

  createShopButton() {
    const buttonX = 70;
    const buttonY = 106;

    const storeButtonBg = this.add
      .circle(buttonX, buttonY, 28, 0x101820, 0.6)
      .setStrokeStyle(2, 0x27415e)
      .setDepth(53)
      .setInteractive({ useHandCursor: true });

    const storeButtonLabel = this.add
      .text(buttonX, buttonY, "SHOP", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#dff1ff",
      })
      .setOrigin(0.5)
      .setDepth(54)
      .setInteractive({ useHandCursor: true });

    const onStoreClick = () => {
      if (!window.LojaNaves?.openStoreModal) return;

      const queuedAssets = window.LojaNaves.preloadShipTextures
        ? window.LojaNaves.preloadShipTextures(this)
        : 0;

      if (queuedAssets > 0) {
        this.load.once("complete", () => {
          window.LojaNaves.openStoreModal(this);
        });
        this.load.start();
        return;
      }

      window.LojaNaves.openStoreModal(this);
    };

    const setHoverState = (isHover) => {
      if (!storeButtonBg.active) return;
      storeButtonBg.setAlpha(isHover ? 0.85 : 0.6);
      if (storeButtonLabel && storeButtonLabel.active) {
        storeButtonLabel.setScale(isHover ? 1.06 : 1);
      }
    };

    storeButtonBg.on("pointerover", () => setHoverState(true));
    storeButtonBg.on("pointerout", () => setHoverState(false));
    storeButtonBg.on("pointerdown", onStoreClick);

    storeButtonLabel.on("pointerover", () => setHoverState(true));
    storeButtonLabel.on("pointerout", () => setHoverState(false));
    storeButtonLabel.on("pointerdown", onStoreClick);

    this.events.once("shutdown", () => {
      if (storeButtonBg && storeButtonBg.active) {
        storeButtonBg.off("pointerover");
        storeButtonBg.off("pointerout");
        storeButtonBg.off("pointerdown");
      }
      if (storeButtonLabel && storeButtonLabel.active) {
        storeButtonLabel.off("pointerover");
        storeButtonLabel.off("pointerout");
        storeButtonLabel.off("pointerdown");
      }
    });

    return { background: storeButtonBg, text: storeButtonLabel };
  }

  createButton({ x, y, label, fillColor, hoverColor, onClick }) {
    const width = Math.min(this.scale.width * 0.3, 220);
    const height = Math.max(36, this.scale.height * 0.075);
    const fontSize = Math.max(10, Math.round(this.scale.height * 0.026));

    const background = this.add
      .rectangle(x, y, width, height, fillColor)
      .setStrokeStyle(2, 0x2a2a2a)
      .setAlpha(0.58)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${fontSize}px`,
        fontStyle: "bold",
        color: "#ededed",
      })
      .setOrigin(0.5);

    const onPointerOver = () => {
      if (!background.active) return;
      background.setFillStyle(hoverColor);
      background.setAlpha(0.66);
      if (text && text.active) text.setScale(1.03);
    };

    const onPointerOut = () => {
      if (!background.active) return;
      background.setFillStyle(fillColor);
      background.setAlpha(0.58);
      if (text && text.active) text.setScale(1);
    };

    const onPointerDown = () => {
      if (!background.active) return;
      onClick();
    };

    background.on("pointerover", onPointerOver);
    background.on("pointerout", onPointerOut);
    background.on("pointerdown", onPointerDown);

    this.events.once("shutdown", () => {
      if (background && background.active) {
        background.off("pointerover", onPointerOver);
        background.off("pointerout", onPointerOut);
        background.off("pointerdown", onPointerDown);
      }
    });

    return { background, text };
  }
}

export default room;
