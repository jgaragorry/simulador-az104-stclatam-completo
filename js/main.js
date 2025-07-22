
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval;
let timeLeft = 90 * 60; // 90 minutos en segundos

async function startExam() {
  const res = await fetch("data/questions.json");
  questions = await res.json();
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("question-screen").classList.remove("hidden");
  renderQuestion();
  startTimer();
}

function renderQuestion() {
  const q = questions[currentQuestionIndex];
  const questionBox = document.getElementById("question-box");
  questionBox.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
  questionBox.appendChild(title);

  const p = document.createElement("p");
  p.textContent = q.question;
  questionBox.appendChild(p);

  q.options.forEach((option, i) => {
    const label = document.createElement("label");
    label.classList.add("option");
    const input = document.createElement("input");
    input.type = q.multi_select ? "checkbox" : "radio";
    input.name = "option";
    input.value = i;
    label.appendChild(input);
    label.append(" " + option);
    questionBox.appendChild(label);
  });

  updateProgress();
}

function nextQuestion() {
  const selected = Array.from(document.querySelectorAll('input[name="option"]:checked')).map(el => parseInt(el.value));
  const currentQuestion = questions[currentQuestionIndex];

  if (selected.length === 0) {
    alert("Debes seleccionar al menos una opción para continuar.");
    return;
  }

  if (currentQuestion.multi_select && selected.length !== currentQuestion.correct.length) {
    alert(`Debes seleccionar exactamente ${currentQuestion.correct.length} respuestas.`);
    return;
  }

  userAnswers[currentQuestionIndex] = selected;
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    renderQuestion();
  } else {
    clearInterval(timerInterval);
    showResults();
  }
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("¡Tiempo agotado! Las preguntas no respondidas se marcarán como incorrectas.");
      showResults();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById("timer").textContent = `${minutes}:${seconds}`;
}

function updateProgress() {
  const percent = ((currentQuestionIndex) / questions.length) * 100;
  document.getElementById("progress-bar").style.width = percent + "%";
}

function showResults() {
  document.getElementById("question-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  let score = 0;
  questions.forEach((q, i) => {
    const correctSet = new Set(q.correct);
    const answerSet = new Set(userAnswers[i] || []);
    const isCorrect = correctSet.size === answerSet.size && [...correctSet].every(v => answerSet.has(v));
    if (isCorrect) score += 1;
  });

  const totalScore = Math.round((score / questions.length) * 1000);
  const scoreBar = document.getElementById("score-bar");
  const scoreText = document.getElementById("score-text");

  scoreBar.style.width = `${(totalScore / 1000) * 100}%`;
  scoreBar.textContent = `${totalScore} / 1000`;
  scoreText.textContent = totalScore >= 700 ? "¡Aprobado!" : "No alcanzaste la puntuación mínima. Inténtalo de nuevo.";
}
