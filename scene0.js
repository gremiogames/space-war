import BotController from "./bot-controller.js";

class scene0 extends Phaser.Scene {
  constructor() {
    super("scene0");

    this.background;
    this.backgroundSpeed = 0.25;
    this.backgroundDirection = 1;
    this.backgroundMinX = 0;
    this.backgroundMaxX = 0;
    this.player;
    this.player2;
    this.stars;
    this.bombs;
    this.platforms;
    this.cursors;
    this.button;
    this.buttonArmor;
    this.buttonReload;
    this.player1Lives = 3;
    this.player2Lives = 3;
    this.player1Hearts = [];
    this.player2Hearts = [];
    this.shotsLoaded = 0;
    this.tiro;
    this.tiroTween;
    this.shield;
    this.shieldActive = false;
    this.shieldTimerEvent = null;
    this.score = 0;
    this.gameOver = false;
    this.scoreText;
    this.ammoText;
    this.victoryText;
    this.uiFontFamily = "Trebuchet MS, sans-serif";
    this.countdownNumberSize = "64px";
    this.countdownMessageSize = "48px";
    this.playerShieldSize = 104;
    this.playerShieldOffsetX = 2;
    this.playerShieldOffsetY = 50;
    this.reloadOrbSize = 22;
    this.botReloadOrbSize = 18;
    this.playerReloadOrbOffsets = [
      { x: -20, y: -63 },
      { x: 17, y: -63 },
    ];
    this.botReloadOrbOffsets = [
      { x: -10, y: 67 },
      { x: 12, y: 67 },
    ];
    this.playerReloadOrbs = [];
    this.botReloadOrbs = [];
    this.playerReloadEffectConfig = null;
    this.botReloadEffectConfig = null;

    // Sistema de contagem regressiva
    this.roundActive = false;
    this.roundTimer = 3000; // 3 segundos em milissegundos
    this.roundCount = 0;
    // Ajuste de progressão de tensão por rodada (edite estes valores livremente).
    this.roundThresholds = {
      to4sAtRound: 1,
      to3sAtRound: 7,
      to2sAtRound: 16,
      to1sAtRound: 27,
      toExact1sAtRound: 35,
    };
    this.mapSpeedByPhase = {
      phase5s: 0.29,
      phase4s: 0.38,
      phase3s: 0.8,
      phase2s: 1.25,
      phase1s: 1.8,
      phaseExact1s: 2.2,
    };
    this.countdownText;
    this.actionExecuted = false; // Controla se uma ação foi executada nesta rodada
    this.selectedAction = null; // Armazena qual ação foi selecionada
    this.botController = new BotController();
    this.botSelectedAction = null;
    this.botShotsLoaded = 0;
    this.botTiro = null;
    this.botTiroTween = null;
    this.botShield = null;
    this.botShieldActive = false;
    this.botShieldTimerEvent = null;
    this.botAmmoText = null;
    this.fullReloadSfx = null;
    this.shieldSfx = null;
    this.explosionSfx = null;
    this.laserExplosionSfx = null;
    this.laserBarrierSfx = null;
    this.losingLifeSfx = null;
    this.gameMusic = null;
    this.returnToMenuEvent = null;
    this.returnToMenuScheduled = false;
    this.roundCountdownEvent = null;
    this.onShipsUpdated = null;
    this.rewardText = null;
    this.rewardCoinIcon = null;
  }

  applyStoreShipToPlayer() {
    if (!this.player || typeof window === "undefined") return;

    const equippedShip = window.LojaNaves?.getEquippedShip?.();
    if (!equippedShip) return;
    if (!this.textures.exists(equippedShip.textureKey)) return;

    if (equippedShip.frameRect && equippedShip.frameKey) {
      const texture = this.textures.get(equippedShip.textureKey);
      if (texture && !texture.has(equippedShip.frameKey)) {
        texture.add(
          equippedShip.frameKey,
          0,
          equippedShip.frameRect.x,
          equippedShip.frameRect.y,
          equippedShip.frameRect.w,
          equippedShip.frameRect.h,
        );
      }
    }

    const frame = equippedShip.frameKey || 0;
    this.player.setTexture(equippedShip.textureKey, frame);

    if (equippedShip.playerScale) {
      this.player.setScale(equippedShip.playerScale);
    }

    this.player.setFlipY(Boolean(equippedShip.flipYForPlayer1));

    if (equippedShip.tint && equippedShip.tint !== 0xffffff) {
      this.player.setTint(equippedShip.tint);
    } else {
      this.player.clearTint();
    }
  }

  getReloadEffectConfigForShip(
    ship,
    fallbackSize = this.reloadOrbSize,
    fallbackOffsets = [],
  ) {
    const reloadEffect = ship?.reloadEffect || {};
    const offsets = Array.isArray(reloadEffect.offsets) && reloadEffect.offsets.length
      ? reloadEffect.offsets
      : fallbackOffsets;

    return {
      textureKey: reloadEffect.textureKey || "sheet",
      frameKey: reloadEffect.frameKey || "expb_02",
      displaySize: reloadEffect.displaySize || fallbackSize,
      baseScale: reloadEffect.baseScale ?? 0.75,
      peakScale: reloadEffect.peakScale ?? 1.35,
      duration: reloadEffect.duration ?? 160,
      hold: reloadEffect.hold ?? 90,
      resetScale: reloadEffect.resetScale ?? reloadEffect.baseScale ?? 0.75,
      tint: reloadEffect.tint,
      depth: reloadEffect.depth ?? 35,
      offsets: offsets.map((offset) => ({
        x: offset.x,
        y: offset.y,
      })),
    };
  }

  refreshReloadEffectConfigs() {
    if (typeof window === "undefined") return;

    const equippedShip = window.LojaNaves?.getEquippedShip?.();

    this.playerReloadEffectConfig = this.getReloadEffectConfigForShip(
      equippedShip,
      this.reloadOrbSize,
      this.playerReloadOrbOffsets,
    );
    this.botReloadEffectConfig = {
      textureKey: "sheet",
      frameKey: "expb_02",
      displaySize: this.botReloadOrbSize,
      baseScale: 0.75,
      peakScale: 1.35,
      duration: 160,
      hold: 90,
      resetScale: 0.75,
      depth: 35,
      offsets: this.botReloadOrbOffsets.map((offset) => ({
        x: offset.x,
        y: offset.y,
      })),
    };
  }

  applyReloadEffectStyle(orbs, config) {
    if (!orbs || !config) return;

    orbs.forEach((orb) => {
      if (!orb || !orb.active) return;

      orb.setTexture(config.textureKey, config.frameKey);
      orb.setDisplaySize(config.displaySize, config.displaySize);
      orb.setScale(config.baseScale);
      orb.setDepth(config.depth);

      if (config.tint && config.tint !== 0xffffff) {
        orb.setTint(config.tint);
      } else {
        orb.clearTint();
      }
    });
  }

  getRoundDurationSeconds() {
    if (this.roundCount >= this.roundThresholds.toExact1sAtRound) return 1;
    if (this.roundCount >= this.roundThresholds.to1sAtRound) return 1;
    if (this.roundCount >= this.roundThresholds.to2sAtRound) return 2;
    if (this.roundCount >= this.roundThresholds.to3sAtRound) return 3;
    if (this.roundCount >= this.roundThresholds.to4sAtRound) return 4;
    return 4;
  }

  getRoundDurationMs() {
    if (this.roundCount >= this.roundThresholds.toExact1sAtRound) return 1000;
    if (this.roundCount >= this.roundThresholds.to1sAtRound) return 1500;
    return this.getRoundDurationSeconds() * 1000;
  }

  updateBackgroundSpeedForRound() {
    if (this.roundCount >= this.roundThresholds.toExact1sAtRound) {
      this.backgroundSpeed = this.mapSpeedByPhase.phaseExact1s;
    } else if (this.roundCount >= this.roundThresholds.to1sAtRound) {
      this.backgroundSpeed = this.mapSpeedByPhase.phase1s;
    } else if (this.roundCount >= this.roundThresholds.to2sAtRound) {
      this.backgroundSpeed = this.mapSpeedByPhase.phase2s;
    } else if (this.roundCount >= this.roundThresholds.to3sAtRound) {
      this.backgroundSpeed = this.mapSpeedByPhase.phase3s;
    } else if (this.roundCount >= this.roundThresholds.to4sAtRound) {
      this.backgroundSpeed = this.mapSpeedByPhase.phase4s;
    } else {
      this.backgroundSpeed = this.mapSpeedByPhase.phase4s;
    }
  }

  preload() {
    this.load.image("backgroundMap", "assets/map-assets/Mapa3.png");

    this.load.spritesheet("player1", "assets/player_b_m.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("player2", "assets/Alien-Frigate(3).png", {
      frameWidth: 110,
      frameHeight: 110,
    });

    this.load.spritesheet("shotbutton", "assets/Enemy_Destroy_Bonus.png", {
      frameWidth: 300,
      frameHeight: 300,
    });

    this.load.image("armorButton", "assets/Armor_Bonus.png");

    this.load.image("reloadButton", "assets/Damage_Bonus.png");

    this.load.image("shield", "assets/spr_shield.png");
    this.load.image("heart", "assets/HEART 1.png");

    this.load.image("sheet", "assets/map-assets/spritesheet.png");
    this.load.atlasXML(
      "sheetAtlas",
      "assets/map-assets/spritesheet.png",
      "assets/map-assets/spritesheet.xml",
    );

    this.load.audio("laser", "assets/efeitolaser.mp3");
    this.load.audio("fullReload", "assets/reloadcharge.mp3");
    this.load.audio(
      "shieldSfx",
      "assets/freesound_community-analog-lazer-fx-87122.mp3",
    );
    this.load.audio("explosionSfx", "assets/explosao.mp3");
    this.load.audio("laserExplosionSfx", "assets/laserexplosao.mp3");
    this.load.audio("laserBarrierSfx", "assets/laserbarrier.mp3");
    this.load.audio("losingLifeSfx", "assets/losinglife.mp3");
    this.load.audio("gameMusic", "assets/musicajogo.mp3");
  }

  create() {
    const x = this.scale.width / 2;
    const y = this.scale.height - 45;
    const yOpposite = 58;
    const centerX = this.cameras.main.centerX;
    const playerScale = 1.55;
    const botScale = 1.25;

    // Reinicia estado da partida ao entrar na cena novamente via menu.
    this.gameOver = false;
    this.roundActive = false;
    this.roundCount = 0;
    this.player1Lives = 3;
    this.player2Lives = 3;
    this.player1Hearts = [];
    this.player2Hearts = [];
    this.shotsLoaded = 0;
    this.botShotsLoaded = 0;
    this.actionExecuted = false;
    this.selectedAction = null;
    this.botSelectedAction = null;
    this.shieldActive = false;
    this.botShieldActive = false;
    this.__coinsRewardGranted = false;

    if (this.shieldTimerEvent) {
      this.shieldTimerEvent.remove(false);
      this.shieldTimerEvent = null;
    }

    if (this.botShieldTimerEvent) {
      this.botShieldTimerEvent.remove(false);
      this.botShieldTimerEvent = null;
    }

    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "backgroundMap")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-10);

    const mapZoomOut = 0.95;
    this.background.tileScaleX = mapZoomOut;
    this.background.tileScaleY = mapZoomOut;

    const mapTexture = this.textures.get("backgroundMap").getSourceImage();
    const visibleMapWidth = this.scale.width / this.background.tileScaleX;
    const visibleMapHeight = this.scale.height / this.background.tileScaleY;
    const mapOffsetX = Math.max(0, (mapTexture.width - visibleMapWidth) / 2);
    const mapOffsetY = Math.max(0, (mapTexture.height - visibleMapHeight) / 2);
    const mapOffsetYExtra = 42;
    this.backgroundMinX = 0;
    this.backgroundMaxX = Math.max(0, mapTexture.width - visibleMapWidth);
    this.background.tilePositionX = mapOffsetX;
    this.background.tilePositionY = mapOffsetY + mapOffsetYExtra;

    this.laser = this.sound.add("laser");
    this.fullReloadSfx = this.sound.add("fullReload");
    this.shieldSfx = this.sound.add("shieldSfx");
    this.explosionSfx = this.sound.add("explosionSfx");
    this.laserExplosionSfx = this.sound.add("laserExplosionSfx");
    this.laserBarrierSfx = this.sound.add("laserBarrierSfx");
    this.losingLifeSfx = this.sound.add("losingLifeSfx");
    this.menuMusic = this.sound.get("menuMusic");
    if (this.menuMusic && this.menuMusic.isPlaying) {
      this.menuMusic.stop();
    }
    this.gameMusic = this.sound.add("gameMusic", {
      loop: true,
      volume: 0.35,
    });

    if (!this.gameMusic.isPlaying) {
      this.gameMusic.play();
    }

    this.returnToMenuScheduled = false;
    this.returnToMenuEvent = null;
    this.rewardText = null;
    this.rewardCoinIcon = null;

    this.events.once("shutdown", () => {
      if (this.time) {
        this.time.removeAllEvents();
      }

      if (this.tweens) {
        this.tweens.killAll();
      }

      if (this.roundCountdownEvent) {
        this.roundCountdownEvent.remove(false);
        this.roundCountdownEvent = null;
      }

      if (this.shieldTimerEvent) {
        this.shieldTimerEvent.remove(false);
        this.shieldTimerEvent = null;
      }

      if (this.botShieldTimerEvent) {
        this.botShieldTimerEvent.remove(false);
        this.botShieldTimerEvent = null;
      }

      if (this.returnToMenuEvent) {
        this.returnToMenuEvent.remove(false);
        this.returnToMenuEvent = null;
      }

      if (typeof window !== "undefined" && this.onShipsUpdated) {
        window.removeEventListener("space-war-ships-updated", this.onShipsUpdated);
        this.onShipsUpdated = null;
      }

      if (this.rewardText && this.rewardText.active) {
        this.rewardText.destroy();
      }
      this.rewardText = null;

      if (this.rewardCoinIcon && this.rewardCoinIcon.active) {
        this.rewardCoinIcon.destroy();
      }
      this.rewardCoinIcon = null;

      if (this.gameMusic && this.gameMusic.isPlaying) {
        this.gameMusic.stop();
      }
    });

    this.player = this.physics.add
      .sprite(x, y, "player1")
      .setScale(playerScale)
      .setOrigin(0.5, 1)
      .setImmovable(true);

    this.player.body.setAllowGravity(false);

    this.player2 = this.physics.add
      .sprite(x, yOpposite, "player2")
      .setScale(botScale)
      .setOrigin(0.5, 0)
      .setImmovable(true);

    this.player2.body.setAllowGravity(false);
    this.applyStoreShipToPlayer();
    this.refreshReloadEffectConfigs();

    if (typeof window !== "undefined") {
      if (!this.onShipsUpdated) {
        this.onShipsUpdated = () => {
          if (!this.scene || !this.scene.isActive()) return;
          this.applyStoreShipToPlayer();
          this.refreshReloadEffectConfigs();
          this.applyReloadEffectStyle(this.playerReloadOrbs, this.playerReloadEffectConfig);
          this.applyReloadEffectStyle(this.botReloadOrbs, this.botReloadEffectConfig);
          this.updateReloadEffectPositions();
        };
        window.addEventListener("space-war-ships-updated", this.onShipsUpdated);
      }
    }

    const sheetTexture = this.textures.get("sheet");
    if (!sheetTexture.has("exp1_01")) {
      sheetTexture.add("exp1_01", 0, 56, 305, 52, 51);
      sheetTexture.add("exp1_02", 0, 164, 305, 52, 51);
      sheetTexture.add("exp1_03", 0, 326, 305, 52, 51);
      sheetTexture.add("exp1_04", 0, 218, 305, 52, 51);
      sheetTexture.add("exp1_05", 0, 272, 305, 52, 51);
      sheetTexture.add("exp1_06", 0, 110, 305, 52, 51);
      sheetTexture.add("exp1_07", 0, 2, 305, 52, 51);
      sheetTexture.add("exp1_08", 0, 152, 252, 52, 51);
      sheetTexture.add("exp1_09", 0, 260, 252, 52, 51);
      sheetTexture.add("exp1_10", 0, 422, 252, 52, 51);
      sheetTexture.add("exp1_11", 0, 314, 252, 52, 51);
    }

    if (!sheetTexture.has("expb_01")) {
      // Sequencia azul da linha de baixo na ordem original do spritesheet (explosion_3_01 -> 09).
      sheetTexture.add("expb_01", 0, 56, 358, 52, 51);
      sheetTexture.add("expb_02", 0, 434, 305, 52, 51);
      sheetTexture.add("expb_03", 0, 2, 358, 52, 51);
      sheetTexture.add("expb_04", 0, 2, 411, 52, 51);
      sheetTexture.add("expb_05", 0, 110, 411, 52, 51);
      sheetTexture.add("expb_06", 0, 56, 411, 52, 51);
      sheetTexture.add("expb_07", 0, 434, 358, 52, 51);
      sheetTexture.add("expb_08", 0, 380, 358, 52, 51);
      sheetTexture.add("expb_09", 0, 326, 358, 52, 51);
    }

    if (!this.anims.exists("explosion1")) {
      this.anims.create({
        key: "explosion1",
        frames: [
          { key: "sheet", frame: "exp1_01" },
          { key: "sheet", frame: "exp1_02" },
          { key: "sheet", frame: "exp1_03" },
          { key: "sheet", frame: "exp1_04" },
          { key: "sheet", frame: "exp1_05" },
          { key: "sheet", frame: "exp1_06" },
          { key: "sheet", frame: "exp1_07" },
          { key: "sheet", frame: "exp1_08" },
          { key: "sheet", frame: "exp1_09" },
          { key: "sheet", frame: "exp1_10" },
          { key: "sheet", frame: "exp1_11" },
        ],
        frameRate: 22,
        repeat: 0,
      });
    }

    if (!this.anims.exists("explosion2")) {
      this.anims.create({
        key: "explosion2",
        frames: [
          { key: "sheet", frame: "expb_01" },
          { key: "sheet", frame: "expb_02" },
          { key: "sheet", frame: "expb_03" },
          { key: "sheet", frame: "expb_04" },
          { key: "sheet", frame: "expb_05" },
          { key: "sheet", frame: "expb_06" },
          { key: "sheet", frame: "expb_07" },
          { key: "sheet", frame: "expb_08" },
          { key: "sheet", frame: "expb_09" },
        ],
        frameRate: 22,
        repeat: 0,
      });
    }

    // Botao de tiro clicavel na tela.
    const buttonBaseY = this.scale.height - 90;

    this.button = this.add
      .sprite(this.scale.width * 0.72, buttonBaseY, "shotbutton", 10)
      .setScale(2.0)
      .setDisplaySize(72, 72)
      .setInteractive();
    this.button.setAlpha(0.5);

    // Segundo botao, no lado oposto.
    this.buttonArmor = this.add
      .image(this.scale.width * 0.24, buttonBaseY, "armorButton")
      .setDisplaySize(72, 72)
      .setInteractive();

    // Terceiro botao, a direita do botao de tiro e um pouco mais acima.
    this.buttonReload = this.add
      .image(this.button.x + 122, this.button.y - 30, "reloadButton")
      .setDisplaySize(72, 72)
      .setInteractive();

    // Arma inicia sem municao e pode acumular recargas.
    this.shotsLoaded = 0;

    // Registra o frame plasma_1 dentro da textura "sheet" apenas uma vez.
    const sheetForProjectiles = this.textures.get("sheet");
    if (sheetForProjectiles && !sheetForProjectiles.has("plasma_1")) {
      sheetForProjectiles.add("plasma_1", 0, 30, 2, 6, 21);
    }

    // Tiro inicia escondido e aparece ao clicar no botao.
    this.tiro = this.physics.add
      .image(x, y - 80, "sheet", "plasma_1")
      .setScale(3.2)
      .setVisible(false);

    // Tiro do bot inicia escondido e sai do jogador superior.
    this.botTiro = this.physics.add
      .image(x, yOpposite + 80, "sheet", "plasma_1")
      .setScale(3.2)
      .setFlipY(true)
      .setVisible(false);

    // Configurar física do tiro
    this.tiro.body.setAllowGravity(false);
    this.tiro.setDisplaySize(30, 50);
    this.botTiro.body.setAllowGravity(false);
    this.botTiro.setDisplaySize(30, 50);

    // Escudo inicia escondido sobre o player.
    this.shield = this.add
      .image(
        this.player.x - this.playerShieldOffsetX,
        this.player.y - this.playerShieldOffsetY,
        "shield",
      )
      .setDisplaySize(this.playerShieldSize, this.playerShieldSize)
      .setVisible(false);

    // Escudo do bot inicia escondido sobre o player2.
    this.botShield = this.add
      .image(this.player2.x, this.player2.y + 54, "shield")
      .setDisplaySize(126, 126)
      .setVisible(false);

    // Texto de contagem regressiva no centro da tela
    this.countdownText = this.add
      .text(centerX - 4, 32, "3", {
        fontSize: this.countdownNumberSize,
        fontFamily: this.uiFontFamily,
        fill: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5);

    // Mostra apenas o número de munição ao lado direito do botão de recarga.
    this.ammoText = this.add
      .text(
        this.buttonReload.x + 58,
        this.buttonReload.y,
        `${this.shotsLoaded}`,
        {
          fontSize: "28px",
          fontFamily: this.uiFontFamily,
          fill: "#00ff00",
          fontStyle: "bold",
        },
      )
      .setOrigin(0, 0.5)
      .setDepth(35);

    // HUD de teste para visualizar a munição atual do bot.
    this.botAmmoText = this.add
      .text(14, 56, `Munição: ${this.botShotsLoaded}`, {
        fontSize: "12px",
        fontFamily: this.uiFontFamily,
        fill: "#ffcc66",
        fontStyle: "bold",
        backgroundColor: "#000000",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0, 0)
      .setAlpha(0.9)
      .setDepth(40);

    this.victoryText = this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, "", {
        fontSize: "72px",
        fontFamily: this.uiFontFamily,
        fill: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.createLivesDisplay();
    this.createReloadEffects();

    this.button.on("pointerdown", () => {
      // Impede múltiplas ações na mesma rodada
      if (this.actionExecuted) return;

      this.selectedAction = "shoot";
      this.actionExecuted = true;

      // Desabilita todos os botões até o próximo round
      this.disableAllButtons(true);
    });

    this.buttonReload.on("pointerdown", () => {
      // Impede múltiplas ações na mesma rodada
      if (this.actionExecuted) return;

      this.selectedAction = "reload";
      this.actionExecuted = true;

      // Desabilita todos os botões até o próximo round
      this.disableAllButtons(true);
    });

    this.buttonArmor.on("pointerdown", () => {
      // Impede múltiplas ações na mesma rodada
      if (this.actionExecuted) return;

      this.selectedAction = "armor";
      this.actionExecuted = true;

      // Desabilita todos os botões até o próximo round
      this.disableAllButtons(true);
    });

    // Colisão entre tiro e player2
    this.physics.add.overlap(
      this.tiro,
      this.player2,
      this.onTiroHit,
      null,
      this,
    );

    this.physics.add.overlap(
      this.botTiro,
      this.player,
      this.onBotTiroHit,
      null,
      this,
    );

    this.physics.add.overlap(
      this.tiro,
      this.botTiro,
      this.onShotsClash,
      null,
      this,
    );

    // Mostra preparação inicial e inicia a primeira rodada.
    this.showPrepareAndStartRound();
  }

  showPrepareAndStartRound() {
    this.disableAllButtons(true);
    this.countdownText.setText("Preparar...");
    this.countdownText.setFill("#00ff00");
    this.countdownText.setFontSize(this.countdownMessageSize);

    this.time.delayedCall(1000, () => {
      if (this.gameOver) return;
      this.startRound();
    });
  }

  startRound() {
    if (this.gameOver) return;

    this.roundCount += 1;
    this.updateBackgroundSpeedForRound();

    // Garante que o escudo visual e seu estado sejam resetados a cada nova rodada.
    if (this.shieldTimerEvent) {
      this.shieldTimerEvent.remove(false);
      this.shieldTimerEvent = null;
    }
    this.shieldActive = false;
    this.shield.setAlpha(1).setVisible(false);
    if (this.botShieldTimerEvent) {
      this.botShieldTimerEvent.remove(false);
      this.botShieldTimerEvent = null;
    }
    this.botShieldActive = false;
    this.botShield.setAlpha(1).setVisible(false);
    this.updateReloadEffectPositions();
    [...this.playerReloadOrbs, ...this.botReloadOrbs].forEach((orb) => {
      if (orb) {
        orb.setVisible(false).setAlpha(0).setScale(0.8);
      }
    });

    // Reseta o estado para permitir nova ação
    this.actionExecuted = false;
    this.selectedAction = null;
    this.botSelectedAction = this.botController.chooseAction({
      botShotsLoaded: this.botShotsLoaded,
      playerShotsLoaded: this.shotsLoaded,
      playerShieldActive: this.shieldActive,
      botShieldActive: this.botShieldActive,
    });

    // Habilita todos os botões
    this.enableAllButtons();

    this.roundActive = true;
    const totalRoundMs = this.getRoundDurationMs();
    let remainingMs = totalRoundMs;
    let remainingTime = this.getRoundDurationSeconds();
    this.countdownText.setText(remainingTime);
    this.countdownText.setFill("#ffff00");
    this.countdownText.setFontSize(this.countdownNumberSize);

    // Atualiza a contagem a cada segundo
    if (this.roundCountdownEvent) {
      this.roundCountdownEvent.remove(false);
      this.roundCountdownEvent = null;
    }

    this.roundCountdownEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameOver || !this.scene.isActive()) return;

        remainingMs -= 1000;
        if (remainingMs <= 0) return;

        remainingTime = Math.max(1, Math.floor(remainingMs / 1000));
        this.countdownText.setText(remainingTime);

        // Muda cor durante a contagem
        if (remainingTime === 2) {
          this.countdownText.setFill("#ff8800");
        } else if (remainingTime === 1) {
          this.countdownText.setFill("#ff0000");
        }
      },
    });

    this.time.delayedCall(totalRoundMs, () => {
      if (!this.scene || !this.scene.isActive() || this.gameOver) return;

      if (this.roundCountdownEvent) {
        this.roundCountdownEvent.remove(false);
        this.roundCountdownEvent = null;
      }

      this.roundActive = false;
      this.countdownText.setText("Ação!");
      this.countdownText.setFill("#ff0000");
      this.countdownText.setFontSize(this.countdownMessageSize);

      // Desabilita todos os botões quando a contagem termina e aplica visual inativo.
      this.disableAllButtons(true);
      this.executeRoundActions();
      this.disableAllButtons(true);

      // Aguarda 1,5 segundo com "Ação!" exibido.
      this.time.delayedCall(1500, () => {
        if (!this.scene || !this.scene.isActive() || this.gameOver) return;

        // Intervalo vazio de meio segundo antes da preparação.
        this.countdownText.setText("");

        if (this.shield.visible) {
          this.tweens.killTweensOf(this.shield);
          this.tweens.add({
            targets: this.shield,
            alpha: 0,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
              this.shieldActive = false;
              this.shield.setAlpha(1).setVisible(false);
            },
          });
        }

        if (this.botShield.visible) {
          this.tweens.killTweensOf(this.botShield);
          this.tweens.add({
            targets: this.botShield,
            alpha: 0,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
              this.botShieldActive = false;
              this.botShield.setAlpha(1).setVisible(false);
            },
          });
        }

        this.time.delayedCall(500, () => {
          if (!this.scene || !this.scene.isActive() || this.gameOver) return;
          if (this.gameOver) return;

          // Mostra mensagem de preparação antes da próxima rodada.
          this.countdownText.setText("Preparar...");
          this.countdownText.setFill("#00ff00");
          this.countdownText.setFontSize(this.countdownMessageSize);

          this.time.delayedCall(1000, () => {
            if (this.gameOver) return;
            this.startRound();
          });
        });
      });
    });
  }

  revealSelectedAction() {
    // Defines the text and color based on the selected action
    let actionName = "SEM AÇÃO";
    let actionColor = "#ffffff";

    if (this.selectedAction === "shoot") {
      actionName = "DISPARO!";
      actionColor = "#ff0000";
    } else if (this.selectedAction === "reload") {
      actionName = "RECARGA!";
      actionColor = "#00ff00";
    } else if (this.selectedAction === "armor") {
      actionName = "ESCUDO!";
      actionColor = "#0088ff";
    }

    // Exibe a ação revelada por 3 segundos
    this.revealText.setText(actionName);
    this.revealText.setFill(actionColor);
    this.revealText.setVisible(true);

    // Após 3 segundos, executa a ação
    this.time.delayedCall(3000, () => {
      if (!this.scene || !this.scene.isActive() || this.gameOver) return;

      this.revealText.setVisible(false);
      this.executeRoundActions();

      // Aguarda 500ms e inicia nova rodada
      this.time.delayedCall(500, () => {
        if (!this.scene || !this.scene.isActive() || this.gameOver) return;
        this.startRound();
      });
    });
  }

  disableAllButtons(showInactiveStyle = false) {
    this.button.disableInteractive();
    this.buttonReload.disableInteractive();
    this.buttonArmor.disableInteractive();

    if (showInactiveStyle) {
      this.button.setTint(0x808080).setAlpha(0.5);
      this.buttonReload.setTint(0x808080).setAlpha(0.5);
      this.buttonArmor.setTint(0x808080).setAlpha(0.5);
    }
  }

  onTiroHit(tiro, player2) {
    if (this.gameOver || !tiro.visible) return;

    // Tiro atinge o player2
    console.log("Colisão detectada!");

    // Para o tween do tiro
    if (this.tiroTween) {
      this.tiroTween.stop();
      this.tiroTween = null;
    }

    // Para a velocidade do tiro
    tiro.body.setVelocity(0, 0);

    // Remove o tiro imediatamente
    tiro.setVisible(false);

    if (this.botShieldActive) {
      if (this.laserBarrierSfx) {
        this.laserBarrierSfx.play({ volume: 0.3 });
      }
      return;
    }

    this.applyDamageToPlayer2(1);
  }

  onBotTiroHit(botTiro, player) {
    if (this.gameOver || !botTiro.visible) return;

    if (this.botTiroTween) {
      this.botTiroTween.stop();
      this.botTiroTween = null;
    }

    botTiro.body.setVelocity(0, 0);
    botTiro.setVisible(false);

    if (this.shieldActive) {
      if (this.laserBarrierSfx) {
        this.laserBarrierSfx.play({ volume: 0.3 });
      }
      return;
    }

    this.applyDamageToPlayer1(1);
  }

  onShotsClash(tiro, botTiro) {
    if (this.gameOver || !tiro.visible || !botTiro.visible) return;

    if (this.laserExplosionSfx) {
      this.laserExplosionSfx.play({ volume: 0.55 });
    }

    const clashX = (tiro.x + botTiro.x) * 0.5;
    const clashY = (tiro.y + botTiro.y) * 0.5;

    if (this.tiroTween) {
      this.tiroTween.stop();
      this.tiroTween = null;
    }

    if (this.botTiroTween) {
      this.botTiroTween.stop();
      this.botTiroTween = null;
    }

    tiro.body.setVelocity(0, 0);
    botTiro.body.setVelocity(0, 0);
    tiro.setVisible(false);
    botTiro.setVisible(false);

    if (this.anims.exists("explosion2")) {
      const clashExplosion = this.add
        .sprite(clashX, clashY, "sheet", "expb_01")
        .setScale(1.6)
        .setDepth(Math.max(tiro.depth, botTiro.depth) + 2);

      clashExplosion.play("explosion2");

      clashExplosion.once("animationcomplete", () => {
        clashExplosion.destroy();
      });

      this.time.delayedCall(650, () => {
        if (!this.scene || !this.scene.isActive()) return;
        if (clashExplosion && clashExplosion.active) {
          clashExplosion.destroy();
        }
      });
    }
  }

  playDamageFeedback(target) {
    if (!target || !target.visible) return;

    this.tweens.killTweensOf(target);
    target.setAlpha(1);
    
    // Guardar o tint original antes de mudá-lo
    const originalTint = target._tintTopLeft;
    const hadTint = target.isTinted;
    
    target.setTint(0xff6666);

    this.tweens.add({
      targets: target,
      alpha: 0.6,
      duration: 80,
      yoyo: true,
      repeat: 1,
      ease: "Linear",
      onComplete: () => {
        // Restaurar o tint original se a nave tinha tint
        if (hadTint && originalTint) {
          target.setTint(originalTint);
        } else {
          target.clearTint();
        }
        target.setAlpha(1);
      },
    });
  }

  applyDamageToPlayer1(amount = 1) {
    if (this.gameOver) return;

    this.player1Lives = Math.max(0, this.player1Lives - amount);
    if (this.player1Lives > 0 && this.losingLifeSfx) {
      this.losingLifeSfx.play({ volume: 0.5, rate: 1.3 });
    }
    this.playDamageFeedback(this.player);
    this.updateLivesDisplay();

    if (this.player1Lives <= 0) {
      this.handlePlayer1Defeat();
    }
  }

  applyDamageToPlayer2(amount = 1) {
    if (this.gameOver) return;

    this.player2Lives = Math.max(0, this.player2Lives - amount);
    if (this.player2Lives > 0 && this.losingLifeSfx) {
      this.losingLifeSfx.play({ volume: 0.5, rate: 1.3 });
    }
    this.playDamageFeedback(this.player2);
    this.updateLivesDisplay();

    if (this.player2Lives <= 0) {
      this.handlePlayer2Defeat();
    }
  }

  handlePlayer2Defeat() {
    this.gameOver = true;
    this.roundActive = false;

    if (this.explosionSfx) {
      this.explosionSfx.play({ volume: 0.65 });
    }

    if (this.tiroTween) {
      this.tiroTween.stop();
      this.tiroTween = null;
    }

    if (this.botTiroTween) {
      this.botTiroTween.stop();
      this.botTiroTween = null;
    }

    this.tiro.body.setVelocity(0, 0);
    this.tiro.setVisible(false);
    this.botTiro.body.setVelocity(0, 0);
    this.botTiro.setVisible(false);

    this.disableAllButtons(true);
    this.countdownText.setText("");

    this.tweens.killTweensOf(this.player2);
    this.player2.clearTint();

    const showVictory = () => {
      this.player2.setVisible(false);
      this.showEndMessageWithFade("Vitória!");
      this.scheduleReturnToMenu();
    };

    if (this.textures.exists("sheet") && this.anims.exists("explosion1")) {
      const explosion = this.add
        .sprite(
          this.player2.x,
          this.player2.y + this.player2.displayHeight * 0.5,
          "sheet",
          "exp1_01",
        )
        .setScale(2.6)
        .setDepth(this.player2.depth + 2);

      this.player2.setVisible(false);
      explosion.play("explosion1");
      explosion.once("animationcomplete", () => {
        explosion.destroy();
        showVictory();
      });

      this.time.delayedCall(900, () => {
        if (!this.scene || !this.scene.isActive()) return;
        if (explosion && explosion.active) {
          explosion.destroy();
          showVictory();
        }
      });
      return;
    }

    this.tweens.add({
      targets: this.player2,
      alpha: 0,
      scale: 1.35,
      duration: 250,
      ease: "Cubic.easeOut",
      onComplete: () => {
        showVictory();
      },
    });
  }

  handlePlayer1Defeat() {
    this.gameOver = true;
    this.roundActive = false;

    if (this.explosionSfx) {
      this.explosionSfx.play({ volume: 0.65 });
    }

    if (this.tiroTween) {
      this.tiroTween.stop();
      this.tiroTween = null;
    }

    if (this.botTiroTween) {
      this.botTiroTween.stop();
      this.botTiroTween = null;
    }

    this.tiro.body.setVelocity(0, 0);
    this.tiro.setVisible(false);
    this.botTiro.body.setVelocity(0, 0);
    this.botTiro.setVisible(false);

    this.disableAllButtons(true);
    this.countdownText.setText("");

    this.tweens.killTweensOf(this.player);
    this.player.clearTint();

    const showDefeat = () => {
      this.player.setVisible(false);
      this.showEndMessageWithFade("Derrota!", "#ff3355");
      this.scheduleReturnToMenu();
    };

    if (this.textures.exists("sheet") && this.anims.exists("explosion1")) {
      const explosion = this.add
        .sprite(
          this.player.x,
          this.player.y - this.player.displayHeight * 0.5,
          "sheet",
          "exp1_01",
        )
        .setScale(2.6)
        .setDepth(this.player.depth + 2);

      this.player.setVisible(false);
      explosion.play("explosion1");
      explosion.once("animationcomplete", () => {
        explosion.destroy();
        showDefeat();
      });

      this.time.delayedCall(900, () => {
        if (!this.scene || !this.scene.isActive()) return;
        if (explosion && explosion.active) {
          explosion.destroy();
          showDefeat();
        }
      });
      return;
    }

    this.tweens.add({
      targets: this.player,
      alpha: 0,
      scale: 1.35,
      duration: 250,
      ease: "Cubic.easeOut",
      onComplete: () => {
        showDefeat();
      },
    });
  }

  updateAmmoDisplay() {
    if (!this.ammoText || !this.ammoText.active) return;
    this.ammoText.setText(`${this.shotsLoaded}`);
  }

  createReloadEffects() {
    this.refreshReloadEffectConfigs();

    const createOrb = (config) =>
      this.add
        .sprite(0, 0, config.textureKey, config.frameKey)
        .setDisplaySize(config.displaySize, config.displaySize)
        .setVisible(false)
        .setAlpha(0)
        .setScale(config.baseScale)
        .setDepth(config.depth);

    this.playerReloadOrbs = [
      createOrb(this.playerReloadEffectConfig),
      createOrb(this.playerReloadEffectConfig),
    ];
    this.botReloadOrbs = [
      createOrb(this.botReloadEffectConfig),
      createOrb(this.botReloadEffectConfig),
    ];

    this.applyReloadEffectStyle(this.playerReloadOrbs, this.playerReloadEffectConfig);
    this.applyReloadEffectStyle(this.botReloadOrbs, this.botReloadEffectConfig);

    this.updateReloadEffectPositions();
    this.events.once("shutdown", () => {
      [...this.playerReloadOrbs, ...this.botReloadOrbs].forEach((orb) => {
        if (orb && orb.active) {
          orb.destroy();
        }
      });
      this.playerReloadOrbs = [];
      this.botReloadOrbs = [];
    });
  }

  getReloadEffectPositions(ship, config = null) {
    const offsets = config?.offsets || [];
    if (!ship || offsets.length === 0) return [];

    const baseX = ship.x;
    const baseY = ship.y;

    return offsets.map((offset) => ({
      x: baseX + offset.x,
      y: baseY + offset.y,
    }));
  }

  updateReloadEffectPositions() {
    if (this.player && this.playerReloadOrbs.length === 2) {
      const positions = this.getReloadEffectPositions(
        this.player,
        this.playerReloadEffectConfig,
      );
      this.playerReloadOrbs.forEach((orb, index) => {
        if (!orb || !orb.active || !positions[index]) return;
        orb.setPosition(positions[index].x, positions[index].y);
        orb.setDepth(this.player.depth + 2);
      });
    }

    if (this.player2 && this.botReloadOrbs.length === 2) {
      const positions = this.getReloadEffectPositions(
        this.player2,
        this.botReloadEffectConfig,
      );
      this.botReloadOrbs.forEach((orb, index) => {
        if (!orb || !orb.active || !positions[index]) return;
        orb.setPosition(positions[index].x, positions[index].y);
        orb.setDepth(this.player2.depth + 2);
      });
    }
  }

  playReloadEffect(orbs, config) {
    if (!orbs || orbs.length === 0) return;

    const effectConfig = config || this.playerReloadEffectConfig || {
      baseScale: 0.75,
      peakScale: 1.35,
      duration: 160,
      hold: 90,
      resetScale: 0.75,
    };

    orbs.forEach((orb) => {
      if (!orb) return;

      this.tweens.killTweensOf(orb);
      orb.setVisible(true).setAlpha(0).setScale(effectConfig.baseScale);

      this.tweens.add({
        targets: orb,
        alpha: { from: 0, to: 1 },
        scale: { from: effectConfig.baseScale, to: effectConfig.peakScale },
        duration: effectConfig.duration,
        ease: "Sine.easeOut",
        yoyo: true,
        hold: effectConfig.hold,
        onComplete: () => {
          orb.setVisible(false).setAlpha(0).setScale(effectConfig.resetScale);
        },
      });
    });
  }

  playPlayerReloadEffect() {
    this.updateReloadEffectPositions();
    this.playReloadEffect(this.playerReloadOrbs, this.playerReloadEffectConfig);
  }

  playBotReloadEffect() {
    this.updateReloadEffectPositions();
    this.playReloadEffect(this.botReloadOrbs, this.botReloadEffectConfig);
  }

  showShieldWithQuickFade(shield, x, y) {
    if (!shield) return;

    this.tweens.killTweensOf(shield);
    shield.setPosition(x, y).setAlpha(0).setVisible(true);

    this.tweens.add({
      targets: shield,
      alpha: 1,
      duration: 120,
      ease: "Linear",
    });
  }

  playShotFlowFromOrbs(orbs, targetX, targetY) {
    if (!orbs || orbs.length === 0) return;

    orbs.forEach((orb) => {
      if (!orb) return;

      const flowShot = this.add
        .image(orb.x, orb.y, "sheet", "plasma_1")
        .setDisplaySize(12, 18)
        .setAlpha(0.95)
        .setDepth(orb.depth + 1);

      this.tweens.add({
        targets: flowShot,
        x: targetX,
        y: targetY,
        alpha: 0.2,
        duration: 90,
        ease: "Linear",
        onComplete: () => {
          if (flowShot && flowShot.active) {
            flowShot.destroy();
          }
        },
      });
    });
  }

  showEndMessageWithFade(message, color = "#00ff88") {
    if (!this.victoryText || !this.victoryText.active) return;

    this.tweens.killTweensOf(this.victoryText);
    this.victoryText
      .setText(message)
      .setFill(color)
      .setAlpha(0)
      .setScale(0.92)
      .setVisible(true);

    this.tweens.add({
      targets: this.victoryText,
      alpha: 1,
      scale: 1,
      duration: 420,
      ease: "Quad.easeOut",
    });

    // Exibir ganho de moedas embaixo da mensagem
    const rewardAmount = window.BancoMoedas?.getLastRewardAmount?.() || 0;

    if (!this.rewardText || !this.rewardText.active) {
      this.rewardText = this.add
        .text(this.cameras.main.centerX, this.cameras.main.centerY + 80, "", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "16px",
          color: "#fff4ba",
          stroke: "#2c1a00",
          strokeThickness: 2,
          align: "center",
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setVisible(false)
        .setDepth(this.victoryText.depth + 1);
    }

    if (rewardAmount > 0) {
      this.rewardText.setText(`+ ${rewardAmount}`).setAlpha(0).setVisible(true);

      this.tweens.add({
        targets: this.rewardText,
        alpha: 1,
        duration: 500,
        ease: "Quad.easeOut",
        delay: 200,
      });

      // Adicionar ícone de moeda pequeno se existir
      if (this.textures.exists("coinIcon") && (!this.rewardCoinIcon || !this.rewardCoinIcon.active)) {
        this.rewardCoinIcon = this.add
          .image(
            this.cameras.main.centerX + 90,
            this.cameras.main.centerY + 80,
            "coinIcon",
          )
          .setOrigin(0, 0.5)
          .setDisplaySize(70, 35)
          .setAlpha(0)
          .setVisible(false)
          .setDepth(this.victoryText.depth + 1)
          .setScrollFactor(0);
      }

      if (this.textures.exists("coinIcon")) {
        this.rewardCoinIcon.setAlpha(0).setVisible(true);

        this.tweens.add({
          targets: this.rewardCoinIcon,
          alpha: 1,
          duration: 500,
          ease: "Quad.easeOut",
          delay: 200,
        });
      }
    }
  }

  scheduleReturnToMenu(delayMs = 4000) {
    if (this.returnToMenuScheduled) return;

    this.returnToMenuScheduled = true;
    this.returnToMenuEvent = this.time.delayedCall(delayMs, () => {
      if (!this.scene || !this.scene.isActive()) return;

      const goToMenu = () => {
        if (!this.scene || !this.scene.isActive()) return;
        if (this.gameMusic && this.gameMusic.isPlaying) {
          this.gameMusic.stop();
        }
        this.scene.start("telainicial");
      };

      if (this.cameras && this.cameras.main) {
        this.cameras.main.once("camerafadeoutcomplete", goToMenu);
        this.cameras.main.fadeOut(550, 0, 0, 0);
        return;
      }

      goToMenu();
    });
  }

  updateBotAmmoDisplay() {
    if (!this.botAmmoText || !this.botAmmoText.active) return;
    this.botAmmoText.setText(`Munição: ${this.botShotsLoaded}`);
  }

  createLivesDisplay() {
    const heartSize = 30;

    for (let i = 0; i < 3; i += 1) {
      const p1Heart = this.add
        .image(0, 0, "heart")
        .setDisplaySize(heartSize, heartSize)
        .setScrollFactor(0)
        .setDepth(30);
      this.player1Hearts.push(p1Heart);

      const p2Heart = this.add
        .image(0, 0, "heart")
        .setDisplaySize(heartSize, heartSize)
        .setScrollFactor(0)
        .setDepth(30);
      this.player2Hearts.push(p2Heart);
    }

    this.positionLivesDisplay();
    this.updateLivesDisplay();
  }

  positionLivesDisplay() {
    if (!this.player || this.player1Hearts.length === 0) return;

    const heartSpacing = 24;
    const p1StartX = 24;
    const p1Y = this.scale.height - 28;

    this.player1Hearts.forEach((heart, index) => {
      heart.setPosition(p1StartX + index * heartSpacing, p1Y);
    });

    const p2StartX = 24;
    const p2Y = 28;
    this.player2Hearts.forEach((heart, index) => {
      heart.setPosition(p2StartX + index * heartSpacing, p2Y);
    });

    if (this.botAmmoText) {
      this.botAmmoText.setPosition(p2StartX - 10, p2Y + 22);
    }
  }

  updateLivesDisplay() {
    this.player1Hearts.forEach((heart, index) => {
      heart.setVisible(index < this.player1Lives);
    });

    this.player2Hearts.forEach((heart, index) => {
      heart.setVisible(index < this.player2Lives);
    });
  }

  enableAllButtons() {
    if (!this.button || !this.buttonReload || !this.buttonArmor) return;
    if (!this.button.active || !this.buttonReload.active || !this.buttonArmor.active) return;

    this.button.setInteractive();
    this.buttonReload.setInteractive();
    this.buttonArmor.setInteractive();

    // Remove estilo de inativo da fase de resolução da rodada.
    this.button.clearTint();
    this.buttonReload.clearTint();
    this.buttonArmor.clearTint();

    // Reseta cores dos botões
    this.button.setAlpha(this.shotsLoaded > 0 ? 1 : 0.5);
    this.buttonReload.setAlpha(1);
    this.buttonArmor.setAlpha(1);
  }

  executeRoundActions() {
    this.executePlayerAction();
    this.executeBotAction();
  }

  executePlayerAction() {
    if (!this.player || !this.player.active || !this.tiro || !this.tiro.active) return;

    // Executa apenas a ação selecionada
    if (!this.selectedAction) return;

    if (this.selectedAction === "shoot") {
      // So permite tiro se houver ao menos uma carga acumulada.
      if (this.shotsLoaded > 0 && !this.tiro.visible) {
        this.updateReloadEffectPositions();
        this.playShotFlowFromOrbs(
          this.playerReloadOrbs,
          this.player.x,
          this.player.y - 80,
        );

        // Consome 1 carga a cada disparo.
        this.shotsLoaded -= 1;
        this.updateAmmoDisplay();
        this.button.setAlpha(this.shotsLoaded > 0 ? 1 : 0.5);
        this.buttonReload.setAlpha(1);

        this.laser.play({ volume: 0.5 });

        this.tiro
          .setPosition(this.player.x, this.player.y - 80)
          .setVisible(true);

        // Definir velocidade do tiro para cima (negativo = para cima)
        this.tiro.body.setVelocity(0, -500);

        // Para qualquer tween anterior do tiro
        if (this.tiroTween) {
          this.tiroTween.stop();
        }

        // Move o tiro para cima e esconde ao terminar.
        this.tiroTween = this.tweens.add({
          targets: this.tiro,
          y: -30,
          duration: 1500,
          ease: "Linear",
          onComplete: () => {
            this.tiro.body.setVelocity(0, 0);
            this.tiro.setVisible(false);
          },
        });
      }
    } else if (this.selectedAction === "reload") {
      // Cada ação de recarga acumula 1 tiro disponivel.
      this.shotsLoaded += 1;
      this.updateAmmoDisplay();
      this.button.setAlpha(1);
      this.buttonReload.setAlpha(0.6);
      this.playPlayerReloadEffect();
      if (this.fullReloadSfx) {
        this.fullReloadSfx.play({ volume: 0.45, rate: 1.5 });
      }
    } else if (this.selectedAction === "armor") {
      // Ativa o escudo
      this.shieldActive = true;
      if (this.shieldSfx) {
        this.shieldSfx.play({ volume: 0.45 });
      }
      this.showShieldWithQuickFade(
        this.shield,
        this.player.x - this.playerShieldOffsetX,
        this.player.y - this.playerShieldOffsetY,
      );

      // Evita múltiplos timers concorrentes do escudo.
      if (this.shieldTimerEvent) {
        this.shieldTimerEvent.remove(false);
      }

      // Desativa o escudo após 2,5 segundos
      this.shieldTimerEvent = this.time.delayedCall(2500, () => {
        if (!this.scene || !this.scene.isActive() || this.gameOver) return;
        this.shieldActive = false;
        this.shield.setVisible(false);
        this.shieldTimerEvent = null;
      });
    }
  }

  executeBotAction() {
    if (!this.player2 || !this.player2.active || !this.botTiro || !this.botTiro.active) return;

    if (!this.botSelectedAction) return;

    if (this.botSelectedAction === "shoot") {
      if (this.botShotsLoaded > 0 && !this.botTiro.visible) {
        this.updateReloadEffectPositions();
        this.playShotFlowFromOrbs(
          this.botReloadOrbs,
          this.player2.x,
          this.player2.y + 80,
        );

        this.botShotsLoaded -= 1;
        this.updateBotAmmoDisplay();

        this.laser.play({ volume: 0.5 });

        this.botTiro
          .setPosition(this.player2.x, this.player2.y + 80)
          .setVisible(true);

        this.botTiro.body.setVelocity(0, 500);

        if (this.botTiroTween) {
          this.botTiroTween.stop();
        }

        this.botTiroTween = this.tweens.add({
          targets: this.botTiro,
          y: this.scale.height + 30,
          duration: 1500,
          ease: "Linear",
          onComplete: () => {
            this.botTiro.body.setVelocity(0, 0);
            this.botTiro.setVisible(false);
          },
        });
      }
    } else if (this.botSelectedAction === "reload") {
      this.botShotsLoaded += 1;
      this.updateBotAmmoDisplay();
      this.playBotReloadEffect();
      if (this.fullReloadSfx) {
        this.fullReloadSfx.play({ volume: 0.45, rate: 1.5 });
      }
    } else if (this.botSelectedAction === "armor") {
      this.botShieldActive = true;
      if (this.shieldSfx) {
        this.shieldSfx.play({ volume: 0.45 });
      }
      this.showShieldWithQuickFade(
        this.botShield,
        this.player2.x,
        this.player2.y + 54,
      );

      if (this.botShieldTimerEvent) {
        this.botShieldTimerEvent.remove(false);
      }

      this.botShieldTimerEvent = this.time.delayedCall(2500, () => {
        if (!this.scene || !this.scene.isActive() || this.gameOver) return;
        this.botShieldActive = false;
        this.botShield.setVisible(false);
        this.botShieldTimerEvent = null;
      });
    }
  }

  update() {
    if (!this.scene || !this.scene.isActive()) return;

    if (this.shield && this.player) {
      this.shield.setPosition(
        this.player.x - this.playerShieldOffsetX,
        this.player.y - this.playerShieldOffsetY,
      );
    }

    if (this.botShield && this.player2) {
      this.botShield.setPosition(this.player2.x, this.player2.y + 54);
    }

    this.updateReloadEffectPositions();

    this.positionLivesDisplay();

    if (!this.background) return;

    if (this.backgroundMaxX <= this.backgroundMinX) return;

    this.background.tilePositionX +=
      this.backgroundSpeed * this.backgroundDirection;

    if (this.background.tilePositionX >= this.backgroundMaxX) {
      this.background.tilePositionX = this.backgroundMaxX;
      this.backgroundDirection = -1;
    } else if (this.background.tilePositionX <= this.backgroundMinX) {
      this.background.tilePositionX = this.backgroundMinX;
      this.backgroundDirection = 1;
    }
  }
}

export default scene0;
