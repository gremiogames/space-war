/*global Phaser, axios*/
/*eslint no-undef: "error"*/
const BRICK_CREDIT_STREAK_KEY = "spaceWarBrickCreditStreak";

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function getBrickCreditStreak() {
  if (!canUseStorage()) return 0;

  const storedValue = window.localStorage.getItem(BRICK_CREDIT_STREAK_KEY);
  const parsedValue = Number.parseInt(storedValue, 10);

  return Number.isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
}

function setBrickCreditStreak(value) {
  if (!canUseStorage()) return value;

  const normalizedValue = Number.isFinite(value) && value > 0 ? value : 0;
  window.localStorage.setItem(
    BRICK_CREDIT_STREAK_KEY,
    String(normalizedValue),
  );

  return normalizedValue;
}

function getBrickCreditValue() {
  const nextStreak = setBrickCreditStreak(getBrickCreditStreak() + 1);

  if (nextStreak === 1) return 150;
  if (nextStreak >= 8) return 25;
  return 50;
}

export default class finalFeliz extends Phaser.Scene {
  constructor() {
    super("finalFeliz");
  }

  create() {
    globalThis.google.accounts.id.initialize({
      client_id:
        "331191695151-ku8mdhd76pc2k36itas8lm722krn0u64.apps.googleusercontent.com",
      callback: (res) => {
        if (res.error) {
          console.error(res.error);
        } else {
          const creditValue = getBrickCreditValue();

          axios
            .post(
              "https://feira-de-jogos.dev.br/api/v2/credit",
              {
                product: 67, // id do jogo cadastrado no banco de dados da Feira de Jogos
                value: creditValue, // crédito em tijolinhos
              },
              {
                headers: {
                  Authorization: `Bearer ${res.credential}`,
                },
              }
            )
            .then(function (response) {
              console.log(response);
              alert(`Crédito adicionado! +${creditValue}`);
            })
            .catch(function (error) {
              console.error(error);
              alert("Erro ao adicionar crédito :(");
            });
        }
      },
    });

    globalThis.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        globalThis.google.accounts.id.prompt();
      }
    });
  }
}
