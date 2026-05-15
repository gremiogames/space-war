class preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  init() {
    this.add.image(400, 225, "start-background");

    this.add.rectangle(400, 300, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(400 - 230, 300, 4, 28, 0xffffff);

    this.load.on("progress", (progress) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets/");

    this.load.font("pixelify-sans", "pixelify-sans.ttf");

    this.load.image("room-background", "room-background.png");

    this.load.image("backgroundMap", "Mapa3.png");
    this.load.spritesheet("player1", "player_b_m.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("player2", "Alien-Frigrate(3).png", {
      frameWidth: 64,
      frameHeight: 64,
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
    this.scene.stop("preloader");
    if (this.game.room) {
      this.scene.start("player");
    } else {
      this.scene.start("room");
    }
  }
}

export default preloader;
