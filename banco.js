import Scene0 from "./scene0.js";
import TelaInicial from "./telainicial.js";

const COINS_STORAGE_KEY = "spaceWarCoins";
const COIN_TEXTURE_KEY = "coinIcon";

let fallbackCoins = 0;
let lastRewardAmount = 0;

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function normalizeCoins(value) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric < 0) return 0;
  return numeric;
}

function getCoins() {
  if (!canUseStorage()) return fallbackCoins;
  const stored = window.localStorage.getItem(COINS_STORAGE_KEY);
  return normalizeCoins(stored);
}

function setCoins(value) {
  const normalized = normalizeCoins(value);

  if (canUseStorage()) {
    window.localStorage.setItem(COINS_STORAGE_KEY, String(normalized));
  } else {
    fallbackCoins = normalized;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("space-war-coins-updated", {
        detail: { coins: normalized },
      }),
    );
  }

  return normalized;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addCoins(amount) {
  const current = getCoins();
  const updated = setCoins(current + amount);
  return {
    amount,
    total: updated,
  };
}

function calculateVictoryReward(roundCount = 0) {
  if (roundCount > 35) {
    return randomInt(60, 70);
  }
  if (roundCount > 27 && roundCount <= 35) {
    return randomInt(55, 65);
  }
  if (roundCount >= 17) {
    return randomInt(50, 60);
  }
  return randomInt(40, 50);
}

function calculateDefeatReward(roundCount = 0) {
  if (roundCount > 35) {
    return randomInt(15, 20);
  }
  if (roundCount > 27 && roundCount <= 35) {
    return randomInt(13, 18);
  }
  if (roundCount >= 17) {
    return randomInt(10, 15);
  }
  return randomInt(5, 10);
}

function rewardVictory(roundCount = 0) {
  const reward = calculateVictoryReward(roundCount);
  lastRewardAmount = reward;
  return addCoins(reward);
}

function rewardDefeat(roundCount = 0) {
  const reward = calculateDefeatReward(roundCount);
  lastRewardAmount = reward;
  return addCoins(reward);
}

function createMenuCoinsHud(scene) {
  if (!scene || !scene.add) return;

  const panel = scene.add
    .image(14, 10, COIN_TEXTURE_KEY)
    .setOrigin(0, 0)
    .setDisplaySize(110, 55)
    .setScrollFactor(0)
    .setDepth(50);

  const valueText = scene.add
    .text(124, 37.5, String(getCoins()), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "12px",
      color: "#fff4ba",
      stroke: "#2c1a00",
      strokeThickness: 2,
      align: "left",
    })
    .setOrigin(0, 0.5)
    .setScrollFactor(0)
    .setDepth(51);

  const updateCoinsText = (event) => {
    if (!valueText.active) return;
    if (!event || !event.detail) {
      valueText.setText(String(getCoins()));
      return;
    }

    valueText.setText(String(normalizeCoins(event.detail.coins)));
  };

  if (typeof window !== "undefined") {
    window.addEventListener("space-war-coins-updated", updateCoinsText);
    scene.events.once("shutdown", () => {
      window.removeEventListener("space-war-coins-updated", updateCoinsText);
    });
  }

  scene.events.once("shutdown", () => {
    if (panel && panel.active) panel.destroy();
    if (valueText && valueText.active) valueText.destroy();
  });
}

const originalMenuPreload = TelaInicial.prototype.preload;
TelaInicial.prototype.preload = function patchedMenuPreload(...args) {
  originalMenuPreload.apply(this, args);

  if (!this.textures.exists(COIN_TEXTURE_KEY)) {
    this.load.image(COIN_TEXTURE_KEY, "assets/moeda.png");
  }
};

const originalMenuCreate = TelaInicial.prototype.create;
TelaInicial.prototype.create = function patchedMenuCreate(...args) {
  originalMenuCreate.apply(this, args);
  createMenuCoinsHud(this);
};

const originalHandlePlayer2Defeat = Scene0.prototype.handlePlayer2Defeat;
Scene0.prototype.handlePlayer2Defeat = function patchedHandlePlayer2Defeat(
  ...args
) {
  if (!this.__coinsRewardGranted) {
    this.__coinsRewardGranted = true;
    rewardVictory(this.roundCount || 0);
  }

  return originalHandlePlayer2Defeat.apply(this, args);
};

const originalHandlePlayer1Defeat = Scene0.prototype.handlePlayer1Defeat;
Scene0.prototype.handlePlayer1Defeat = function patchedHandlePlayer1Defeat(
  ...args
) {
  if (!this.__coinsRewardGranted) {
    this.__coinsRewardGranted = true;
    rewardDefeat(this.roundCount || 0);
  }

  return originalHandlePlayer1Defeat.apply(this, args);
};

window.BancoMoedas = {
  getCoins,
  setCoins,
  addCoins,
  rewardVictory,
  rewardDefeat,
  getLastRewardAmount: () => lastRewardAmount,
};
