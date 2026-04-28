import Scene0 from "./scene0.js";
import TelaInicial from "./telainicial.js";

const OWNED_SHIPS_STORAGE_KEY = "spaceWarOwnedShips";
const EQUIPPED_SHIP_STORAGE_KEY = "spaceWarEquippedShip";
const SHIPS_UPDATED_EVENT = "space-war-ships-updated";

const SHIPS = [
  {
    id: "vanguarda-esmeralda",
    name: "Vanguarda Esmeralda",
    description: "Cápsula espacial equipada com armamento",
    price: 150,
    textureKey: "ship-atlas-core",
    assetPath: "assets/map-assets/spritesheet.png",
    frameRect: { x: 266, y: 477, w: 64, h: 64 },
    frameKey: "enemy_1_g_m.png",
    playerScale: 1.45,
    previewScale: 1.05,
    flipYInStorePreview: true,
    tint: 0xffffff,
    flipYForPlayer1: true,
    reloadEffect: {
      textureKey: "sheet",
      frameKey: "expb_02",
      displaySize: 22,
      baseScale: 0.75,
      peakScale: 1.35,
      duration: 160,
      hold: 90,
      resetScale: 0.75,
      offsets: [
        { x: -20, y: -63 },
        { x: 22, y: -63 },
      ],
    },
    defaultOwned: false,
  },
  {
    id: "falcao-mk1",
    name: "Falcao MK-I",
    description: "Nave espacial da frota humana",
    price: 0,
    textureKey: "ship-falcao-mk1",
    assetPath: "assets/player_b_m.png",
    frameWidth: 64,
    frameHeight: 64,
    playerScale: 1.55,
    previewScale: 1.15,
    tint: 0xffffff,
    reloadEffect: {
      textureKey: "sheet",
      frameKey: "expb_03",
      displaySize: 22,
      baseScale: 0.72,
      peakScale: 1.28,
      duration: 150,
      hold: 80,
      resetScale: 0.72,
      offsets: [
        { x: -18, y: -62 },
        { x: 18, y: -62 },
      ],
    },
    defaultOwned: true,
  },
  {
    id: "falcao-elite",
    name: "Falcão de Elite",
    description: "Nave Espacial de combate avançada da frota humana",
    price: 500,
    textureKey: "ship-falcao-elite",
    assetPath: "assets/player_b_m.png",
    frameWidth: 64,
    frameHeight: 64,
    playerScale: 1.55,
    previewScale: 1.15,
    tint: 0xffdd66,
    reloadEffect: {
      textureKey: "sheet",
      frameKey: "expb_02",
      displaySize: 22,
      baseScale: 0.75,
      peakScale: 1.35,
      duration: 160,
      hold: 90,
      resetScale: 0.75,
      offsets: [
        { x: -20, y: -63 },
        { x: 17, y: -63 },
      ],
    },
    defaultOwned: false,
  },
  {
    id: "fragata-rubi",
    name: "Space X",
    description: "Nave espacial da frota Humana de Defesa",
    price: 250,
    textureKey: "ship-atlas-core",
    assetPath: "assets/map-assets/spritesheet.png",
    frameRect: { x: 68, y: 741, w: 64, h: 64 },
    frameKey: "enemy_2_r_m.png",
    playerScale: 1.45,
    previewScale: 1.05,
    flipYInStorePreview: true,
    tint: 0xffffff,
    flipYForPlayer1: true,
    reloadEffect: {
      textureKey: "sheet",
      frameKey: "expb_02",
      displaySize: 22,
      baseScale: 0.75,
      peakScale: 1.35,
      duration: 160,
      hold: 90,
      resetScale: 0.75,
      offsets: [
        { x: -16, y: -63 },
        { x: 17, y: -63 },
      ],
    },
    defaultOwned: false,
  },
  {
    id: "fragata-neon",
    name: "Troféu do General",
    description: "Espaçonave marciana do General Et. Bilu",
    price: 700,
    textureKey: "ship-fragata-neon",
    assetPath: "assets/Alien-Frigate(3).png",
    frameWidth: 110,
    frameHeight: 110,
    playerScale: 1.25,
    previewScale: 0.68,
    flipYInStorePreview: true,
    tint: 0x66ffee,
    flipYForPlayer1: true,
    reloadEffect: {
      textureKey: "sheet",
      frameKey: "expb_02",
      displaySize: 22,
      baseScale: 0.75,
      peakScale: 1.35,
      duration: 160,
      hold: 90,
      resetScale: 0.75,
      offsets: [
        { x: -12, y: -70 },
        { x: 12, y: -70 },
      ],
    },
    defaultOwned: false,
  },
];

const SHIPS_BY_ID = new Map(SHIPS.map((ship) => [ship.id, ship]));
const DEFAULT_SHIP = SHIPS.find((ship) => ship.defaultOwned) || SHIPS[0];
const DEFAULT_RELOAD_EFFECT = {
  textureKey: "sheet",
  frameKey: "expb_02",
  displaySize: 22,
  baseScale: 0.75,
  peakScale: 1.35,
  duration: 160,
  hold: 90,
  resetScale: 0.75,
  offsets: [
    { x: -20, y: -63 },
    { x: 17, y: -63 },
  ],
};

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readJsonArray(key) {
  if (!canUseStorage()) return [];

  let rawValue;
  try {
    rawValue = window.localStorage.getItem(key);
  } catch {
    return [];
  }

  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function uniqueShipIds(shipIds) {
  return Array.from(
    new Set(shipIds.filter((shipId) => SHIPS_BY_ID.has(shipId))),
  );
}

function getOwnedShips() {
  const storedIds = uniqueShipIds(readJsonArray(OWNED_SHIPS_STORAGE_KEY));

  if (DEFAULT_SHIP && !storedIds.includes(DEFAULT_SHIP.id)) {
    storedIds.unshift(DEFAULT_SHIP.id);
  }

  return storedIds;
}

function persistOwnedShips(shipIds) {
  const normalizedIds = uniqueShipIds(shipIds);
  if (DEFAULT_SHIP && !normalizedIds.includes(DEFAULT_SHIP.id)) {
    normalizedIds.unshift(DEFAULT_SHIP.id);
  }

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(
        OWNED_SHIPS_STORAGE_KEY,
        JSON.stringify(normalizedIds),
      );
    } catch {
      return [...normalizedIds];
    }
  }

  return normalizedIds;
}

function getEquippedShipId() {
  if (!canUseStorage()) return DEFAULT_SHIP.id;

  let equippedShipId = null;
  try {
    equippedShipId = window.localStorage.getItem(EQUIPPED_SHIP_STORAGE_KEY);
  } catch {
    return DEFAULT_SHIP.id;
  }

  const ownedShips = getOwnedShips();

  if (equippedShipId && ownedShips.includes(equippedShipId)) {
    return equippedShipId;
  }

  return DEFAULT_SHIP.id;
}

function setEquippedShip(shipId) {
  const ownedShips = getOwnedShips();
  if (!ownedShips.includes(shipId)) {
    return false;
  }

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(EQUIPPED_SHIP_STORAGE_KEY, shipId);
    } catch {
      return false;
    }
  }

  notifyShipsUpdated();
  return true;
}

function getShipById(shipId) {
  return SHIPS_BY_ID.get(shipId) || DEFAULT_SHIP;
}

function getReloadEffectForShip(shipId) {
  const ship = getShipById(shipId);
  return {
    ...DEFAULT_RELOAD_EFFECT,
    ...(ship.reloadEffect || {}),
  };
}

function getEquippedShip() {
  return getShipById(getEquippedShipId());
}

function getEquippedShipReloadEffect() {
  return getReloadEffectForShip(getEquippedShipId());
}

function notifyShipsUpdated() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(SHIPS_UPDATED_EVENT, {
      detail: {
        ownedShips: getOwnedShips(),
        equippedShipId: getEquippedShipId(),
      },
    }),
  );
}

function getCoinsAvailable() {
  return window.BancoMoedas?.getCoins?.() || 0;
}

function spendCoins(amount) {
  if (!window.BancoMoedas?.setCoins || !window.BancoMoedas?.getCoins) {
    return false;
  }

  const currentCoins = window.BancoMoedas.getCoins();
  if (currentCoins < amount) return false;

  window.BancoMoedas.setCoins(currentCoins - amount);
  return true;
}

function buyShip(shipId) {
  const ship = SHIPS_BY_ID.get(shipId);
  if (!ship) {
    return { ok: false, message: "Nave invalida." };
  }

  const ownedShips = getOwnedShips();
  if (ownedShips.includes(ship.id)) {
    return { ok: true, message: "Nave ja comprada.", alreadyOwned: true };
  }

  const coinsBeforePurchase = getCoinsAvailable();

  if (!spendCoins(ship.price)) {
    return { ok: false, message: "Moedas insuficientes." };
  }

  const updatedOwnedShips = persistOwnedShips([...ownedShips, ship.id]);
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(EQUIPPED_SHIP_STORAGE_KEY, ship.id);
    } catch {
      if (window.BancoMoedas?.setCoins) {
        window.BancoMoedas.setCoins(coinsBeforePurchase);
      }
      return { ok: false, message: "Nao foi possivel salvar a compra." };
    }
  }

  notifyShipsUpdated();

  return {
    ok: true,
    message: `${ship.name} comprada e equipada!`,
    ownedShips: updatedOwnedShips,
    equippedShipId: ship.id,
  };
}

function preloadShipTextures(scene) {
  if (!scene || !scene.load || !scene.textures) return;

  const queuedTextureKeys = new Set();

  SHIPS.forEach((ship) => {
    if (scene.textures.exists(ship.textureKey)) return;
    if (queuedTextureKeys.has(ship.textureKey)) return;

    queuedTextureKeys.add(ship.textureKey);

    if (ship.frameRect) {
      scene.load.image(ship.textureKey, ship.assetPath);
    } else {
      scene.load.spritesheet(ship.textureKey, ship.assetPath, {
        frameWidth: ship.frameWidth,
        frameHeight: ship.frameHeight,
      });
    }
  });
}

function ensureShipFrames(scene) {
  if (!scene || !scene.textures) return;

  SHIPS.forEach((ship) => {
    if (!ship.frameRect) return;
    if (!scene.textures.exists(ship.textureKey)) return;

    const texture = scene.textures.get(ship.textureKey);
    if (!texture || texture.has(ship.frameKey)) return;

    texture.add(
      ship.frameKey,
      0,
      ship.frameRect.x,
      ship.frameRect.y,
      ship.frameRect.w,
      ship.frameRect.h,
    );
  });
}

function applyEquippedShipToPlayer(scene) {
  if (!scene || !scene.player) return;

  ensureShipFrames(scene);

  const ship = getEquippedShip();
  if (!ship || !scene.textures.exists(ship.textureKey)) return;

  scene.player.setTexture(ship.textureKey, ship.frameKey || 0);
  scene.player.setScale(ship.playerScale);
  scene.player.setFlipY(Boolean(ship.flipYForPlayer1));

  if (ship.tint && ship.tint !== 0xffffff) {
    scene.player.setTint(ship.tint);
  } else {
    scene.player.clearTint();
  }
}

function openStoreModal(scene) {
  if (!scene || scene.__shipStoreModal) return;

  ensureShipFrames(scene);

  const width = scene.scale.width;
  const height = scene.scale.height;
  const pixelFont = '"Press Start 2P", monospace';

  const overlay = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 0.74)
    .setDepth(120)
    .setInteractive();

  const panel = scene.add
    .rectangle(
      width / 2,
      height / 2,
      width * 0.88,
      height * 0.9,
      0x0e121a,
      0.95,
    )
    .setStrokeStyle(3, 0x2e3e57)
    .setDepth(121);

  const title = scene.add
    .text(width / 2, height * 0.12, "LOJA DE NAVES", {
      fontFamily: pixelFont,
      fontSize: "16px",
      color: "#e9f2ff",
    })
    .setOrigin(0.5)
    .setDepth(122);

  const coinsLabel = scene.add
    .text(width / 2, height * 0.175, "", {
      fontFamily: pixelFont,
      fontSize: "11px",
      color: "#fff4ba",
    })
    .setOrigin(0.5)
    .setDepth(122);

  const feedbackText = scene.add
    .text(width / 2, height * 0.87, "", {
      fontFamily: pixelFont,
      fontSize: "10px",
      color: "#9affbe",
    })
    .setOrigin(0.5)
    .setDepth(122)
    .setVisible(false);

  // Scroll configuration
  const scrollAreaTop = height * 0.24;
  const scrollAreaHeight = height * 0.66;
  const rowGap = 88;
  const rows = [];
  let scrollOffset = 0;

  // Calculate if we need scrolling
  const totalRowsHeight = SHIPS.length * rowGap + 34;
  const canScroll = totalRowsHeight > scrollAreaHeight;
  const maxScroll = canScroll
    ? Math.max(0, totalRowsHeight - scrollAreaHeight)
    : 0;

  // Create scroll mask
  if (canScroll) {
    const maskGraphics = scene.make.graphics({
      x: width / 2,
      y: scrollAreaTop,
      add: false,
    });
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(
      -(width * 0.88) / 2,
      0,
      width * 0.88,
      scrollAreaHeight,
    );
    const mask = maskGraphics.createGeometryMask();
  }

  const rowStartY = scrollAreaTop + 38;

  // Create container for scrollable content
  const scrollContainer = scene.add.container(0, 0);

  SHIPS.forEach((ship, index) => {
    const baseRowY = rowStartY + index * rowGap;

    const rowBackground = scene.add
      .rectangle(width / 2, baseRowY, width * 0.78, 80, 0x182436, 0.88)
      .setStrokeStyle(2, 0x304966)
      .setDepth(122);

    const preview = scene.add
      .sprite(width * 0.18, baseRowY, ship.textureKey, ship.frameKey || 0)
      .setScale(ship.previewScale)
      .setFlipY(Boolean(ship.flipYInStorePreview))
      .setDepth(123);

    if (ship.tint && ship.tint !== 0xffffff) {
      preview.setTint(ship.tint);
    }

    const nameText = scene.add
      .text(width * 0.3, baseRowY - 14, ship.name, {
        fontFamily: pixelFont,
        fontSize: "10px",
        color: "#eaf3ff",
      })
      .setOrigin(0, 0.5)
      .setDepth(123);

    const descText = scene.add
      .text(width * 0.3, baseRowY + 10, ship.description, {
        fontFamily: pixelFont,
        fontSize: "7px",
        color: "#adc7e8",
        wordWrap: { width: width * 0.48 },
      })
      .setOrigin(0, 0.5)
      .setDepth(123);

    const actionButton = scene.add
      .rectangle(width * 0.8, baseRowY, 150, 40, 0x1b1b1b, 0.95)
      .setStrokeStyle(2, 0x3b3b3b)
      .setInteractive({ useHandCursor: true })
      .setDepth(123);

    const actionLabel = scene.add
      .text(width * 0.8, baseRowY, "", {
        fontFamily: pixelFont,
        fontSize: "9px",
        color: "#f0f0f0",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(124);

    rows.push({
      ship,
      rowBackground,
      preview,
      nameText,
      descText,
      actionButton,
      actionLabel,
      actionType: "none",
    });
  });

  // Add all row elements to scroll container
  rows.forEach((row) => {
    scrollContainer.add([
      row.rowBackground,
      row.preview,
      row.nameText,
      row.descText,
      row.actionButton,
      row.actionLabel,
    ]);
  });

  // Create mask for scrollable area
  const maskGraphics = scene.make.graphics({ add: false });
  maskGraphics.fillStyle(0xffffff);
  maskGraphics.fillRect(
    width / 2 - (width * 0.88) / 2,
    scrollAreaTop,
    width * 0.88,
    scrollAreaHeight,
  );
  const mask = maskGraphics.createGeometryMask();
  scrollContainer.setMask(mask);
  scrollContainer.setDepth(122);

  // Handle scroll with draggable scrollbar
  const onWheel = (pointer, gameObjects, deltaX, deltaY) => {
    if (!scene.__shipStoreModal) return;
    scrollOffset = Phaser.Math.Clamp(scrollOffset + deltaY * 0.3, 0, maxScroll);
    scrollContainer.y = -scrollOffset;
    updateScrollBar();
  };

  // Create scrollbar
  const scrollBarX = width / 2 + (width * 0.88) / 2 - 12;
  const scrollBarTrack = scene.add
    .rectangle(scrollBarX, height / 2, 8, scrollAreaHeight, 0x0a0f15, 0.6)
    .setDepth(125);

  const scrollBarHeight =
    (scrollAreaHeight / totalRowsHeight) * scrollAreaHeight;
  const scrollBar = scene.add
    .rectangle(
      scrollBarX,
      scrollAreaTop + scrollBarHeight / 2,
      8,
      scrollBarHeight,
      0x4a7a9f,
      0.9,
    )
    .setDepth(125)
    .setInteractive({ useHandCursor: true });

  let isDraggingScrollBar = false;

  scrollBar.on("pointerdown", () => {
    isDraggingScrollBar = true;
  });

  scene.input.on("pointerup", () => {
    isDraggingScrollBar = false;
  });

  scene.input.on("pointermove", (pointer) => {
    if (!isDraggingScrollBar || !scene.__shipStoreModal) return;

    // Calculate scroll position based on scrollbar Y
    const scrollBarTrackTop = scrollAreaTop;
    const scrollBarTrackBottom = scrollAreaTop + scrollAreaHeight;
    const trackHeight =
      scrollBarTrackBottom - scrollBarTrackTop - scrollBarHeight;

    const clampedY = Phaser.Math.Clamp(
      pointer.y,
      scrollBarTrackTop + scrollBarHeight / 2,
      scrollBarTrackBottom - scrollBarHeight / 2,
    );
    const scrollPercent =
      (clampedY - scrollBarTrackTop - scrollBarHeight / 2) / trackHeight;

    scrollOffset = scrollPercent * maxScroll;
    scrollContainer.y = -scrollOffset;
    updateScrollBar();
  });

  const updateScrollBar = () => {
    if (!canScroll) return;
    const scrollPercent = scrollOffset / maxScroll;
    const scrollBarY =
      scrollAreaTop +
      (scrollAreaHeight - scrollBarHeight) * scrollPercent +
      scrollBarHeight / 2;
    scrollBar.y = scrollBarY;
  };

  const closeButton = scene.add
    .rectangle(width / 2, height * 0.915, 190, 34, 0x2c1111, 0.95)
    .setStrokeStyle(2, 0x5e2424)
    .setInteractive({ useHandCursor: true })
    .setDepth(123);

  const closeLabel = scene.add
    .text(width / 2, height * 0.915, "Fechar", {
      fontFamily: pixelFont,
      fontSize: "10px",
      color: "#ffd5d5",
    })
    .setOrigin(0.5)
    .setDepth(124);

  const modalItems = [
    overlay,
    panel,
    title,
    coinsLabel,
    feedbackText,
    closeButton,
    closeLabel,
    scrollContainer,
    maskGraphics,
    scrollBarTrack,
    scrollBar,
    ...rows.flatMap((row) => [
      row.rowBackground,
      row.preview,
      row.nameText,
      row.descText,
      row.actionButton,
      row.actionLabel,
    ]),
  ];

  const refresh = () => {
    const coins = getCoinsAvailable();
    const ownedShips = getOwnedShips();
    const equippedShipId = getEquippedShipId();
    coinsLabel.setText(`Moedas: ${coins}`);

    rows.forEach((row) => {
      const isOwned = ownedShips.includes(row.ship.id);
      const isEquipped = row.ship.id === equippedShipId;

      if (isEquipped) {
        row.actionButton
          .setFillStyle(0x124022, 1)
          .setStrokeStyle(2, 0x2a8f4b)
          .disableInteractive();
        row.actionLabel.setText("EQUIPADO").setColor("#baffc7");
        row.actionType = "equipped";
        return;
      }

      row.actionButton.setInteractive({ useHandCursor: true });

      if (isOwned) {
        row.actionButton.setFillStyle(0x1d3448, 1).setStrokeStyle(2, 0x37688f);
        row.actionLabel.setText("EQUIPAR").setColor("#d7ebff");
        row.actionType = "equip";
      } else {
        row.actionButton.setFillStyle(0x302e1c, 1).setStrokeStyle(2, 0x766a2f);
        row.actionLabel
          .setText(`COMPRAR ${row.ship.price}`)
          .setColor(coins >= row.ship.price ? "#fff0b8" : "#ff9d9d");
        row.actionType = "buy";
      }
    });
  };

  const showFeedback = (message, success = true) => {
    feedbackText
      .setText(message)
      .setColor(success ? "#9affbe" : "#ff9d9d")
      .setVisible(true)
      .setAlpha(1);

    scene.tweens.killTweensOf(feedbackText);
    scene.tweens.add({
      targets: feedbackText,
      alpha: 0,
      duration: 1300,
      delay: 1100,
      ease: "Quad.easeOut",
      onComplete: () => {
        feedbackText.setVisible(false);
      },
    });
  };

  rows.forEach((row) => {
    const onActionButtonClick = () => {
      if (!scene.__shipStoreModal) return;

      if (row.actionType === "equip") {
        const equipped = setEquippedShip(row.ship.id);
        if (equipped) {
          showFeedback(`${row.ship.name} equipada!`, true);
          refresh();
        }
        return;
      }

      if (row.actionType === "buy") {
        const result = buyShip(row.ship.id);
        showFeedback(result.message, Boolean(result.ok));
        refresh();
      }
    };

    row.actionButton.on("pointerdown", onActionButtonClick);
    row._onActionButtonClick = onActionButtonClick;
  });

  const onSceneShutdown = () => {
    closeModal();
  };

  const closeModal = () => {
    if (!scene.__shipStoreModal) return;

    if (typeof window !== "undefined") {
      window.removeEventListener("space-war-coins-updated", refresh);
      window.removeEventListener(SHIPS_UPDATED_EVENT, refresh);
    }

    scene.events.off("shutdown", onSceneShutdown);

    rows.forEach((row) => {
      if (
        row.actionButton &&
        row.actionButton.active &&
        row._onActionButtonClick
      ) {
        row.actionButton.off("pointerdown", row._onActionButtonClick);
      }
    });

    modalItems.forEach((item) => {
      if (item && item.active) item.destroy();
    });

    scene.__shipStoreModal = null;
  };

  closeButton.on("pointerdown", closeModal);
  overlay.on("pointerdown", closeModal);

  if (typeof window !== "undefined") {
    window.addEventListener("space-war-coins-updated", refresh);
    window.addEventListener(SHIPS_UPDATED_EVENT, refresh);
  }

  scene.events.once("shutdown", onSceneShutdown);

  scene.__shipStoreModal = {
    close: closeModal,
  };

  refresh();
}

if (!TelaInicial.prototype.__shipStorePatched) {
  TelaInicial.prototype.__shipStorePatched = true;

  const originalMenuPreload = TelaInicial.prototype.preload;
  TelaInicial.prototype.preload = function patchedMenuPreload(...args) {
    originalMenuPreload.apply(this, args);
    preloadShipTextures(this);
  };

  const originalMenuCreate = TelaInicial.prototype.create;
  TelaInicial.prototype.create = function patchedMenuCreate(...args) {
    originalMenuCreate.apply(this, args);

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
      openStoreModal(this);
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

    this.storeButton = {
      background: storeButtonBg,
      label: storeButtonLabel,
    };
  };
}

if (!Scene0.prototype.__shipStorePatched) {
  Scene0.prototype.__shipStorePatched = true;

  const originalScenePreload = Scene0.prototype.preload;
  Scene0.prototype.preload = function patchedScenePreload(...args) {
    originalScenePreload.apply(this, args);
    preloadShipTextures(this);
  };
}

if (typeof window !== "undefined") {
  const ownedShips = persistOwnedShips(getOwnedShips());
  const equippedShipId = getEquippedShipId();

  if (!ownedShips.includes(equippedShipId)) {
    try {
      window.localStorage.setItem(EQUIPPED_SHIP_STORAGE_KEY, DEFAULT_SHIP.id);
    } catch {
      // Ignora falha de persistencia e mantem padrao em memoria.
    }
  }
}

window.LojaNaves = {
  getShips: () => [...SHIPS],
  getOwnedShips,
  getEquippedShip,
  getReloadEffectForShip,
  getEquippedShipReloadEffect,
  setEquippedShip,
  buyShip,
};
