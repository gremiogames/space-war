class Tutorial extends Phaser.Scene {
  constructor() {
    super("tutorial");
    this.backButton = null;
    this.menuMusic = null;
    this.tutorialText = null;
    this.tutorialReloadIcon = null;
    this.tutorialHeartIcon = null;
    this.tutorialShootIcon = null;
    this.tutorialShieldIcon = null;
    this.tutorialNextButton = null;
    this.tutorialNextText = null;
    this.tutorialStepIndex = 0;
    this.tutorialSteps = [];
  }

  preload() {
    this.load.image("tutorialReloadButton", "assets/Damage_Bonus.png");
    this.load.image("tutorialHeart", "assets/HEART 1.png");
    this.load.image("tutorialShootButton", "assets/Enemy_Destroy_Bonus.png");
    this.load.image("tutorialShield", "assets/Armor_Bonus.png");
    this.load.audio("menuMusic", "assets/musicamenu.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const pixelFont = '"Press Start 2P", monospace';
    const textFont = "Arial, sans-serif";

    // Obter música existente do menu ao invés de criar nova
    this.menuMusic = this.sound.get("menuMusic");
    if (!this.menuMusic) {
      this.menuMusic = this.sound.add("menuMusic", {
        loop: true,
        volume: 0.35,
      });
      if (!this.menuMusic.isPlaying) {
        this.menuMusic.play();
      }
    }

    this.events.once("shutdown", () => {
      // Não parar a música aqui, deixar o menu tocá-la
    });

    this.tutorialSteps = [
      {
        message:
          "- Você e o inimigo tomam decisões simultaneamente a cada rodada.",
      },
      {
        message: "- Há um curto periodo de tempo para agir, pense rápido!",
      },
      {
        message: "- Recarregar aumenta sua munição, porém o deixa vulnerável.",
        icons: ["reload", "heart"],
      },
      {
        message:
          "- Use o botão de atirar para atingir seu inimigo, ou use o escudo para se defender.",
        icons: ["shoot", "shield"],
      },
      {
        message: "- Volte ao menu para iniciar uma partida.",
      },
    ];

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x050505)
      .setDepth(-2);

    this.add
      .text(width / 2, 90, "Tutorial", {
        fontFamily: pixelFont,
        fontSize: "30px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tutorialText = this.add
      .text(width / 2, height / 2, "", {
        fontFamily: textFont,
        fontSize: "26px",
        color: "#d8d8d8",
        align: "center",
        wordWrap: { width: 680 },
        lineSpacing: 16,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.tutorialReloadIcon = this.add
      .image(width / 2 - 34, height / 2 + 82, "tutorialReloadButton")
      .setDisplaySize(52, 52)
      .setVisible(false)
      .setDepth(5);

    this.tutorialHeartIcon = this.add
      .image(width / 2 + 34, height / 2 + 82, "tutorialHeart")
      .setDisplaySize(40, 40)
      .setVisible(false)
      .setDepth(5);

    this.tutorialShootIcon = this.add
      .image(width / 2 - 34, height / 2 + 82, "tutorialShootButton")
      .setDisplaySize(52, 52)
      .setVisible(false)
      .setDepth(5);

    this.tutorialShieldIcon = this.add
      .image(width / 2 + 34, height / 2 + 82, "tutorialShield")
      .setDisplaySize(52, 52)
      .setVisible(false)
      .setDepth(5);

    let backText = null;
    let nextText = null;

    const onNextPointerOver = () => {
      if (!this.tutorialNextButton.active) return;
      this.tutorialNextButton.setFillStyle(0x1b1b1b);
      this.tutorialNextButton.setAlpha(0.66);
      if (nextText && nextText.active) nextText.setScale(1.03);
    };

    const onNextPointerOut = () => {
      if (!this.tutorialNextButton.active) return;
      this.tutorialNextButton.setFillStyle(0x0f0f0f);
      this.tutorialNextButton.setAlpha(0.58);
      if (nextText && nextText.active) nextText.setScale(1);
    };

    const onNextPointerDown = () => {
      if (!this.tutorialNextButton.active) return;
      showStep();
    };

    const onBackPointerOver = () => {
      if (!this.backButton.active) return;
      this.backButton.setFillStyle(0x1b1b1b);
      this.backButton.setAlpha(0.66);
      if (backText && backText.active) backText.setScale(1.03);
    };

    const onBackPointerOut = () => {
      if (!this.backButton.active) return;
      this.backButton.setFillStyle(0x0f0f0f);
      this.backButton.setAlpha(0.58);
      if (backText && backText.active) backText.setScale(1);
    };

    const onBackPointerDown = () => {
      if (!this.backButton.active) return;
      this.scene.stop("tutorial");
    };

    this.backButton = this.add
      .rectangle(width / 2, height * 0.82, 220, 44, 0x0f0f0f)
      .setStrokeStyle(2, 0x2a2a2a)
      .setAlpha(0.58)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    backText = this.add
      .text(width / 2, height * 0.82, "Menu", {
        fontFamily: pixelFont,
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ededed",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.tutorialNextButton = this.add
      .rectangle(width / 2, height * 0.82, 220, 44, 0x0f0f0f)
      .setStrokeStyle(2, 0x2a2a2a)
      .setAlpha(0.58)
      .setInteractive({ useHandCursor: true });

    nextText = this.add
      .text(width / 2, height * 0.82, "Proximo", {
        fontFamily: pixelFont,
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ededed",
      })
      .setOrigin(0.5);

    this.tutorialNextButton.on("pointerover", onNextPointerOver);
    this.tutorialNextButton.on("pointerout", onNextPointerOut);
    this.tutorialNextButton.on("pointerdown", onNextPointerDown);

    this.backButton.on("pointerover", onBackPointerOver);
    this.backButton.on("pointerout", onBackPointerOut);
    this.backButton.on("pointerdown", onBackPointerDown);

    this.events.once("shutdown", () => {
      if (this.tutorialNextButton && this.tutorialNextButton.active) {
        this.tutorialNextButton.off("pointerover", onNextPointerOver);
        this.tutorialNextButton.off("pointerout", onNextPointerOut);
        this.tutorialNextButton.off("pointerdown", onNextPointerDown);
      }
      if (this.backButton && this.backButton.active) {
        this.backButton.off("pointerover", onBackPointerOver);
        this.backButton.off("pointerout", onBackPointerOut);
        this.backButton.off("pointerdown", onBackPointerDown);
      }
    });

    const showStep = () => {
      const step = this.tutorialSteps[this.tutorialStepIndex];
      this.tutorialText.setText(step.message);

      this.tutorialReloadIcon.setVisible(false);
      this.tutorialHeartIcon.setVisible(false);
      this.tutorialShootIcon.setVisible(false);
      this.tutorialShieldIcon.setVisible(false);

      const isLastStep =
        this.tutorialStepIndex === this.tutorialSteps.length - 1;
      this.backButton.setVisible(isLastStep);
      backText.setVisible(isLastStep);
      this.tutorialNextButton.setVisible(!isLastStep);
      nextText.setVisible(!isLastStep);

      if (step.icons?.includes("reload")) {
        this.tutorialReloadIcon.setVisible(true);
        this.tutorialHeartIcon.setVisible(true);
      }

      if (step.icons?.includes("shoot")) {
        this.tutorialShootIcon.setVisible(true);
        this.tutorialShieldIcon.setVisible(true);
      }

      this.tutorialStepIndex =
        (this.tutorialStepIndex + 1) % this.tutorialSteps.length;
    };

    showStep();
  }
}

export default Tutorial;
