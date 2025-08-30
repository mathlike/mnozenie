let totalQuestions = 2,
    questions = [],
    askedQuestions = {},
    currentQuestion = 0,
    score = 0,
    startTime = 0,
    added = 0,
    onepoints = 100;
    const music = document.getElementById("bgMusic");
    music.volume = 0.02;
    eimie = document.getElementById("imie");
    const questionElement = document.getElementById("question"),
    inputElement = document.getElementById("input"),
    startButton = document.getElementById("startButton"),
    scoreElement = document.getElementById("score"),
    addedElement = document.getElementById("added"),
    currentScoreElement = document.getElementById("currentScore"),
    progressFill = document.getElementById("progressFill"),
    soundToggle = document.getElementById("soundToggle");
    let audioCtx = null;
    const decayFill = document.getElementById("decayFill");
    if (decayFill) decayFill.style.width = "0%";
    let pimie = localStorage.getItem("playerName");
    if (pimie) eimie.textContent = pimie;
  
    let decayRAF = null;
    inputElement.style.display = "none";

    function ensureAudio() {
      if (!audioCtx) audioCtx = new(window.AudioContext || window.webkitAudioContext)()
    }

  function tone(freq = 880, dur = 0.1, type = "sine", vol = 0.2) {
    if (!soundToggle.checked) return;
    ensureAudio();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }
  const playSuccess = () => {
    tone(1046, 0.09, "sine", 0.25);
    tone(1318, 0.08, "sine", 0.18);
  }
  const playError = () => {
    tone(196, 0.12, "sawtooth", 0.22);
  }

  function generateQuestions() {
    questions = [];
    askedQuestions = {};
    while (questions.length < totalQuestions) {
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!askedQuestions[key]) {
        askedQuestions[key] = true;
        questions.push({
          a,
          b,
          answer: a * b
        });
      }
    }
  }

  function startGame() {
    music.play().catch(e => console.log("Błąd:", e));
    getPlayerName();
    generateQuestions();
    currentQuestion = 0;
    score = 0;
    added = 0;
    startButton.style.display = "none";
    inputElement.style.display = "";
    inputElement.value = "";
    inputElement.focus();
    updateStats();
    showQuestion();
  }

  function showQuestion() {
    const q = questions[currentQuestion];
    if (q) {
      questionElement.innerHTML = `<span class="dim">Ile to</span><b>${q.a}</b> x <b>${q.b}</b>?`;
      startTime = Date.now();
      startDecayBar();
      updateStats();
    }
  }
  inputElement.addEventListener("keyup", () => {
    const userAnswer = inputElement.value.trim(),
    q = questions[currentQuestion];
    if (!q || userAnswer === "") return;
    if (userAnswer.length < q.answer.toString().length) return;
    if (parseInt(userAnswer, 10) === q.answer) {
      added = calculatePoints();
      playSuccess();
      score += added;
      currentQuestion++;
      inputElement.value = "";
      if (currentQuestion < totalQuestions) {
        showQuestion();
      } else {
        endGame();
      }
    } else {
      added = Math.min(-20, calculatePoints() - onepoints);
      playError();
      score = Math.max(0, score + added);
      inputElement.value = "";
    }
    updateStats();
  });

  function calculatePoints() {
    const timeTaken = Date.now() - startTime;
    return Math.max(0, Math.round(onepoints + 5 - parseInt(timeTaken * 0.01)));
  }

  function updateStats() {
    if (currentQuestion < totalQuestions) {
      scoreElement.textContent = `Nr ${currentQuestion+1}/${totalQuestions}`;
    }
    currentScoreElement.textContent = score;
    addedElement.textContent = added;
    addedElement.style.color = added >= 0 ? "var(--good)" : "var(--bad)";
    progressFill.style.width = (currentQuestion / totalQuestions * 100) + "%";
  }

  function endGame() {
    questionElement.innerHTML = '<span class="dim">Gra zakończona! Twoje punkty: </span>' + score;
    startButton.style.display = "";
    inputElement.style.display = "none";
    saveRecord(score);
    music.pause();
    music.currentTime = 0;
    stopDecayBar();
    if (decayFill) decayFill.style.width = "0%";
  }

  function getPlayerName() {
  let playerName = localStorage.getItem("playerName");
  while (!playerName || playerName.length < 3 || playerName.length > 15) {
    playerName = prompt("Wpisz swoje imię (od 3 do 15 znaków):");
    if (playerName) {
      if (playerName.length >= 3 && playerName.length <= 15) {
        localStorage.setItem("playerName", playerName);
      } else if (playerName.length < 3) {
        alert("Imię musi mieć co najmniej 3 znaki!");
      } else if (playerName.length > 15) {
        alert("Imię może mieć maksymalnie 15 znaków!");
      }
    }
  }

  eimie.textContent = playerName;
  inputElement.focus();
  return playerName;
}

      // Zapisanie wyniku
  function saveRecord(score) {
    const url = "https://script.google.com/macros/s/AKfycbzCga2f6sHbwMYNAsVFOGSddqSdFsO_ua6WI5S10jWW2D7DB3aZUEAVTOyxUicwqTB-3w/exec";
    const playerName = localStorage.getItem("playerName") || "Anonim";

    const data = { name: playerName, score: score };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      },
    mode: "no-cors" // Dodanie trybu no-cors
  })
    .then(response => console.log("Wysłano dane"))
    .catch(error => console.error("Błąd:", error));
  }

  startButton.addEventListener("click", startGame);
  eimie.addEventListener("click", resetPlayer);

document.addEventListener("keydown", (e) => {
  if ((e.code === "Space" || e.code === "Enter") && !e.repeat) {
    e.preventDefault();  
    startButton.click();
  }
});

function stopDecayBar() {
  if (decayRAF) {
    cancelAnimationFrame(decayRAF);
    decayRAF = null;
  }
}

function startDecayBar() {
  stopDecayBar();
  if (decayFill) decayFill.style.width = "100%";
  const tick = () => {
    const elapsed = Date.now() - startTime;
    const total = (onepoints + 5) * 100;
    const left = Math.max(0, 1 - (elapsed / total));
    if (decayFill) decayFill.style.width = (left * 100) + "%";
    if (currentQuestion < totalQuestions && left > 0) {
      decayRAF = requestAnimationFrame(tick);
    }
  };
  decayRAF = requestAnimationFrame(tick);
}

function resetPlayer() {
    localStorage.playerName = "";
    getPlayerName();
}

// === TOP10 ===
const TOP10_URL = 'https://script.google.com/macros/s/AKfycbzCga2f6sHbwMYNAsVFOGSddqSdFsO_ua6WI5S10jWW2D7DB3aZUEAVTOyxUicwqTB-3w/exec?high=1';
const overlay = document.getElementById('top10Overlay');
const closeBtn = document.getElementById('top10Close');
const rowsEl = document.getElementById('top10Rows');
const bodyEl = document.getElementById('top10Body');
const errEl = document.getElementById('top10Error');
const metaEl = document.getElementById('top10Meta');

document.getElementById('top10').addEventListener('click', showTop10);
closeBtn.addEventListener('click', closeTop10);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTop10(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !overlay.classList.contains('hidden')) closeTop10(); });

async function showTop10() {
  overlay.classList.remove('hidden');
  rowsEl.innerHTML = '';
  errEl.classList.add('hidden'); errEl.textContent = '';
  metaEl.classList.add('hidden'); metaEl.textContent = '';
  bodyEl.querySelector('.loading')?.classList.remove('hidden');

  // cache 60s
  const now = Date.now();
  try {
    const cache = JSON.parse(localStorage.getItem('top10Cache') || 'null');
    if (cache && now - cache.ts < 60000) {
      renderTop10(cache.data, cache.ts, true);
    } else {
      const data = await fetchTop10();
      localStorage.setItem('top10Cache', JSON.stringify({ data, ts: now }));
      renderTop10(data, now, false);
    }
  } catch (e) {
    bodyEl.querySelector('.loading')?.classList.add('hidden');
    errEl.textContent = 'Nie udało się pobrać listy TOP10.';
    errEl.classList.remove('hidden');
    // Pokaż z cache, jeśli mamy
    try {
      const cache = JSON.parse(localStorage.getItem('top10Cache') || 'null');
      if (cache?.data) {
        renderTop10(cache.data, cache.ts, true);
      }
    } catch {}
  }
}

function closeTop10(){ overlay.classList.add('hidden'); }

async function fetchTop10() {
  const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(TOP10_URL) + '&disableCache=true';
  const res = await fetch(url);
  const raw = await res.text();

  // jeśli serwer zwróci JSON jako tekst – parsujemy
  let arr;
  try { arr = JSON.parse(raw); }
  catch { throw new Error('Bad JSON'); }

  // normalizacja: oczekujemy [{colA, colB}, ...]
  if (!Array.isArray(arr)) throw new Error('Unexpected format');

  // odfiltruj nagłówek, jeśli pierwszy wiersz nim jest
  if (arr.length && (String(arr[0].colA).toUpperCase() === 'GRACZ' || String(arr[0].colB).toUpperCase() === 'REKORD')) {
    arr = arr.slice(1);
  }

  // posortuj malejąco po colB (gdyby backend nie posortował)
  arr.sort((a,b) => Number(b.colB) - Number(a.colB));

  // weź top10
  return arr.slice(0,10);
}

function renderTop10(data, ts, fromCache){
  bodyEl.querySelector('.loading')?.classList.add('hidden');
  rowsEl.innerHTML = '';

  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    const rank = i+1;
    const badge = document.createElement('span');
    badge.className = 'badge ' + (rank===1?'gold':rank===2?'silver':rank===3?'bronze':'');
    badge.textContent = rank;

    const tdRank = document.createElement('td');
    tdRank.appendChild(badge);

    const tdName = document.createElement('td');
    tdName.textContent = String(row.colA ?? '');

    const tdScore = document.createElement('td');
    tdScore.textContent = String(row.colB ?? '');

    tr.appendChild(tdRank);
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    rowsEl.appendChild(tr);
  });

  const when = new Date(ts).toLocaleString('pl-PL');
  metaEl.textContent = (fromCache ? 'Z cache • ' : '') + 'Ostatnie odświeżenie: ' + when;
  metaEl.classList.remove('hidden');
}


