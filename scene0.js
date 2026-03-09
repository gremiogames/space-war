class scene0 extends Phaser.scene0 {
  constructor() {
    super("scene0");
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png",
      {
        frameWidth: 32,
        frameHeight: 48,
      });
  }
  
 create() { }

 update() { }
}

export default scene0;