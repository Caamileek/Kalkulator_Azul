/* --- KALKULATOR AZUL --- */
const MAX = 20;
let currentRound = 1;
let history = [];

const tiles = [
  { name: "Niebieskie", file: "https://ik.imagekit.io/caameroon/ikona1.png?updatedAt=1762552116368" },
  { name: "Czerwone", file: "https://ik.imagekit.io/caameroon/ikona3.png?updatedAt=1762552116366" },
  { name: "Żółte", file: "https://ik.imagekit.io/caameroon/ikona2.png?updatedAt=1762552116375" },
  { name: "Czarne", file: "https://ik.imagekit.io/caameroon/ikona4.png?updatedAt=1762552116372" },
  { name: "Turkusowe", file: "https://ik.imagekit.io/caameroon/ikona5.png?updatedAt=1762552116363" }
];

let remainingTiles = {};
let roundUsed = {};
tiles.forEach(t => { remainingTiles[t.name] = MAX; roundUsed[t.name] = 0; });

function drawBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  let totalRemaining = 0;

  tiles.forEach(tile => {
    const rem = remainingTiles[tile.name];
    totalRemaining += rem;
    board.innerHTML += `
      <div class="tile ${rem < 4 && rem > 0 ? "low flash" : ""}" id="tile-${tile.name}">
        <img src="${tile.file}" alt="${tile.name}">
        <input type="number" min="0" max="${rem}" value="${roundUsed[tile.name]}" data-name="${tile.name}">
        <div class="remaining">Pozostało: ${rem}</div>
      </div>`;
  });

  document.getElementById("total").innerText = "Razem pozostało płytek w grze: " + totalRemaining;
  document.getElementById("round-counter").innerText = "Runda " + currentRound;
  drawHistory();
  setupInputs();
}

function setupInputs() {
  const inputs = Array.from(document.querySelectorAll("input[type=number]"));
  inputs.forEach((input, idx) => {
    input.addEventListener("input", () => {
      let val = Number(input.value);
      if (isNaN(val) || val < 0) val = 0;
      if (val > remainingTiles[input.dataset.name]) val = remainingTiles[input.dataset.name];
      roundUsed[input.dataset.name] = val;

      const rem = remainingTiles[input.dataset.name] - val;
      input.nextElementSibling.innerText = "Pozostało: " + rem;

      const tileDiv = input.parentElement;
      tileDiv.classList.remove("low", "flash");
      if (rem < 4 && rem > 0) tileDiv.classList.add("low", "flash");
    });

    input.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        let nextIndex = (idx + 1) % inputs.length;
        if (nextIndex === 0) nextRound();
        else {
          inputs[nextIndex].focus();
          inputs[nextIndex].select();
        }
      }
    });

    input.addEventListener("focus", () => input.select());
  });

  if (inputs.length > 0) {
    inputs[0].focus();
    inputs[0].select();
  }
}

function nextRound() {
  const emptyInput = Array.from(document.querySelectorAll("input[type=number]"))
    .find(input => Number(input.value) <= 0);

  if (emptyInput) {
    emptyInput.focus();
    emptyInput.select();
    return;
  }

  let snapshot = {};
  tiles.forEach(t => snapshot[t.name] = roundUsed[t.name]);
  history.push({ round: currentRound, used: snapshot });

  tiles.forEach(t => {
    remainingTiles[t.name] -= roundUsed[t.name];
    if (remainingTiles[t.name] < 0) remainingTiles[t.name] = 0;
    roundUsed[t.name] = 0;
  });

  currentRound++;
  drawBoard();
}

function drawHistory() {
  const hist = document.getElementById("history-box");
  if (history.length === 0) { hist.innerHTML = ""; return; }
  hist.innerHTML = "<b>Historia rund:</b><br>" + history.map(h => {
    let line = `Runda ${h.round}: `;
    line += tiles.map(t => `${t.name}: ${h.used[t.name]}`).join(", ");
    return line;
  }).join("<br>");
}

function resetCounts() {
  tiles.forEach(t => { remainingTiles[t.name] = MAX; roundUsed[t.name] = 0; });
  history = [];
  currentRound = 1;
  drawBoard();
}

document.getElementById("reset").onclick = resetCounts;
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "n") nextRound();
  if (e.key.toLowerCase() === "r") resetCounts();
});

drawBoard();
