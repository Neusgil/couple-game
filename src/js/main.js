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
  card.draggable = false;

  board.appendChild(card);
});

// ESTADO DEL JUEGO
let selectedCard = null;
let matchedPairs = 0;
let seconds = 0;
let timerInterval = null;
let mismatchTimeout = null;

// SELECCIONAR TODAS LAS CAJAS
const gameCards = document.querySelectorAll(".game__card");

// LOCAL STORAGE
const STORAGE_KEY = "coupleGame";

// ACTUALIZAR EL TIEMPO EN PANTALLA
const updateTimer = () => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  timer.textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0");
};

// GUARDAR PARTIDA EN LOCAL STORAGE
const saveGame = () => {
  const gameData = {
    colors: cards,
    matchedPairs: matchedPairs,
    seconds: seconds,
    matchedCards: [...gameCards]
      .map((card, index) =>
        card.classList.contains("game__card--matched") ? index : null
      )
      .filter((index) => index !== null),

    // GUARDAR LA POSICIÓN DE LA CAJA DESCUBIERTA
    selectedCard:
      selectedCard === null ? null : [...gameCards].indexOf(selectedCard),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
};

// RECUPERAR PARTIDA DE LOCAL STORAGE
const loadGame = () => {
  const savedGame = localStorage.getItem(STORAGE_KEY);

  // COMPROBAR SI EXISTE UNA PARTIDA GUARDADA
  if (savedGame === null) {
    return;
  }

  const gameData = JSON.parse(savedGame);

  // RECUPERAR LA DISTRIBUCIÓN DE LOS COLORES
  gameData.colors.forEach((color, index) => {
    cards[index] = color;
    gameCards[index].dataset.color = color;
  });

  // RECUPERAR PAREJAS Y TIEMPO
  matchedPairs = gameData.matchedPairs;
  seconds = gameData.seconds;

  pairs.textContent = matchedPairs;
  updateTimer();

  // RECUPERAR LAS CAJAS EMPAREJADAS
  gameData.matchedCards.forEach((index) => {
    const card = gameCards[index];

    card.classList.add("game__card--matched");
    card.style.backgroundColor = card.dataset.color;
    card.draggable = false;
  });

  // RECUPERAR LA CAJA DESCUBIERTA
  if (gameData.selectedCard !== null && gameData.selectedCard !== undefined) {
    selectedCard = gameCards[gameData.selectedCard];

    // MOSTRAR SU COLOR
    selectedCard.style.backgroundColor = selectedCard.dataset.color;

    // PERMITIR ARRASTRARLA
    selectedCard.draggable = true;
  }

  // COMPROBAR SI LA PARTIDA ESTABA TERMINADA
  if (matchedPairs === colors.length) {
    message.textContent = `¡Enhorabuena! Has encontrado todas las parejas en ${timer.textContent}.`;
  }
};

// TEMPORIZADOR
const startTimer = () => {
  if (timerInterval !== null || matchedPairs === colors.length) {
    return;
  }

  timerInterval = setInterval(() => {
    seconds++;

    updateTimer();

    // GUARDAR EL TIEMPO CADA SEGUNDO
    saveGame();
  }, 1000);
};

// DESCUBRIR EL COLOR DE UNA CAJA
const revealCard = (event) => {
  const card = event.currentTarget;

  // IMPEDIR JUGAR SI LA PARTIDA ESTÁ TERMINADA
  if (matchedPairs === colors.length) {
    return;
  }

  // IMPEDIR SELECCIONAR UNA CAJA EMPAREJADA
  if (card.classList.contains("game__card--matched")) {
    return;
  }

  // IMPEDIR DESCUBRIR MÁS DE UNA CAJA
  if (selectedCard !== null) {
    return;
  }

  // GUARDAR LA CAJA SELECCIONADA
  selectedCard = card;

  // INICIAR EL TEMPORIZADOR
  startTimer();

  // MOSTRAR SU COLOR
  card.style.backgroundColor = card.dataset.color;

  // PERMITIR ARRASTRARLA
  card.draggable = true;

  // GUARDAR EL INICIO DE LA PARTIDA
  saveGame();
};

// ESCUCHAR LOS CLICS EN LAS CAJAS
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

  // COMPROBAR QUE HAY UNA CAJA SELECCIONADA
  if (selectedCard === null) {
    return;
  }

  // IMPEDIR COMPARAR UNA CAJA CONSIGO MISMA
  if (selectedCard === targetCard) {
    return;
  }

  // IMPEDIR INTERACTUAR CON PAREJAS ENCONTRADAS
  if (targetCard.classList.contains("game__card--matched")) {
    return;
  }

  // DESCUBRIR EL COLOR DE LA SEGUNDA CAJA
  targetCard.style.backgroundColor = targetCard.dataset.color;

  // COMPARAR LOS COLORES
  if (selectedCard.dataset.color === targetCard.dataset.color) {
    selectedCard.classList.add("game__card--matched");
    targetCard.classList.add("game__card--matched");

    selectedCard.draggable = false;
    selectedCard = null;

    // ACTUALIZAR EL CONTADOR DE PAREJAS
    matchedPairs++;
    pairs.textContent = matchedPairs;

    // GUARDAR EL PROGRESO DE LA PARTIDA
    saveGame();

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
      mismatchTimeout = null;
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
  // DETENER EL TEMPORIZADOR Y LAS ESPERAS PENDIENTES
  clearInterval(timerInterval);
  clearTimeout(mismatchTimeout);

  // BORRAR LA PARTIDA GUARDADA
  localStorage.removeItem(STORAGE_KEY);

  // RESTABLECER LAS VARIABLES
  timerInterval = null;
  mismatchTimeout = null;
  selectedCard = null;
  matchedPairs = 0;
  seconds = 0;

  // RESTABLECER LA INFORMACIÓN DEL HTML
  pairs.textContent = 0;
  updateTimer();
  message.textContent = "";

  // MEZCLAR NUEVAMENTE LOS COLORES
  cards.sort(() => Math.random() - 0.5);

  // RESTABLECER LAS CAJAS
  gameCards.forEach((card, index) => {
    card.dataset.color = cards[index];
    card.style.backgroundColor = "";
    card.classList.remove("game__card--matched");
    card.draggable = false;
  });
};

// EVENTO DEL BOTÓN DE REINICIO
restart.addEventListener("click", restartGame);

// RECUPERAR LA PARTIDA AL CARGAR LA PÁGINA
loadGame();
