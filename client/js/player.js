class player extends Phaser.Scene {
  constructor() {
    super("player");
  }

  create() {
    this.add.image(400, 225, "start-background").postFX.addBlur(5);

    this.add
      .text(400, 50, "Escolha seu personagem:", {
        fontFamily: "pixelify-sans",
        fontSize: "64px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.anims.create({
      key: "android",
      frames: this.anims.generateFrameNumbers("android", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "character",
      frames: this.anims.generateFrameNumbers("character", {
        start: 8,
        end: 15,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.android = this.add
      .sprite(300, 225, "android")
      .setScale(3)
      .setInteractive()
      .on("pointerdown", () => {
        console.log("Android player selected");
        this.game.localPlayer = "android";
        this.game.socket.emit(
          "select-player",
          this.game.room,
          this.game.localPlayer,
        );
        this.scene.stop("player");
        this.scene.start("scene0");
      });
    this.android.play("android");

    this.character = this.add
      .sprite(550, 225, "character")
      .setScale(3)
      .setInteractive()
      .on("pointerdown", () => {
        console.log("Character player selected");
        this.game.localPlayer = "character";
        this.game.socket.emit(
          "select-player",
          this.game.room,
          this.game.localPlayer,
        );
        this.scene.stop("player");
        this.scene.start("scene0");
      });
    this.character.play("character");
  }
}

export default player;
