class player extends Phaser.Scene {
  constructor() {
    super("player");
  }

  preload() {
    this.load.setPath("assets/");

    // Load coin texture if not already loaded
    if (!this.textures.exists("coinIcon")) {
      this.load.image("coinIcon", "moeda.png");
    }

    // Preload ship textures se não estiverem carregadas
    if (window.LojaNaves && window.LojaNaves.getShips) {
      const ships = window.LojaNaves.getShips();
      const loadedTextures = new Set();

      ships.forEach((ship) => {
        if (
          loadedTextures.has(ship.textureKey) ||
          this.textures.exists(ship.textureKey)
        ) {
          return;
        }
        loadedTextures.add(ship.textureKey);
        const normalizedAssetPath = ship.assetPath.startsWith("assets/")
          ? ship.assetPath.replace(/^assets\//, "")
          : ship.assetPath;

        if (ship.frameRect) {
          this.load.image(ship.textureKey, normalizedAssetPath);
        } else {
          this.load.spritesheet(ship.textureKey, normalizedAssetPath, {
            frameWidth: ship.frameWidth,
            frameHeight: ship.frameHeight,
          });
        }
      });
    }
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const pixelFont = '"Press Start 2P", monospace';
    const backgroundKey = this.textures.exists("room-background")
      ? "room-background"
      : "menuBackground";

    // Background
    this.add
      .image(width / 2, height / 2, backgroundKey)
      .setDisplaySize(width, height)
      .setDepth(-1)
      .postFX.addBlur(5);

    // Coins HUD (top right corner)
    const coinsLabel = this.add
      .text(width - 150, 20, "", {
        fontFamily: pixelFont,
        fontSize: "11px",
        color: "#fff4ba",
      })
      .setOrigin(0.5)
      .setDepth(10);

    const updateCoinsText = () => {
      const coins = window.BancoMoedas?.getCoins?.() || 0;
      coinsLabel.setText(`${coins} moedas`);
    };

    updateCoinsText();

    // Listen for coin updates
    window.addEventListener("space-war-coins-updated", updateCoinsText);

    // Clean up listener when scene shuts down
    this.events.once("shutdown", () => {
      window.removeEventListener("space-war-coins-updated", updateCoinsText);
    });

    // Display coin icon if texture exists
    if (this.textures.exists("coinIcon")) {
      this.add
        .image(width - 180, 20, "coinIcon")
        .setScale(1.5)
        .setDepth(10);
    }

    // Title
    this.add
      .text(width / 2, height * 0.15, "Selecione Modo de Jogo", {
        fontFamily: pixelFont,
        fontSize: "24px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Get equipped ship
    const equippedShip = window.LojaNaves?.getEquippedShip?.();
    const ownedShips = window.LojaNaves?.getOwnedShips?.() || [];

    // Display equipped ship preview
    if (equippedShip && this.textures.exists(equippedShip.textureKey)) {
      const shipSprite = this.add
        .sprite(
          width / 2,
          height * 0.42,
          equippedShip.textureKey,
          equippedShip.frameKey || 0,
        )
        .setScale(equippedShip.playerScale * 2.5)
        .setDepth(5);

      if (equippedShip.tint && equippedShip.tint !== 0xffffff) {
        shipSprite.setTint(equippedShip.tint);
      }
    }

    // Ship info
    const shipName = equippedShip?.name || "Nave padrão";
    this.add
      .text(width / 2, height * 0.63, `Nave Equipada: ${shipName}`, {
        fontFamily: pixelFont,
        fontSize: "14px",
        color: "#e9f2ff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Owned ships info
    this.add
      .text(width / 2, height * 0.69, `Naves Possuídas: ${ownedShips.length}`, {
        fontFamily: pixelFont,
        fontSize: "11px",
        color: "#bfbfbf",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Button: Open Shop
    this.createButton({
      x: width / 2,
      y: height * 0.765,
      label: "Loja",
      fillColor: 0x1a2f4d,
      hoverColor: 0x2a4f7d,
      onClick: () => {
        if (window.LojaNaves) {
          // Import and call the store modal from loja.js
          // Since openStoreModal is not exported, we'll trigger it indirectly
          // by dispatching an event that scene0 would listen to
          window.dispatchEvent(new CustomEvent("open-store-from-player"));
        }
      },
    });

    // Button: Jogar
    this.createButton({
      x: width / 2,
      y: height * 0.85,
      label: "Jogar",
      fillColor: 0x1a3a1a,
      hoverColor: 0x2a6a2a,
      onClick: () => {
        this.scene.stop("player");
        this.scene.start("room");
      },
    });

    // Info text
    this.add
      .text(
        width / 2,
        height * 0.93,
        "Customize sua nave na Loja antes de jogar",
        {
          fontFamily: pixelFont,
          fontSize: "9px",
          color: "#888888",
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(10);
  }

  createButton({ x, y, label, fillColor, hoverColor, onClick }) {
    const width = 200;
    const height = 44;
    const fontSize = 14;

    const background = this.add
      .rectangle(x, y, width, height, fillColor)
      .setStrokeStyle(2, 0x2a2a2a)
      .setAlpha(0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(15);

    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: `${fontSize}px`,
        fontStyle: "bold",
        color: "#ededed",
      })
      .setOrigin(0.5)
      .setDepth(16);

    const onPointerOver = () => {
      if (!background.active) return;
      background.setFillStyle(hoverColor);
      background.setAlpha(0.95);
      if (text && text.active) text.setScale(1.05);
    };

    const onPointerOut = () => {
      if (!background.active) return;
      background.setFillStyle(fillColor);
      background.setAlpha(0.85);
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

export default player;
