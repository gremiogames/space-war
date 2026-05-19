class preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  init() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000)
      .setDepth(-1);

    this.add
      .rectangle(width / 2, height / 2 + 75, 468, 32)
      .setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(
      width / 2 - 230,
      height / 2 + 75,
      4,
      28,
      0xffffff,
    );

    this.load.on("progress", (progress) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets/");

    this.load.image("room-background", "room-background.png");

    this.load.image("backgroundMap", "map-assets/Mapa3.png");
    this.load.spritesheet("player1", "player_b_m.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("player2", "Alien-Frigate(3).png", {
      frameWidth: 110,
      frameHeight: 110,
    });
    this.load.spritesheet("shotbutton", "Enemy_Destroy_Bonus.png", {
      frameWidth: 300,
      frameHeight: 300,
    });

    this.load.image("armorButton", "Armor_Bonus.png");

    this.load.image("reloadButton", "Damage_Bonus.png");

    this.load.image("shield", "spr_shield.png");
    this.load.image("heart", "HEART 1.png");

    this.load.image("sheet", "map-assets/spritesheet.png");

    this.load.audio("laser", "efeitolaser.mp3");
    this.load.audio("fullReload", "reloadcharge.mp3");
    this.load.audio(
      "shieldSfx",
      "freesound_community-analog-lazer-fx-87122.mp3",
    );
    this.load.audio("explosionSfx", "explosao.mp3");
    this.load.audio("laserExplosionSfx", "laserexplosao.mp3");
    this.load.audio("laserBarrierSfx", "laserbarrier.mp3");
    this.load.audio("losingLifeSfx", "losinglife.mp3");
    this.load.audio("gameMusic", "musicajogo.mp3");
  }

  create() {
    this.scene.stop("preloader");

    /*
    if (this.game.offlineMode) {
      this.game.offlineMode = false;
      this.scene.start("scene0");
      return;
    }
    */

    if (this.game.room) {
      this.scene.start("player");
    } else {
      this.scene.start("room");
    }
  }
}

export default preloader;
