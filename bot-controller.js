class BotController {
  constructor() {
    // Modo de teste: limita o bot apenas a recarregar e atirar.
    // Defina como false para voltar ao comportamento normal.
    this.forceShootReloadOnly = true
  }

  weightedPick(weightMap) {
    const entries = Object.entries(weightMap);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

    if (total <= 0) return "reload";

    let roll = Math.random() * total;
    for (const [action, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return action;
    }

    return entries[entries.length - 1][0];
  }

  chooseAction(state) {
    const {
      botShotsLoaded,
      playerShotsLoaded,
      playerShieldActive,
      botShieldActive,
    } = state;

    if (this.forceShootReloadOnly) {
      if (botShotsLoaded <= 0) return "reload";
      // Com munição, sempre atira neste modo de teste.
      return "shoot";
    }

    // Sem munição: prioriza recarga, mas pode optar por escudo.
    if (botShotsLoaded <= 0) {
      return Math.random() < 0.8 ? "reload" : "armor";
    }

    // Nova regra: se o player tem munição, baseia em 40/30/30.
    if (playerShotsLoaded >= 1) {
      let reloadChance = 20;

      if (botShotsLoaded === 2) {
        reloadChance = 28;
      } else if (botShotsLoaded === 3) {
        reloadChance = 20;
      } else if (botShotsLoaded === 4) {
        reloadChance = 8;
      } else if (botShotsLoaded >= 5) {
        // Sem limite máximo: acima de 4, recarga segue possível porém cada vez mais rara.
        reloadChance = Math.max(1, 8 - (botShotsLoaded - 4) * 1.5);
      }

      const remaining = 100 - reloadChance;
      const armorChance = remaining * (3 / 7);
      const shootChance = remaining * (4 / 7);

      if (botShieldActive) {
        return this.weightedPick({ shoot: shootChance, reload: reloadChance });
      }

      return this.weightedPick({
        armor: armorChance,
        shoot: shootChance,
        reload: reloadChance,
      });
    }

    const roll = Math.random();

    if (playerShieldActive) {
      if (roll < 0.45 && !botShieldActive) return "armor";
      if (roll < 0.65) return "reload";
      return "shoot";
    }

    if (roll < 0.62) return "shoot";
    if (roll < 0.80) return "reload";
    return "armor";
  }
}

export default BotController;
