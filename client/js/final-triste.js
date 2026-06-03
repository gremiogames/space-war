/*global Phaser*/
/*eslint no-undef: "error"*/
export default class finalTriste extends Phaser.Scene {
  constructor() {
    super("finalTriste");
  }
  
  create() {
    // Volta para a tela inicial após 5 segundos
    this.time.delayedCall(5000, () => {
      this.scene.start("telainicial");
    });
  }
}
