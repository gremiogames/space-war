class scene0 extends Phaser.Scene {
  constructor() {
    super("scene0");

    this.background;
    this.backgroundSpeed = 0.25;
    this.player;
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
    this.score = 0;
    this.gameOver = false;
    this.scoreText;
    this.ammoText;

    // Sistema de contagem regressiva
    this.roundActive = false;
    this.roundTimer = 3000; // 3 segundos em milissegundos
    this.countdownText;
    this.actionExecuted = false; // Controla se uma ação foi executada nesta rodada
    this.selectedAction = null; // Armazena qual ação foi selecionada
  }

  preload() {
    this.load.image("backgroundMap", "assets/map-assets/MapaImagem.png");

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

    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "backgroundMap")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-10);

    const mapZoomOut = 0.8;
    this.background.tileScaleX = mapZoomOut;
    this.background.tileScaleY = mapZoomOut;

    const mapTexture = this.textures.get("backgroundMap").getSourceImage();
    const visibleMapWidth = this.scale.width / this.background.tileScaleX;
    const visibleMapHeight = this.scale.height / this.background.tileScaleY;
    const mapOffsetX = Math.max(0, (mapTexture.width - visibleMapWidth) / 2);
    const mapOffsetY = Math.max(0, (mapTexture.height - visibleMapHeight) / 2);
    const mapOffsetYExtra = 10;
    this.background.tilePositionX = mapOffsetX;
    this.background.tilePositionY = mapOffsetY + mapOffsetYExtra;

    this.laser = this.sound.add("laser");

    this.player = this.physics.add
      .sprite(x, y, "player1")
      .setOrigin(0.5, 1)
      .setImmovable(true);

    this.player.body.setAllowGravity(false);

    this.player2 = this.physics.add
      .sprite(x, yOpposite, "player2")
      .setOrigin(0.5, 0)
      .setImmovable(true);

    this.player2.body.setAllowGravity(false);

    // Botao de tiro clicavel na tela.
    this.button = this.add
      .sprite(600, 500, "shotbutton", 10)
      .setScale(2.0)
      .setDisplaySize(64, 64)
      .setInteractive();
    this.button.setAlpha(0.5);

    // Segundo botao, no lado oposto.
    this.buttonArmor = this.add
      .image(200, 500, "armorButton")
      .setDisplaySize(64, 64)
      .setInteractive();

    // Terceiro botao, a direita do botao de tiro e um pouco mais acima.
    this.buttonReload = this.add
      .image(this.button.x + 100, this.button.y - 30, "reloadButton")
      .setDisplaySize(64, 64)
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
        fontSize: "64px",
        fill: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5);

    // Texto contador de munição no canto superior direito
    this.ammoText = this.add
      .text(this.scale.width - 30, 30, `Munição: ${this.shotsLoaded}`, {
        fontSize: "24px",
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
      this.disableAllButtons();
      this.button.setAlpha(0.3); // Feedback visual de selecionado
    });

    this.buttonReload.on("pointerdown", () => {
      // Impede múltiplas ações na mesma rodada
      if (this.actionExecuted) return;

      this.selectedAction = "reload";
      this.actionExecuted = true;

      // Desabilita todos os botões até o próximo round
      this.disableAllButtons();
      this.buttonReload.setAlpha(0.3); // Feedback visual de selecionado
    });

    this.buttonArmor.on("pointerdown", () => {
      // Impede múltiplas ações na mesma rodada
      if (this.actionExecuted) return;

      this.selectedAction = "armor";
      this.actionExecuted = true;

      // Desabilita todos os botões até o próximo round
      this.disableAllButtons();
      this.buttonArmor.setAlpha(0.3); // Feedback visual de selecionado
    });

    // Colisão entre tiro e player2
    this.physics.add.overlap(this.tiro, this.player2, this.onTiroHit, null, this);

    // Inicia a primeira rodada
    this.startRound();
  }

  startRound() {
    // Reseta o estado para permitir nova ação
    this.actionExecuted = false;
    this.selectedAction = null;

    // Habilita todos os botões
    this.enableAllButtons();

    this.roundActive = true;
    let remainingTime = 3;
    this.countdownText.setText(remainingTime);
    this.countdownText.setFill("#ffff00");

    // Atualiza a contagem a cada segundo
    const interval = setInterval(() => {
      remainingTime--;
      this.countdownText.setText(remainingTime);

      // Muda cor durante a contagem
      if (remainingTime === 2) {
        this.countdownText.setFill("#ff8800");
      } else if (remainingTime === 1) {
        this.countdownText.setFill("#ff0000");
      }

      if (remainingTime <= 0) {
        clearInterval(interval);
        this.roundActive = false;
        this.countdownText.setText("!");
        this.countdownText.setFill("#ff0000");

        // Desabilita todos os botões quando a contagem termina
        this.disableAllButtons();
        this.executeAction();

        // Aguarda 2 segundos com o "!" exibido antes de executar a ação
        this.time.delayedCall(2000, () => {
          // Executa a ação selecionada após os 2 segundos

          // Aguarda 500ms e inicia nova rodada
          this.time.delayedCall(500, () => {
            this.startRound();
          });
        });
      }
    }, 1000);
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

  disableAllButtons() {
    this.button.disableInteractive();
    this.buttonReload.disableInteractive();
    this.buttonArmor.disableInteractive();
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

    // Esconde o escudo do player2 se estiver ativo
    if (this.shield.visible) {
      this.shield.setVisible(false);
    }
  }

  updateAmmoDisplay() {
    this.ammoText.setText(`Munição: ${this.shotsLoaded}`);
  }

  enableAllButtons() {
    this.button.setInteractive();
    this.buttonReload.setInteractive();
    this.buttonArmor.setInteractive();

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

        this.tiro.setPosition(this.player.x, this.player.y - 80).setVisible(true);

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
      this.shield
        .setPosition(this.player.x, this.player.y - 35)
        .setVisible(true);

      // Desativa o escudo após 2 segundos
      this.time.delayedCall(2000, () => {
        this.shield.setVisible(false);
      });
    }
  }

  update() {
    if (!this.background) return;

    this.background.tilePositionX += this.backgroundSpeed;
  }
}

export default scene0;
