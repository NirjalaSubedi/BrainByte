(function(){
  const selectScreen = document.getElementById('select-screen');
  const collegeSub = document.getElementById('college-sub');
  const startBtn = document.getElementById('start-btn');
  const apiUrlInput = document.getElementById('api-url');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const qIndexEl = document.getElementById('qIndex');
  const qTotalEl = document.getElementById('qTotal');
  const timerEl = document.getElementById('timer');
  const questionText = document.getElementById('question-text');
  const questionImage = document.getElementById('question-image');
  const optionsEl = document.getElementById('options');
  const nextBtn = document.getElementById('next-btn');
  const scoreEl = document.getElementById('score');
  const restartBtn = document.getElementById('restart');

  let selectedLevel = null;
  let selectedCollege = null;
  let questions = [];
  let current = 0;
  let score = 0;
  let timer = null;
  let timeLeft = 60;

  function showScreen(id){
    selectScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    if(id==='select') selectScreen.classList.remove('hidden');
    if(id==='quiz') quizScreen.classList.remove('hidden');
    if(id==='result') resultScreen.classList.remove('hidden');
  }

  function enableStartIfReady(){
    if(selectedLevel && (selectedLevel!=='college' || selectedCollege)) startBtn.disabled = false;
    else startBtn.disabled = true;
  }

  // selection handlers
  document.querySelectorAll('#select-screen .choice[data-level]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      selectedLevel = btn.dataset.level;
      document.querySelectorAll('#select-screen .choice[data-level]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      if(selectedLevel==='college') collegeSub.classList.remove('hidden'); else collegeSub.classList.add('hidden');
      enableStartIfReady();
    });
  });
  document.querySelectorAll('#college-sub .choice').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      selectedCollege = btn.dataset.college;
      document.querySelectorAll('#college-sub .choice').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      enableStartIfReady();
    });
  });

  startBtn.addEventListener('click', startQuiz);

  async function fetchQuestions(apiUrl){
    const params = new URLSearchParams();
    params.set('level', selectedLevel);
    if(selectedLevel==='college' && selectedCollege) params.set('collegeType', selectedCollege);
    const url = apiUrl + '?' + params.toString();
    const res = await fetch(url);
    if(!res.ok) throw new Error('Fetch failed: '+res.status);
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('Expected array from API');
    return data;
  }

  async function startQuiz(){
    const apiUrl = apiUrlInput.value.trim();
    startBtn.disabled = true;
    try{
      questions = await fetchQuestions(apiUrl);
      if(questions.length===0) { alert('No questions returned from API'); startBtn.disabled=false; return; }
      current = 0; score = 0;
      qTotalEl.textContent = questions.length;
      showScreen('quiz');
      renderQuestion();
    }catch(err){
      alert('Could not load questions: '+err.message);
      startBtn.disabled = false;
    }
  }

  function renderQuestion(){
    clearInterval(timer);
    timeLeft = 60;
    updateTimer();
    timer = setInterval(()=>{
      timeLeft--;
      updateTimer();
      if(timeLeft<=0){
        clearInterval(timer);
        markTimeout();
      }
    },1000);

    const q = questions[current];
    qIndexEl.textContent = current+1;
    questionText.textContent = q.question || 'No question text';
    if(q.image){ questionImage.src = q.image; questionImage.classList.remove('hidden'); } else { questionImage.classList.add('hidden'); }
    optionsEl.innerHTML = '';
    (q.options||[]).forEach((opt,i)=>{
      const b = document.createElement('button');
      b.textContent = opt;
      b.className = 'opt';
      b.dataset.index = i;
      b.addEventListener('click', ()=>selectAnswer(i));
      optionsEl.appendChild(b);
    });
    nextBtn.disabled = true;
  }

  function updateTimer(){
    const mm = String(Math.floor(timeLeft/60)).padStart(2,'0');
    const ss = String(timeLeft%60).padStart(2,'0');
    timerEl.textContent = `${mm}:${ss}`;
  }

  function selectAnswer(index){
    const q = questions[current];
    // assume API includes `answer` index or value
    const correct = (typeof q.answer!=='undefined') ? (index==q.answer) : false;
    if(correct) score++;
    // mark selected
    Array.from(optionsEl.children).forEach(btn=>btn.disabled=true);
    if(correct) optionsEl.children[index].classList.add('correct'); else optionsEl.children[index].classList.add('wrong');
    clearInterval(timer);
    nextBtn.disabled = false;
  }

  function markTimeout(){
    // disable options
    Array.from(optionsEl.children).forEach(btn=>btn.disabled=true);
    nextBtn.disabled = false;
  }

  nextBtn.addEventListener('click', ()=>{
    current++;
    if(current>=questions.length){ showResults(); }
    else renderQuestion();
  });

  function showResults(){
    clearInterval(timer);
    scoreEl.textContent = `Score: ${score} / ${questions.length}`;
    showScreen('result');
  }

  restartBtn.addEventListener('click', ()=>{
    // reset selections but keep api url
    selectedLevel = null; selectedCollege = null;
    document.querySelectorAll('#select-screen .choice').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('#college-sub .choice').forEach(b=>b.classList.remove('active'));
    collegeSub.classList.add('hidden');
    startBtn.disabled = true;
    showScreen('select');
  });

  // initialize
  showScreen('select');
})();
