import "../css/style.scss";

// ELEMENTOS DEL DOM
const board = document.querySelector("#board");
const pairs = document.querySelector("#pairs");
const timer = document.querySelector("#timer");
const message = document.querySelector("#message");
const restart = document.querySelector("#restart");

// 15 COLORES DIFERENTES
const colors = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FF8000",
  "#8000FF",
  "#FF0080",
  "#80FF00",
  "#0080FF",
  "#FF8080",
  "#808000",
  "#00FF80",
  "#800000",
];

// DUPLICAR LOS COLORES PARA CREAR 15 PAREJAS
const cards = [...colors, ...colors];

// MEZCLAR LAS 30 CAJAS ALEATORIAMENTE
cards.sort(() => Math.random() - 0.5);

// CREAR LAS CAJAS EN EL TABLERO
cards.forEach((color) => {
  const card = document.createElement("div");

  card.classList.add("game__card");
  card.dataset.color = color;

  // Permitir arrastrar la caja
  card.draggable = false;

  board.appendChild(card);
});

// DESCUBRIR EL COLOR DE UNA CAJA

// ESTADO DEL JUEGO
let selectedCard = null;
let matchedPairs = 0;
let seconds = 0;
let timerInterval = null;
let mismatchTimeout = null;

// TEMPORIZADOR
const startTimer = () => {
  if (timerInterval !== null) {
    return;
  }

  timerInterval = setInterval(() => {
    seconds++;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    timer.textContent =
      String(minutes).padStart(2, "0") +
      ":" +
      String(remainingSeconds).padStart(2, "0");
  }, 1000);
};

// DESCUBRIR EL COLOR DE UNA CAJA
const revealCard = (event) => {
  const card = event.currentTarget;

  // Impedir seleccionar una caja emparejada
  if (card.classList.contains("game__card--matched")) {
    return;
  }

  // Impedir descubrir más de una caja
  if (selectedCard !== null) {
    return;
  }

  // Guardar la caja seleccionada
  selectedCard = card;

  // INICIAR EL TEMPORIZADOR
  startTimer();

  // Mostrar su color
  card.style.backgroundColor = card.dataset.color;

  // Permitir arrastrarla
  card.draggable = true;
};

// ESCUCHAR LOS CLICS EN LAS CAJAS
const gameCards = document.querySelectorAll(".game__card");

gameCards.forEach((card) => {
  card.addEventListener("click", revealCard);
});

// PERMITIR SOLTAR UNA CAJA
const dragOver = (event) => {
  event.preventDefault();
};

// COMPARAR LAS DOS CAJAS
const dropCard = (event) => {
  event.preventDefault();

  const targetCard = event.currentTarget;

  // Comprobar que hay una caja seleccionada
  if (selectedCard === null) {
    return;
  }

  // Impedir comparar una caja consigo misma
  if (selectedCard === targetCard) {
    return;
  }

  // Impedir interactuar con parejas encontradas
  if (targetCard.classList.contains("game__card--matched")) {
    return;
  }

  // Descubrir el color de la segunda caja
  targetCard.style.backgroundColor = targetCard.dataset.color;

  // Comparar los colores
  if (selectedCard.dataset.color === targetCard.dataset.color) {
    selectedCard.classList.add("game__card--matched");
    targetCard.classList.add("game__card--matched");

    selectedCard.draggable = false;
    selectedCard = null;

    // ACTUALIZAR EL CONTADOR DE PAREJAS
    matchedPairs++;
    pairs.textContent = matchedPairs;
    // DETENER EL TEMPORIZADOR AL COMPLETAR EL JUEGO
    // DETECTAR LA VICTORIA
    if (matchedPairs === colors.length) {
      clearInterval(timerInterval);
      timerInterval = null;

      message.textContent = `¡Enhorabuena! Has encontrado todas las parejas en ${timer.textContent}.`;
    }
  } else {
    selectedCard.draggable = false;

    mismatchTimeout = setTimeout(() => {
      selectedCard.style.backgroundColor = "";
      targetCard.style.backgroundColor = "";

      selectedCard = null;
    }, 800);
  }
};

// EVENTOS DRAG & DROP
gameCards.forEach((card) => {
  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", card.dataset.color);
  });

  card.addEventListener("dragover", dragOver);
  card.addEventListener("drop", dropCard);
});

// REINICIAR LA PARTIDA
const restartGame = () => {
  // Detener el temporizador y las esperas pendientes
  clearInterval(timerInterval);
  clearTimeout(mismatchTimeout);

  // Restablecer las variables
  timerInterval = null;
  mismatchTimeout = null;
  selectedCard = null;
  matchedPairs = 0;
  seconds = 0;

  // Restablecer la información del HTML
  pairs.textContent = 0;
  timer.textContent = "00:00";
  message.textContent = "";

  // Mezclar nuevamente los colores
  cards.sort(() => Math.random() - 0.5);

  // Restablecer las cajas
  gameCards.forEach((card, index) => {
    card.dataset.color = cards[index];
    card.style.backgroundColor = "";
    card.classList.remove("game__card--matched");
    card.draggable = false;
  });
};

// EVENTO DEL BOTÓN DE REINICIO
restart.addEventListener("click", restartGame);
