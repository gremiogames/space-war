class scene0 extends Phaser.Scene {
  constructor() {
    super("scene0");

    this.player;
    this.player2;
    this.stars;
    this.bombs;
    this.platforms;
    this.cursors;
    this.button;
    this.buttonArmor;
    this.tiro;
    this.shield;
    this.score = 0;
    this.gameOver = false;
    this.scoreText;
  }

  preload() {
    this.load.spritesheet("player1", "assets/player_b_m.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("player2", "assets/Alien-Frigate(3).png", {
      frameWidth: 90,
      frameHeight: 90,
    });

    this.load.spritesheet("shotbutton", "assets/Enemy_Destroy_Bonus.png", {
      frameWidth: 300,
      frameHeight: 300,
    });

    this.load.image("armorButton", "assets/Armor_Bonus.png");
    this.load.image("shield", "assets/spr_shield.png");

    this.load.image(
      "sheet",
      "assets/game-assets/Personagem/SpaceRage/SpaceRage/spritesheet.png",
    );

    this.load.audio("laser", "assets/efeitolaser.mp3");
  }

  create() {
    const x = this.scale.width / 2;
    const y = this.scale.height - 75;
    const yOpposite = 75;

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

    // Segundo botao, no lado oposto.
    this.buttonArmor = this.add
      .image(200, 500, "armorButton")
      .setDisplaySize(64, 64)
      .setInteractive();

    // Registra o frame plasma_1 dentro da textura "sheet".
    this.textures.get("sheet").add("plasma_1", 0, 30, 2, 6, 21);

    // Tiro inicia escondido e aparece ao clicar no botao.
    this.tiro = this.add
      .image(x, y - 80, "sheet", "plasma_1")
      .setScale(3.2)
      .setVisible(false);

    // Escudo inicia escondido sobre o player.
    this.shield = this.add
      .image(this.player.x, this.player.y - 35, "shield")
      .setDisplaySize(110, 110)
      .setVisible(false);

    this.button.on("pointerdown", () => {
      // Evita dois tiros ao mesmo tempo.
      if (this.tiro.visible) return;

      this.laser.play({ volume: 0.5 });

      this.tiro.setPosition(this.player.x, this.player.y - 80).setVisible(true);

      // Move o tiro para cima e esconde ao terminar.
      this.tweens.add({
        targets: this.tiro,
        y: -30,
        duration: 800,
        ease: "Linear",
        onComplete: () => {
          this.tiro.setVisible(false);
        },
      });
    });

    this.buttonArmor.on("pointerdown", () => {
      this.shield.setPosition(this.player.x, this.player.y - 35).setVisible(true);
    });
  }
}

export default scene0;
