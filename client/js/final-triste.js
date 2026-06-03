/*global Phaser*/
/*eslint no-undef: "error"*/
export default class finalTriste extends Phaser.Scene {
  constructor() {
    super("finalTriste");
  }

  create() {
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.scene.start("telainicial");
      },
      callbackScope: this,
    });
  }
}
