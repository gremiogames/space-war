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
    this.uiFontFamily = "Trebuchet MS, sans-serif";
    this.countdownNumberSize = "64px";
    this.countdownMessageSize = "48px";

    // Sistema de contagem regressiva
    this.roundActive = false;
    this.roundTimer = 3000; // 3 segundos em milissegundos
    this.roundCount = 0;
    // Ajuste de progressão de tensão por rodada (edite estes valores livremente).
    this.roundThresholds = {
      to4sAtRound: 5,
      to3sAtRound: 9,
      to2sAtRound: 20,
      to1sAtRound: 36,
    };
    this.mapSpeedByPhase = {
      phase5s: 0.27,
      phase4s: 0.4,
      phase3s: 0.7,
      phase2s: 1.0,
      phase1s: 1.5,
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
    return 5;
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
      this.backgroundSpeed = this.mapSpeedByPhase.phase5s;
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

    this.load.image("sheet", "assets/map-assets/spritesheet.png");

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
      this.startRound();
    });
  }

  startRound() {
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
          // Mostra mensagem de preparação antes da próxima rodada.
          this.countdownText.setText("Preparar...");
          this.countdownText.setFill("#00ff00");
          this.countdownText.setFontSize(this.countdownMessageSize);

          this.time.delayedCall(1000, () => {
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
  }

  updateAmmoDisplay() {
    this.ammoText.setText(`Munição: ${this.shotsLoaded}`);
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
        this.tiro.body.setVelocity(0, -400);

        // Para qualquer tween anterior do tiro
        if (this.tiroTween) {
          this.tiroTween.stop();
        }

        // Move o tiro para cima e esconde ao terminar.
        this.tiroTween = this.tweens.add({
          targets: this.tiro,
          y: -30,
          duration: 2000,
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
