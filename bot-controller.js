class BotController {
  constructor() {
    // Modo de teste: limita o bot apenas a recarregar e atirar.
    // Defina como false para voltar ao comportamento normal.
    this.forceShootReloadOnly = false;
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

    // Mantém a regra da primeira rodada/início: sem munição, prioriza recarga.
    if (botShotsLoaded <= 0) {
      return Math.random() < 0.9 ? "reload" : "armor";
    }

    // Nova regra: se o player tem munição, baseia em 40/30/30.
    if (playerShotsLoaded >= 1) {
      let reloadChance = 30;

      if (botShotsLoaded === 2) {
        reloadChance = 40;
      } else if (botShotsLoaded === 3) {
        reloadChance = 20;
      } else if (botShotsLoaded === 4) {
        reloadChance = 10;
      } else if (botShotsLoaded >= 5) {
        // Sem limite máximo: acima de 4, recarga segue possível porém cada vez mais rara.
        reloadChance = Math.max(2, 10 - (botShotsLoaded - 4) * 2);
      }

      const remaining = 100 - reloadChance;
      const armorChance = remaining * (4 / 7);
      const shootChance = remaining * (3 / 7);

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
      if (roll < 0.8) return "reload";
      return "shoot";
    }

    if (roll < 0.55) return "shoot";
    if (roll < 0.82) return "reload";
    return "armor";
  }
}

export default BotController;
