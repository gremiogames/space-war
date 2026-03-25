class scene0 extends Phaser.Scene {
  constructor() {
    super("scene0");

    this.background;
    this.backgroundSpeed = 0.25;
    this.backgroundDirection = 1;
    this.backgroundMinX = 0;
    this.backgroundMaxX = 0;
    this.player;
    this.playerShadow;
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

    // Sistema de contagem regressiva
    this.roundActive = false;
    this.roundTimer = 3000; // 3 segundos em milissegundos
    this.roundCount = 0;
    // Ajuste de progressão de tensão por rodada (edite estes valores livremente).
    this.roundThresholds = {
      to4sAtRound: 1,
      to3sAtRound: 7,
      to2sAtRound: 19,
      to1sAtRound: 29,
    };
    this.mapSpeedByPhase = {
      phase5s: 0.29,
      phase4s: 0.38,
      phase3s: 0.72,
      phase2s: 1.2,
      phase1s: 1.6,
    };
    this.countdownText;
    this.actionExecuted = false; // Controla se uma ação foi executada nesta rodada
    this.selectedAction = null; // Armazena qual ação foi selecionada
  }

  getRoundDurationSeconds() {
    if (this.roundCount >= this.roundThresholds.to1sAtRound) return 1;
    if (this.roundCount >= this.roundThresholds.to2sAtRound) return 2;
    if (this.roundCount >= this.roundThresholds.to3sAtRound) return 3;
    if (this.roundCount >= this.roundThresholds.to4sAtRound) return 4;
    return 4;
  }

  getRoundDurationMs() {
    if (this.roundCount >= this.roundThresholds.to1sAtRound) return 1500;
    return this.getRoundDurationSeconds() * 1000;
  }

  updateBackgroundSpeedForRound() {
    if (this.roundCount >= this.roundThresholds.to1sAtRound) {
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
  }

  create() {
    const x = this.scale.width / 2;
    const y = this.scale.height - 75;
    const yOpposite = 75;
    const playerScale = 1.15;

    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "backgroundMap")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-10);

    const mapZoomOut = 0.85;
    this.background.tileScaleX = mapZoomOut;
    this.background.tileScaleY = mapZoomOut;

    const mapTexture = this.textures.get("backgroundMap").getSourceImage();
    const visibleMapWidth = this.scale.width / this.background.tileScaleX;
    const visibleMapHeight = this.scale.height / this.background.tileScaleY;
    const mapOffsetX = Math.max(0, (mapTexture.width - visibleMapWidth) / 2);
    const mapOffsetY = Math.max(0, (mapTexture.height - visibleMapHeight) / 2);
    const mapOffsetYExtra = 0;
    this.backgroundMinX = 0;
    this.backgroundMaxX = Math.max(0, mapTexture.width - visibleMapWidth);
    this.background.tilePositionX = mapOffsetX;
    this.background.tilePositionY = mapOffsetY + mapOffsetYExtra;

    this.laser = this.sound.add("laser");

    this.player = this.physics.add
      .sprite(x, y, "player1")
      .setScale(playerScale)
      .setOrigin(0.5, 1)
      .setImmovable(true);

    this.player.body.setAllowGravity(false);

    // Registra o frame da sombra do jogador 1 dentro da textura "sheet".
    this.textures.get("sheet").add("player_shadow_m", 0, 68, 675, 64, 64);

    // Sombra apenas do jogador 1.
    this.playerShadow = this.add
      .image(this.player.x, this.player.y - 12, "sheet", "player_shadow_m")
      .setScale(playerScale * 1.02)
      .setAlpha(0.35)
      .setDepth(this.player.depth - 1);

    this.player2 = this.physics.add
      .sprite(x, yOpposite, "player2")
      .setScale(playerScale)
      .setOrigin(0.5, 0)
      .setImmovable(true);

    this.player2.body.setAllowGravity(false);

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

    // Botao de tiro clicavel na tela.
    this.button = this.add
      .sprite(580, 500, "shotbutton", 10)
      .setScale(2.0)
      .setDisplaySize(72, 72)
      .setInteractive();
    this.button.setAlpha(0.5);

    // Segundo botao, no lado oposto.
    this.buttonArmor = this.add
      .image(200, 500, "armorButton")
      .setDisplaySize(72, 72)
      .setInteractive();

    // Terceiro botao, a direita do botao de tiro e um pouco mais acima.
    this.buttonReload = this.add
      .image(this.button.x + 100, this.button.y - 30, "reloadButton")
      .setDisplaySize(72, 72)
      .setInteractive();

    // Arma inicia sem municao e pode acumular recargas.
    this.shotsLoaded = 0;

    // Registra o frame plasma_1 dentro da textura "sheet".
    this.textures.get("sheet").add("plasma_1", 0, 30, 2, 6, 21);

    // Tiro inicia escondido e aparece ao clicar no botao.
    this.tiro = this.physics.add
      .image(x, y - 80, "sheet", "plasma_1")
      .setScale(3.2)
      .setVisible(false);

    // Configurar física do tiro
    this.tiro.body.setAllowGravity(false);
    this.tiro.setDisplaySize(30, 50);

    // Escudo inicia escondido sobre o player.
    this.shield = this.add
      .image(this.player.x, this.player.y - 35, "shield")
      .setDisplaySize(110, 110)
      .setVisible(false);

    // Texto de contagem regressiva no centro da tela
    this.countdownText = this.add
      .text(x, 50, "3", {
        fontSize: this.countdownNumberSize,
        fontFamily: this.uiFontFamily,
        fill: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5);

    // Texto contador de munição no canto superior direito
    this.ammoText = this.add
      .text(this.scale.width - 30, 30, `Munição: ${this.shotsLoaded}`, {
        fontSize: "24px",
        fontFamily: this.uiFontFamily,
        fill: "#ffff00",
        fontStyle: "bold",
        backgroundColor: "#000000",
        padding: { x: 15, y: 10 },
      })
      .setOrigin(1, 0);

    this.victoryText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "", {
        fontSize: "72px",
        fontFamily: this.uiFontFamily,
        fill: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.createLivesDisplay();

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

    // Reseta o estado para permitir nova ação
    this.actionExecuted = false;
    this.selectedAction = null;

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
    const interval = setInterval(() => {
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
    }, 1000);

    this.time.delayedCall(totalRoundMs, () => {
      clearInterval(interval);
      this.roundActive = false;
      this.countdownText.setText("Ação!");
      this.countdownText.setFill("#ff0000");
      this.countdownText.setFontSize(this.countdownMessageSize);

      // Desabilita todos os botões quando a contagem termina e aplica visual inativo.
      this.disableAllButtons(true);
      this.executeAction();
      this.disableAllButtons(true);

      // Aguarda 1,5 segundo com "Ação!" exibido.
      this.time.delayedCall(1500, () => {
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

        this.time.delayedCall(500, () => {
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
      this.revealText.setVisible(false);
      this.executeAction();

      // Aguarda 500ms e inicia nova rodada
      this.time.delayedCall(500, () => {
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

    this.applyDamageToPlayer2(1);
  }

  playDamageFeedback(target) {
    if (!target || !target.visible) return;

    this.tweens.killTweensOf(target);
    target.setAlpha(1);
    target.setTint(0xff6666);

    this.tweens.add({
      targets: target,
      alpha: 0.6,
      duration: 80,
      yoyo: true,
      repeat: 1,
      ease: "Linear",
      onComplete: () => {
        target.clearTint();
        target.setAlpha(1);
      },
    });
  }

  applyDamageToPlayer1(amount = 1) {
    if (this.gameOver) return;

    this.player1Lives = Math.max(0, this.player1Lives - amount);
    this.playDamageFeedback(this.player);
    this.updateLivesDisplay();
  }

  applyDamageToPlayer2(amount = 1) {
    if (this.gameOver) return;

    this.player2Lives = Math.max(0, this.player2Lives - amount);
    this.playDamageFeedback(this.player2);
    this.updateLivesDisplay();

    if (this.player2Lives <= 0) {
      this.handlePlayer2Defeat();
    }
  }

  handlePlayer2Defeat() {
    this.gameOver = true;
    this.roundActive = false;

    if (this.tiroTween) {
      this.tiroTween.stop();
      this.tiroTween = null;
    }

    this.tiro.body.setVelocity(0, 0);
    this.tiro.setVisible(false);

    this.disableAllButtons(true);
    this.countdownText.setText("");

    this.tweens.killTweensOf(this.player2);
    this.player2.clearTint();

    const showVictory = () => {
      this.player2.setVisible(false);
      this.victoryText.setText("Vitória!").setVisible(true);
    };

    if (this.textures.exists("sheet") && this.anims.exists("explosion1")) {
      const explosion = this.add
        .sprite(
          this.player2.x,
          this.player2.y + this.player2.displayHeight * 0.5,
          "sheet",
          "exp1_01",
        )
        .setScale(2.2)
        .setDepth(this.player2.depth + 2);

      this.player2.setVisible(false);
      explosion.play("explosion1");
      explosion.once("animationcomplete", () => {
        explosion.destroy();
        showVictory();
      });

      this.time.delayedCall(900, () => {
        if (explosion.active) {
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

  updateAmmoDisplay() {
    this.ammoText.setText(`Munição: ${this.shotsLoaded}`);
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

  executeAction() {
    // Executa apenas a ação selecionada
    if (!this.selectedAction) return;

    if (this.selectedAction === "shoot") {
      // So permite tiro se houver ao menos uma carga acumulada.
      if (this.shotsLoaded > 0 && !this.tiro.visible) {
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
    } else if (this.selectedAction === "armor") {
      // Ativa o escudo
      this.shieldActive = true;
      this.shield
        .setPosition(this.player.x, this.player.y - 35)
        .setAlpha(1)
        .setVisible(true);

      // Evita múltiplos timers concorrentes do escudo.
      if (this.shieldTimerEvent) {
        this.shieldTimerEvent.remove(false);
      }

      // Desativa o escudo após 2,5 segundos
      this.shieldTimerEvent = this.time.delayedCall(2500, () => {
        this.shieldActive = false;
        this.shield.setVisible(false);
        this.shieldTimerEvent = null;
      });
    }
  }

  update() {
    if (this.playerShadow && this.player) {
      this.playerShadow.setPosition(this.player.x, this.player.y - 12);
    }

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
