let totalQuestions = 20,
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
    inputElement.disabled = false;
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
    inputElement.disabled = true;
    saveRecord(score);
    music.pause();
    music.currentTime = 0;
    stopDecayBar();
    if (decayFill) decayFill.style.width = "0%";
  }

  function getPlayerName() {
    let playerName = localStorage.getItem("playerName");
    while (!playerName || playerName.length < 3) {
      playerName = prompt("Wpisz swoje imię (minimum 3 znaki):");
      if (playerName && playerName.length >= 3) {
        localStorage.setItem("playerName", playerName);
      } else {
        alert("Imię musi mieć co najmniej 3 znaki!");
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


