window.totalScore = 0;
window.maxPossibleScore = 0;
window.allQuestionsMap = {};
window.starredQuestions = [];

function setDeviceMode(mode) {
    const body = document.body;
    if (mode === 'mobile') body.classList.add('mobile-mode');
    else body.classList.add('tablet-mode');
    
    const selector = document.getElementById('deviceSelector');
    selector.style.opacity = '0';
    setTimeout(() => {
        selector.style.display = 'none';
        document.getElementById('mainContent').style.opacity = '1';
        body.style.overflow = 'auto'; 
        startTimer();
    }, 500);
}

function startTimer() {
    document.getElementById('examTimer').style.display = 'block';
    let time = 120 * 60; 
    const timerEl = document.getElementById('timerText');
    setInterval(() => {
        let h = Math.floor(time / 3600);
        let m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
        let s = (time % 60).toString().padStart(2, '0');
        timerEl.innerText = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
        if(time > 0) time--;
    }, 1000);
}

function showResults() {
    let percentage = window.maxPossibleScore > 0 ? (window.totalScore / window.maxPossibleScore) * 100 : 0;
    let msg = percentage >= 90 ? "ممتاز جداً! أنت عبقري ومستعد تماماً للامتحان! 🌟 استمر في هذا التفوق الرائع." :
              percentage >= 75 ? "رائع! أداؤك جيد جداً، راجع أخطاءك البسيطة وستكون من الأوائل! 👍✨" :
              percentage >= 50 ? "جيد، لكن يمكنك تقديم مستوى أفضل بكثير. ركز أكثر في المراجعة القادمة! 💪📚" :
              "لا تستسلم! راجع الدروس مرة أخرى وتدرب أكثر، أنت بالتأكيد قادر على النجاح والتفوق! 🚀📖";

    document.getElementById('finalScoreText').innerText = `${window.totalScore} / ${window.maxPossibleScore}`;
    document.getElementById('encouragementText').innerText = msg;
    document.getElementById('resultModal').style.display = 'flex';
    setTimeout(() => { document.getElementById('resultModal').style.opacity = '1'; }, 50);
    playApplause();
    burstExplosion(window.innerWidth/2, window.innerHeight/2);
}

function closeResultModal() {
    document.getElementById('resultModal').style.opacity = '0';
    setTimeout(() => { document.getElementById('resultModal').style.display = 'none'; }, 500);
}

const applauseSound = new Audio('[https://www.myinstants.com/media/sounds/applause-1.mp3](https://www.myinstants.com/media/sounds/applause-1.mp3)');
let audioTimeout; 
function playApplause() {
    try {
        if (audioTimeout) clearTimeout(audioTimeout);
        applauseSound.currentTime = 0; applauseSound.play();
        audioTimeout = setTimeout(() => { applauseSound.pause(); applauseSound.currentTime = 0; }, 1200); 
    } catch(err) {}
}

function burstExplosion(x, y) {
    const colors = ['#FFEA00', '#FFD700', '#10b981', '#ffffff', '#3b82f6', '#ef4444', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 150; i++) {
        let confetti = document.createElement('div');
        confetti.style.position = 'fixed'; confetti.style.left = x + 'px'; confetti.style.top = y + 'px';
        confetti.style.width = (Math.random() * 10 + 6) + 'px'; confetti.style.height = (Math.random() * 20 + 10) + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.zIndex = '999999'; confetti.style.pointerEvents = 'none';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '4px';
        document.body.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2, velocity = Math.random() * (window.innerWidth * 0.7) + 150; 
        const tx = Math.cos(angle) * velocity, ty = Math.sin(angle) * velocity, rotation = Math.random() * 1080 - 540;

        let animation = confetti.animate([
            { transform: `translate(0, 0) rotate(0deg) scale(1)`, opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(0)`, opacity: 0 }
        ], { duration: Math.random() * 1000 + 1000, easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)' });
        animation.onfinish = () => confetti.remove();
    }
}

let selectedWord = null, draggedItem = null;
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) {
    draggedItem = ev.target; ev.dataTransfer.setData("text", ev.target.innerText);
    if(selectedWord) selectedWord.classList.remove('selected-word');
    selectedWord = ev.target; 
}
function drop(ev) {
    ev.preventDefault();
    const zone = ev.target.closest('.drop-zone');
    if (zone && zone.children.length === 0) handleWordPlacement(zone, draggedItem);
}
function selectWord(el) {
    if(el.classList.contains('correct-drop')) return;
    if(selectedWord) selectedWord.classList.remove('selected-word');
    selectedWord = el; el.classList.add('selected-word');
}
function clickZone(zone) {
    if(!selectedWord || zone.children.length > 0) return;
    handleWordPlacement(zone, selectedWord);
}
function handleWordPlacement(zone, wordElement) {
    if (wordElement.innerText.trim() === zone.dataset.answer.trim()) {
        zone.appendChild(wordElement);
        wordElement.className = 'drag-word correct-drop'; wordElement.draggable = false;
        zone.classList.add('filled'); selectedWord = null; window.totalScore++; 
        checkReadCompleteVictory(zone.closest('.q-container'));
    } else {
        wordElement.classList.add('wrong-drop');
        setTimeout(() => wordElement.classList.remove('wrong-drop'), 500);
    }
}
function checkReadCompleteVictory(container) {
    if(Array.from(container.querySelectorAll('.drop-zone')).every(z => z.classList.contains('filled')) && !container.dataset.solved) {
        container.dataset.solved = "true"; playApplause();
        const rect = container.getBoundingClientRect(); burstExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const explDiv = container.querySelector('.read-complete-expl');
        if(explDiv) explDiv.style.display = 'block';
    }
}

function gradeSelf(btn, isCorrect) {
    const container = btn.closest('.self-grade-container');
    if (container.dataset.graded) return;
    container.dataset.graded = "true";
    if (isCorrect) {
        window.totalScore++;
        container.innerHTML = '<span style="color: var(--correct-color); font-weight: bold;">تم احتساب النقطة لك! 🌟 أحسنت</span>';
        playApplause();
    } else container.innerHTML = '<span style="color: var(--wrong-color); font-weight: bold;">راجعها جيداً المرة القادمة! 💪</span>';
}

function toggleStar(element, uid) {
    element.classList.toggle('active-star');
    const isActive = element.classList.contains('active-star');
    
    document.querySelectorAll(`.star-btn[onclick*="${uid}"]`).forEach(btn => {
        if(isActive) btn.classList.add('active-star');
        else btn.classList.remove('active-star');
    });

    if (isActive) {
        if(!window.starredQuestions.some(q => q.uid === uid)) window.starredQuestions.push(window.allQuestionsMap[uid]);
    } else {
        window.starredQuestions = window.starredQuestions.filter(q => q.uid !== uid);
        if (document.querySelector('.tab-content.active').id === 'starred_tab') {
            const el = document.getElementById(`container_${uid}_star`);
            if(el) el.remove();
        }
    }
}
// ==========================================
// DATA PROCESSING 
// ==========================================

const rawChoose = `1. So much homework usually makes students feel ...|strange|happy|stressed|honest|stressed|الواجب الكثير يسبب الضغط والتوتر (stressed).
2. Rashwan showed ... when he refused to attack his opponent's injury.|selfishness|respect|anger|weakness|respect|عدم استغلال إصابة الخصم يدل على الاحترام (respect).
3. The five Olympic rings represent ...|medals|continents|athletes|sports|continents|الحلقات الأولمبية الخمس تمثل القارات (continents).
4. A team cannot win without ... play and friendship.|luck|talent|teamwork|mistakes|teamwork|اللعب الجماعي (teamwork) أساس الفوز.
5. Our sports teacher teaches us ...|fire|fear|fair|fare|fair|المعلم يعلمنا اللعب النظيف والعادل (fair play).
6. ... from many countries come together to compete in the Olympic Games.|Teachers|Athletes|Actors|Soldiers|Athletes|الذين يتنافسون في الأولمبياد هم الرياضيون (Athletes).
7. The ... body is made up of many different systems working together.|digital|human|metal|car|human|جسم الإنسان (human body) يتكون من أجهزة مختلفة.
8. History books tell us about the great ... that took place between armies in ancient times.|stories|battles|holidays|dances|battles|الجيوش قديماً كانت تخوض معارك (battles).
9. Many schools organize sports ... every year to encourage teamwork.|events|meals|books|plants|events|المدارس تنظم أحداثاً/فعاليات رياضية (sports events).
10. The Olympic Games promote important human ... such as respect and excellence.|problems|values|mistakes|levels|values|الأولمبياد تعزز القيم الإنسانية (human values) كالاحترام.
11. The swimmers trained hard for the national ... this year.|competition|conversation|invention|situation|competition|السباحون يتدربون من أجل المنافسة (competition).
12. The team won the ... after defeating all the other teams in the league.|championship|friendship|relationship|membership|championship|الفريق هزم الباقين ليفوز بالبطولة (championship).
13. Don't be afraid to ask ... advice at any time.|with|for|at|in|for|يطلب نصيحة تأخذ حرف الجر (ask for advice).
14. There was great ... in the crowd as the final match was about to begin.|silence|boredom|excitement|sadness|excitement|قبل المباراة النهائية يكون هناك حماس وإثارة (excitement).
15. The football ... brought teams from different schools to compete for the trophy.|weather|tournament|holiday|project|tournament|الدورة الرياضية أو البطولة تسمى (tournament).
16. The World Cup is a/an ... sports competition watched by millions of people.|international|local|private|secret|international|كأس العالم بطولة دولية (international).
17. To make the verb "start" means to start again we add the prefix ...|dis-|re-|im-|in-|re-|البادئة -re تعني إعادة فعل الشيء (again).
18. The suffix "ition" turns "compete" into a/an ...|verb|adjective|adverb|noun|noun|إضافة ition تحول الفعل لاسم (competition).
19. The teacher was fair to all students. The antonym of "fair" is ...|honest|equal|unfair|kind|unfair|عكس عادل (fair) هو ظالم (unfair).
20. Exercise helps build strength. The antonym of "strength" is ...|battle|force|power|weakness|weakness|عكس القوة (strength) هو الضعف (weakness).
21. His hard work earned the admiration of everyone. The synonym of "admiration" is ...|dislike|respect|force|hatred|respect|مرادف الإعجاب (admiration) هو الاحترام (respect).
22. ... means treating others honestly in games.|Fair play|Determination|Victory|Strength|Fair play|معاملة الآخرين بصدق في اللعب تسمى اللعب النظيف (Fair play).
23. A/An ... is soldier in the Middle Ages.|rival|athlete|knight|champion|knight|الجندي في العصور الوسطى يسمى الفارس (knight).
24. A person who wins a competition is a/an ...|knight|soldier|teamwork|champion|champion|الفائز في المنافسة هو البطل (champion).
25. A ... is a cart pulled by horses.|battle|chariot|knight|race|chariot|العربة التي تجرها الخيول تسمى (chariot).
26. The Olympic Games are the most famous sports event. The antonym of "famous" is ...|honest|active|unknown|slow|unknown|عكس مشهور (famous) هو غير معروف (unknown).
27. To get the adjective from the word "relax", we add the suffix ...|-ing|-ly|-er|-ment|-ing|نضيف ing للحصول على الصفة (relaxing).
28. To form the adjective from the noun "mystery", we add the ... "-OUS".|suffix|prefix|antonym|synonym|suffix|الـ ous تضاف في نهاية الكلمة لذا تسمى لاحقة (suffix).
29. The team achieved a great victory. "Victory" is an antonym for ...|encouragement|loss|win|success|loss|عكس انتصار (victory) هو خسارة (loss).
30. Olympic ... train for years to improve their skills and performance.|tourists|teachers|athletes|writers|athletes|الرياضيون الأولمبيون (athletes) يتدربون لسنوات.
31. I would love to ... part in the charity marathon next month.|bake|make|take|study|take|يشارك في تسمى (take part in).
32. To get the noun of the adjective "kind", we add the suffix ...|-tion|-ness|-al|-ful|-ness|نضيف ness لتحويل الصفة لاسم (kindness).
33. The two neighbors lived in perfect harmony for over twenty years. The synonym of "harmony " is ...|damage|agreement|disagreement|foolishness|agreement|مرادف انسجام (harmony) هو توافق (agreement).
34. The earthquake caused massive damage. The antonym of "massive" is ...|huge|large|enormous|tiny|tiny|عكس هائل/ضخم (massive) هو ضئيل جداً (tiny).
35. The word ... means the way of life of a group of people.|identity|harmony|culture|ceremony|culture|طريقة حياة مجموعة من الناس هي ثقافتهم (culture).
36. ... is peace or balance among people or things.|Patience|Harmony|Wisdom|Celebration|Harmony|السلام والتوازن بين الناس يسمى الانسجام (Harmony).
37. The prisoners planned to escape ... the dark room.|in|to|from|down|from|يهرب من تأخذ حرف الجر (escape from).
38. To get the adverb of the word "warm", we add the suffix ...|-ed|-ing|-ly|-er|-ly|نضيف ly لتحويل الصفة لظرف (warmly).
39. There is a long-standing problem in the company. The antonym of "long-standing" is ...|separate|long-lasting|simple|short-lived|short-lived|عكس طويل الأمد (long-standing) هو قصير الأمد (short-lived).
40. The government wants to strengthen the economy. The synonym of "strengthen" is ...|support|separate|dishonor|weaken|support|مرادف يقوي (strengthen) هو يدعم (support).
41. ... means the friendly and kind way of welcoming and caring for guests.|Hospitality|Ceremony|Tradition|Welcome|Hospitality|الترحيب بالضيوف وكرم الضيافة يسمى (Hospitality).
42. Respect and good feelings for someone or something means ...|generation|custom|honor|festival|honor|الاحترام والمشاعر الطيبة تجاه شخص تعني تكريمه (honor).
43. My grandma makes delicious cookies. The synonym of 'delicious' is ...|terrible|tasteless|tasty|careful|tasty|مرادف لذيذ (delicious) هو شهي (tasty).
44. Unity among students helps create a better school environment. The antonym of 'unity' is ...|harmony|separation|cooperation|teamwork|separation|عكس الوحدة والترابط (unity) هو الانفصال والتفرقة (separation).
45. The team trained hard to strengthen their performance. The synonym of 'strengthen' is ...|support|weaken|worsen|go wrong|support|مرادف يقوي (strengthen) هو يدعم (support).
46. Scientists are developing a cure for the disease. The antonym of 'develop ' is ...|support|improve|destroy|raise|destroy|عكس يطور/ينمي (develop) هو يدمر/يهدم (destroy).
47. To get the verb from "strength" we add the suffix ...|-ment|-ness|-ful|-en|-en|نضيف en لتحويل الاسم لفعل (strengthen).
48. Adding the suffix "ion" to "decorate" turns it into a/an ...|verb|noun|adverb|adjective|noun|إضافة ion تحول الفعل لاسم (decoration).
49. Every country has its own unique ... that shows its history and values.|traditions|collections|pollution|population|traditions|كل دولة لها تقاليدها (traditions) التي تظهر تاريخها.
50. ... means peace or balance among people or things.|Identity|Harmony|Culture|Friendship|Harmony|السلام والتوازن يعني الانسجام (Harmony).
51. Customs ... an important role in people's lives.|stop|play|write|feel|play|تلعب دوراً مهماً (play an important role).
52. The word "... " is the opposite of "alive".|living|lively|dead|active|dead|عكس حي (alive) هو ميت (dead).
53. Good ... helps people understand and respect each other.|food|friendship|job|test|friendship|الصداقة الجيدة (friendship) تساعد على الفهم والاحترام.
54. Our school wants to ... students from all grades for a special event.|gather|clean|close|hide|gather|المدرسة تريد أن تجمع (gather) الطلاب للحدث.
55. Culture helps people feel.......... through shared beliefs and customs.|separated|connected|lonely|confused|connected|الثقافة تجعل الناس يشعرون بالترابط (connected).
56. Every country has its own unique ... that shows its history and values.|rule|game|culture|sport|culture|كل دولة لها ثقافتها (culture) الفريدة.
57. Tradition helps people in a country keep their ... and culture.|money|customs|games|food|customs|التقاليد تساعد على الحفاظ على العادات (customs).
58. Many ... celebrate national holidays together.|animals|communities|machines|clothes|communities|المجتمعات (communities) تحتفل بالأعياد معاً.
59. Speaking politely is ... in many cultures.|rare|wrong|common|strange|common|التحدث بأدب شيء شائع (common) في ثقافات كثيرة.
60. People should live ... together in ...|danger|noise|harmony|fear|harmony|يجب أن يعيش الناس في انسجام (harmony).
61. A ... hunt is a game with clues.|treasure|shelter|survival|explorer|treasure|لعبة البحث عن الكنز تسمى (treasure hunt).
62. In history, real treasure hunts were often connected to ... and pirates.|teachers|shelters|survivals|explorers|explorers|البحث عن الكنز ارتبط بالمستكشفين (explorers) والقراصنة.
63. Many ..... tell about pirates hiding gold on islands.|treasures|legends|shelters|explosions|legends|الأساطير (legends) هي التي تحكي قصص القراصنة والذهب.
64. Treasure hunts ... students to work together.|encourage|damage|discourage|avoid|encourage|البحث عن الكنز يشجع (encourage) الطلاب على العمل معاً.
65. In stories, pirates hid gold ... islands.|on|of|off|in|on|الجزر تأخذ حرف الجر on (على الجزر).
66. I had planned a trip, but unfortunately, I ... lost in the jungle.|were|have|be|got|got|مصطلح يضيع في الغابة هو (get lost) وماضيه (got lost).
67. ... the age of 21, Ibn Battuta decided to leave his home and travel.|At|In|On|By|At|في سن كذا تأخذ حرف الجر At (At the age of).
68. A puzzle with tricky questions is called a ...|clue|artifact|riddle|solution|riddle|اللغز الذي يحتوي على أسئلة خادعة يسمى (riddle).
69. Columbus was a famous ... who discovered new lands.|engineer|explorer|teacher|doctor|explorer|كولومبوس كان مستكشفاً (explorer) مشهوراً.
70. The museum showed old........... from ancient Egypt.|seas|oceans|artifacts|juice|artifacts|المتحف يعرض قطعاً أثرية (artifacts).
71. They followed every ... on the map to reach the prize.|lesson|pirate|story|clue|clue|تبعوا كل دليل أو مفتاح حل (clue) على الخريطة.
72. A ... is a safe place to stay and protect yourself.|clue|shelter|torch|riddle|shelter|المكان الآمن للحماية يسمى مأوى (shelter).
73. His courage helps him survive in the jungle. The antonym of "survive" is "....... ".|live|travel|face|die|die|عكس ينجو/يبقى حياً (survive) هو يموت (die).
74. Real ... is shown when someone faces danger without giving up.|courage|fear|anger|surprise|courage|مواجهة الخطر دون استسلام يظهر الشجاعة (courage).
75. The pirates buried a box full of gold and silver ...|toys|treasure|books|tools|treasure|صندوق الذهب والفضة يعتبر كنزاً (treasure).
76. The detective followed the ... to find the missing painting.|cars|clues|flowers|songs|clues|المحقق يتبع الأدلة (clues) ليجد اللوحة.
77. Ancient ... were found during the excavation of the old temple.|clothes|artifacts|vegetables|machines|artifacts|تم العثور على قطع أثرية (artifacts) أثناء الحفر.
78. Children love to play games where they ... secret objects.|hide|eat|draw|wash|hide|الأطفال يحبون ألعاب إخفاء (hide) الأشياء السرية.
79. Scientists ... new planets and stars using powerful telescopes.|clean|discover|build|repair|discover|العلماء يكتشفون (discover) كواكب جديدة.
80. The museum contains many ... objects from ancient civilizations.|historical|plastic|modern|daily|historical|المتحف يحتوي على أشياء تاريخية (historical).
81. The pirate played a tune on a strange musical ... he found on the ship.|tool|box|instrument|weapon|instrument|أداة موسيقية تسمى (musical instrument).
82. Long ago, ... sailed the oceans searching for treasure and adventure.|pirates|soldiers|farmers|travelers|pirates|القراصنة (pirates) هم من أبحروا بحثاً عن الكنوز.
83. Climbing a high mountain is one of the greatest ... for any explorer.|games|challenges|holidays|rewards|challenges|تسلق الجبال العالية يعد من أكبر التحديات (challenges).
84. The school trip will ... a visit to the museum and a boat tour.|include|miss|forget|avoid|include|الرحلة المدرسية سوف تتضمن (include) زيارة للمتحف.
85. He is a very quick runner. "Quick" is a synonym for ...|slow|fast|lazy|weak|fast|مرادف سريع (quick) هو (fast).
86. The soldier was very brave in the battle. "Brave" is an antonym for ...|courageous|fearless|afraid|strong|afraid|عكس شجاع (brave) هو خائف (afraid).
87. This necklace is very valuable. "Valuable" is close in meaning to ...|worthless|cheap|precious|broken|precious|مرادف ذو قيمة (valuable) هو ثمين (precious).
88. The treasure was hidden in the cave. "Hidden" is an antonym for ...|secret|invisible|visible|unknown|visible|عكس مخفي (hidden) هو مرئي/ظاهر (visible).
89. Unfortunately, we missed the bus. "Unfortunately" is an antonym for ....|sadly|unluckily|fortunately|badly|fortunately|عكس لسوء الحظ (Unfortunately) هو لحسن الحظ (fortunately).
90. To get the opposite of the word "fortunately", we add the prefix ...|re|un|dis|mis|un|البادئة un تعطي العكس (unfortunately).
91. To get the adjective from the noun "value", we add the suffix ...|able|er|ing|al|able|نضيف able لتحويلها لصفة (valuable).
92. To get the noun from the verb "survive", we add the suffix ...|ing|er|al|ous|al|نضيف al لتحويلها لاسم (survival) بمعنى النجاة.
93. To get the noun from the verb "bake", we add the suffix ...|er|ly|al|ness|er|نضيف er لتصبح خباز (baker).
94. Desert tortoises are masters of water ... They can store water in their bodies for months.|movement|conservation|damage|danger|conservation|سلاحف الصحراء ماهرة في الحفاظ على الماء (conservation).
95. ... conditions in the desert can kill most animals.|Soft|Smooth|Harsh|Kind|Harsh|الظروف القاسية (Harsh) في الصحراء قد تقتل الحيوانات.
96. The fennec fox is perfectly adapted ... to desert life.|to|in|on|at|to|يتأقلم مع تأخذ حرف الجر to (adapted to).
97. Life in the desert is ... challenging.|happily|slowly|extremely|loudly|extremely|الحياة في الصحراء صعبة للغاية (extremely).
98. The soldier's uniform allowed him to ... in the forest.|hide|cover|appear|follow|hide|زي الجندي ساعده على التخفي (hide).
99. The school is five ... from my house.|meters|miles|steps|block|miles|المسافات تقاس بالأميال (miles) أو الكيلومترات.
100. The teacher will ... how to solve the problem.|demonstrate|explode|subscribe|exist|demonstrate|المعلم سيشرح ويوضح (demonstrate) كيف نحل المشكلة.
101. Running a marathon needs a lot of ...|strength|energy|death|skill|energy|الجري يحتاج إلى الكثير من الطاقة (energy).
102. The forest is so ... that little sunlight gets through.|thick|deep|wide|darkness|thick|الغابة كثيفة جداً (thick) لدرجة أن ضوء الشمس لا يمر.
103. The antonym of "underground" is ...|below|above|extremely|carefully|above|عكس تحت الأرض (underground) هو فوق الأرض (above ground).
104. The police tried to detect the truth behind the crime. The synonym of " detect " is.......|hide|harm|lose|find|find|مرادف يكتشف/يتحرى (detect) هو يجد (find).
105. The antonym of "protect" is ...|harm|guard|adjust|die|harm|عكس يحمي (protect) هو يضر/يؤذي (harm).
106. The synonym of" conservation" is ...|destruction|waste|risk|protection|protection|مرادف الحفاظ على (conservation) هو الحماية (protection).
107. To make the adjective "extreme" into an adverb, we add the suffix ...|-ation|-ing|-ior|-ly|-ly|نضيف ly لتحويل الصفة لظرف (extremely).
108. The weather was so extreme that people stayed at home. The antonym of "extreme" is ...|calm|harsh|mild|abnormal|mild|عكس قاسي/شديد (extreme) هو معتدل (mild).
109. To change the verb "adapt" into a noun, we add the suffix ...|-ation|-ly|-ior|-ing|-ation|نضيف ation لتحويلها لاسم (adaptation) بمعنى التكيف.
110. Changes that help living things survive in their environment are called ...|predators|migration|adaptations|conservation|adaptations|التغيرات التي تساعد الكائنات على البقاء تسمى تكيفات (adaptations).
111. Rough or severe conditions, like very hot or cold weather, are described as ...|flexible|harsh|disturbing|fascinated|harsh|الظروف الصعبة والقاسية توصف بأنها (harsh).
112. Protecting nature and natural resources is called ...|migration|predators|adaptations|conservation|conservation|حماية الطبيعة ومواردها تسمى الحفاظ على البيئة (conservation).
113. ... means the movement from one place to another, often seasonally.|Flexible|Migration|Disturbing|Predators|Migration|الانتقال من مكان لآخر موسمياً يسمى الهجرة (Migration).
114. Animals that hunt and eat other animals are called ...|predators|adaptations|disturbing|flexible|predators|الحيوانات التي تصطاد غيرها تسمى المفترسات (predators).
115. Animals must adapt. ... their environment to survive.|up|into|out|to|to|يتكيف مع تأخذ حرف الجر to (adapt to).
116. Oil does not mix ... water.|to|for|with|by|with|يختلط بـ تأخذ حرف الجر with (mix with).
117. To get the opposite of the word 'visible', we add the prefix ...|un-|in-|dis-|re-|in-|عكس مرئي (visible) هو غير مرئي بإضافة in فتصبح (invisible).
118. The antonym of "calm" is ...|friend|peaceful|rest|nervous|nervous|عكس هادئ (calm) هو متوتر (nervous).
119. It was brave of him to enter the burning house. The synonym of 'brave' is ...|famous|afraid|fearless|fearful|fearless|مرادف شجاع (brave) هو بلا خوف (fearless).
120. A ... helps protect animals and studies how they live in the wild.|teacher|painter|wildlife expert|musician|wildlife expert|خبير الحياة البرية (wildlife expert) هو من يدرس الحيوانات في بيئتها.
121. The loud noise outside was ... and made it hard to concentrate.|pleasant|disturbing|peaceful|relaxing|disturbing|الضوضاء العالية تعتبر مزعجة (disturbing).
122. Doctors use modern ... to treat many serious illnesses.|furniture|machines|medicine|decoration|medicine|الأطباء يستخدمون الطب الحديث (modern medicine) للعلاج.
123. Bird ... occurs every year when they fly to warmer places.|imagination|migration|invitation|decoration|migration|هجرة الطيور (Bird migration) تحدث سنوياً للمناطق الأدفأ.
124. Our journey turned into a/an ... adventure that we still talk about today.|relaxed|forgettable|unforgettable|slippery|unforgettable|رحلة لا نزال نتحدث عنها إذاً هي لا تُنسى (unforgettable).
125. We decided to take a ... hiking trail to see a remote waterfall.|challenging|change|fictional|imaginary|challenging|طريق صعب ومثير للتحدي (challenging).
126. The ... scenery along the path was absolutely amazing.|breathtaking|boring|difficult|foggy|breathtaking|مناظر رائعة وتخطف الأنفاس (breathtaking).
127. The path became ... and dangerous, so we took shelter under some large rocks.|simple|comfortable|easy|slippery|slippery|الطريق أصبح زلقاً (slippery) وخطيراً.
128. He played music ... in front of the class.|solo|southward|exhausting|memorable|solo|لعب الموسيقى منفرداً (solo).
129. He was ... to finish his project on time.|determined|determination|memorable|southward|determined|كان عازماً ومصمماً (determined) على إنهاء مشروعه.
130. The boy ... to carry the heavy box.|slept|struggled|hid|led|struggled|الولد كافح وعانى (struggled) ليحمل الصندوق الثقيل.
131. The travelers moved ... toward the mountains.|memorable|incredible|southward|underground|southward|تحركوا باتجاه الجنوب (southward).
132. Visiting Luxor is the most ... visit in my life.|forgotten|advice|motorcycle|memorable|memorable|زيارة لا تُنسى ولها ذكرى طيبة (memorable).
133. We visited famous ... like the Cairo Tower.|bookmarks|landmarks|graveyards|stations|landmarks|برج القاهرة من المعالم البارزة (landmarks).
134. I will never give ... trying to improve my English.|with|up|by|about|up|يستسلم هي (give up).
135. To get the adjective of the word 'person', we add the suffix ...|-ed|-ing|-ly|-al|-al|شخصي (personal).
136. The synonym of" exhausting" is ...|discouraging|encouraging|tiring|motivating|tiring|مرادف مرهق (exhausting) هو متعب (tiring).
137. Inner and outer are ...|synonyms|adverbs|antonyms|adjectives|antonyms|داخلي وخارجي هما متضادات (antonyms).
138. To get the opposite of the word forgettable, we add the prefix ...|un-|-ive|im-|in-|un-|عكس قابل للنسيان هو لا ينسى (unforgettable).
139. The synonym of "challenging" is ...|damaging|simple|easy|difficult|difficult|مرادف به تحدٍ/صعب (challenging) هو (difficult).
140. To get the adjective of the word "nature", we add ...|ive|al|less|ful|al|طبيعي (natural).
141. The work was so exhausting that he couldn't continue. The antonym of exhausting is ...|simple|tiring|relaxing|free|relaxing|عكس مرهق (exhausting) هو مريح (relaxing).
142. The synonym of ancient is ...|difficult|hard|old|new|old|مرادف قديم/أثري (ancient) هو (old).
143. The word ... means smooth and hard to stand on because you might slide.|boring|slippery|challenging|safe|slippery|ناعم ويصعب الوقوف عليه لأنه زلق (slippery).
144. Warm and friendly treatment to guests and visitors is called ...|hospital|slippery|hospitality|columns|hospitality|التعامل الودي مع الضيوف هو كرم الضيافة (hospitality).
145. The word ... means difficult in a way that tests your abilities and skills.|challenging|ugly|breathtaking|safe|challenging|صعب ويختبر قدراتك يعني به تحدٍ (challenging).
146. A ... is a trip into the desert to explore and enjoy nature.|safari|system|waterfall|scenery|safari|رحلة استكشاف الصحراء تسمى (safari).
147. ... means warm and friendly treatment to guests and visitors|Honesty|Hospitality|Cruelty|Creativity|Hospitality|كرم الضيافة (Hospitality).
148. Our family enjoyed a relaxing ... at the seaside resort.|trip|homework|lecture|meeting|trip|رحلة مريحة (relaxing trip).
149. He inherited a large ... from his grandfather.|poverty|wealth|sadness|failure|wealth|ورث ثروة (wealth) كبيرة من جده.
150. Museums provide an ... experience for students.|educational|boring|useless|unnecessary|educational|المتاحف توفر تجربة تعليمية (educational).
151. The castle at night looked ... and spooky.|mysterious|clear|normal|boring|mysterious|القلعة ليلاً تبدو غامضة (mysterious) ومخيفة.
152. Queen Hatshepsut was one of the most successful female pharaohs in Egyptian ...|continent|fiction|history|slippery|history|من أنجح الفراعنة في التاريخ (history) المصري.
153. Queen Hatshepsut ... Egypt for twenty-two years.|ruled|challenged|fought|imagined|ruled|حكمت (ruled) مصر لـ 22 عاماً.
154. The Egyptian leaders left a ... that continues to inspire people today.|branch|cottage|conflict|heritage|heritage|تركوا تراثاً (heritage) يظل ملهماً للناس.
155. Queen Hatshepsut brought peace and ... to the country.|poverty|prosperity|cruelty|dishonesty|prosperity|جلبت السلام والازدهار/الرخاء (prosperity).
156. Hatshepsut's leadership style ... cooperation rather than fight.|made|emphasized|realized|raised|emphasized|أكدت/ركزت (emphasized) على التعاون بدلاً من القتال.
157. There was a disagreement between the teacher and the student. The opposite of the word' disagreement' is ...|confidence|conflict|agreement|arrangement|agreement|عكس خلاف/عدم اتفاق (disagreement) هو اتفاق (agreement).
158. There is immense pressure on students before exams. The synonym of " immense" is ...|damaging|simple|huge|difficult|huge|مرادف هائل/ضخم (immense) هو (huge).
159. ... means the history, traditions, and culture of a country or family.|Challenge|Environment|Heritage|Society|Heritage|التاريخ والتقاليد للبلد يسمى التراث (Heritage).
160. ... is a state of being successful and having enough money.|Honesty|Hospitality|Creativity|Prosperity|Prosperity|حالة النجاح ووفرة المال تسمى الازدهار (Prosperity).
161. ... are people who watch or listen and then decide who wins.|Losers|Judges|thieves|Criminals|Judges|الحكام (Judges) هم من يقررون الفائز.
162. To get the adjective of the word "peace", we add ...|ful|ing|able|ive|ful|نضيف ful لتصبح مسالم/هادئ (peaceful).
163. Successful leaders also have a clear ...|session|vision|revision|interview|vision|القادة الناجحون لديهم رؤية (vision) واضحة.
164. Modern leadership research shows that the most effective leaders share key ...|qualities|adverbs|fictions|masks|qualities|القادة الفعالون يتشاركون في صفات (qualities) رئيسية.
165. A good leader can ... plans when needed.|trick|deny|adjust|mix|adjust|القائد الجيد يمكنه تعديل/ضبط (adjust) الخطط.
166. To get the adjective of the word 'exhaust', we add the suffix ...|-ed|-ive|-ly|-al|-ed|مرهق (exhausted).
167. The antonym of "weak" is ...|difficult|encouraging|strong|simple|strong|عكس ضعيف هو قوي (strong).
168. Support and "encourage" are ...|synonyms|adverbs|antonyms|adjectives|synonyms|يدعم ويشجع هما مترادفات (synonyms).
169. To get the adverb of the word complete, we add ...|ive|ly|less|ful|ly|نضيف ly لتصبح كلياً/تماماً (completely).
170. The synonym of creative is ...|simple|helpful|imaginative|free|imaginative|مرادف مبدع (creative) هو واسع الخيال (imaginative).
171. The antonym of inspire is ...|encourage|harden|discourage|help|discourage|عكس يلهم/يشجع (inspire) هو يحبط (discourage).
172. She stayed humble and showed great ... even after winning the award.|modesty|judge|treaty|conflict|modesty|بقت متواضعة وأظهرت تواضعاً (modesty) كبيراً.
173. The soldiers were ... by their leader's brave words to keep fighting.|negotiated|discouraged|resisted|motivated|motivated|الجنود تم تحفيزهم (motivated) بكلمات قائدهم.
174. Her story ... me to study harder.|admitted|prevented|inspired|discouraged|inspired|قصتها ألهمتني (inspired) لأذاكر بجد.
175. Our ... of the project always encourages everyone in the team to do their best.|leader|rules|opponent|followers|leader|قائد (leader) المشروع يشجع فريقه دائماً.
176. The company announced a huge ... to clear out old stock.|sale|purchase|loan|budget|sale|الشركة أعلنت عن أوكازيون/تخفيض (sale) كبير.
177. Strong....... is essential for guiding people toward a common goal.|leadership|friendship|teamwork|freedom|leadership|القيادة (leadership) القوية ضرورية لتوجيه الناس.
178. Great leaders ... clearly and listen carefully.|collect|conflict|communicate|fix|communicate|القادة العظماء يتواصلون (communicate).
179. Many athletes ... in the Olympic Games to win medals for their countries.|competed|watched|rested|ignored|competed|التنافس في الألعاب الأولمبية (competed).
180. The two boys got into a ... over a misunderstanding.|dances|fights|jokes|lessons|fights|تشاجروا بسبب سوء فهم (fights).
181. The player received a gold ... for winning first place in the race.|ticket|tool|letter|medal|medal|المركز الأول يحصل على ميدالية ذهبية (medal).
182. We should always show ... to our parents and teachers.|noise|respect|anger|trouble|respect|يجب أن نظهر الاحترام (respect) لآبائنا ومعلمينا.
183. After months of training, she became the national tennis ...|visitor|artist|champion|singer|champion|أصبحت بطلة التنس الوطنية (champion).
184. In a match, the person you play against is called your ...|neighbor|coach|opponent|help|opponent|الشخص الذي تلعب ضده هو الخصم (opponent).
185. Debate means ... or discussion.|an argument|a game|a plan|a story|an argument|المناظرة تعني نقاش أو جدال (argument).
186. Capture means ... or record.|to take|to ignore|to lose|to forget|to take|يلتقط (Capture) تعني يأخذ أو يسجل (to take).
187. Relationships mean ways ... are connected.|people|places|colors|sounds|people|العلاقات تعني طرق تواصل الناس (people).
188. ... sleep early?|Was he using to|Did he use to|Is he used to|Is he using to|Did he use to|سؤال في الماضي عن العادة باستخدام (Did he use to).
189. A calculator ... do sums.|is used to|is used for|used to|used for|is used to|الآلة الحاسبة تُستخدم لـ (is used to + inf).
190. My grandfather ... on his farm. Now he does that no more.|is used to working|is used for working|uses to work|used to work|used to work|عادة في الماضي وانتهت نستخدم (used to + inf).
191. People from different ... come together to share.|machines|communities|tools|schools|communities|الناس من مجتمعات مختلفة (communities).
192. Many people ... their national day with music and dancing.|eat|celebrate|forget|walk|celebrate|الناس يحتفلون (celebrate) بيومهم الوطني.
193. Ahmed, ... has many customers in India, often goes there for holidays.|who|when|where|whose|who|ضمير الوصل للعاقل الفاعل (who).
194. The dress ... you wore last night was very nice.|what|which|whom|who|which|ضمير الوصل لغير العاقل (which).
195. The Rio ... is one of the most famous events in the world.|concert|carnival|meeting|museum|carnival|كرنفال ريو الشهير (carnival).
196. The man ... brother lives in that house is a famous actor.|who|which|whose|that|whose|ضمير الوصل للملكية (whose).
197. Cairo is the largest city in Egypt ... we live.|who|when|which|where|where|ضمير الوصل للمكان (where).
198. His wife ... he respects is a very social lady.|who|what|whose|which|who|ضمير الوصل للعاقل المفعول أو الفاعل هنا (who).
199. The students designed their projects ... to impress the judges.|slowly|carelessly|creatively|badly|creatively|صمموا مشاريعهم بإبداع (creatively).
200. The museum displays a ... of historical objects from different eras.|mountain|map|treasure|letter|treasure|كنز من الأشياء التاريخية (treasure).
201. Many ... traveled across the seas to find new lands and trade routes.|teachers|explorers|farmers|artists|explorers|المستكشفون (explorers) سافروا عبر البحار.
202. Ancient ... often tell stories about heroes and mysterious creatures.|legends|poems|songs|letters|legends|الأساطير القديمة (legends) تحكي عن الأبطال.
203. We hope ... our French friends when we visit Paris.|to see|seeing|see|seen|to see|الفعل hope يأخذ to والمصدر (to see).
204. He refused ... for what he had done.|apologized|to apologize|to apologizing|apologizing|to apologize|الفعل refuse يأخذ to والمصدر (to apologize).
205. We like it so much. We've decided ... for another year.|staying|have stayed|to stay|stay|to stay|الفعل decide يأخذ to والمصدر (to stay).
206. The boy's father promised ... for the window to be repaired.|paid|would pay|paying|to pay|to pay|الفعل promise يأخذ to والمصدر (to pay).
207. The boy began ... in the middle of the night.|cried|to cry|to crying|cry|to cry|الفعل begin يأخذ to والمصدر (to cry).
208. He offered ... to help.|helped|helping|to help|help|to help|الفعل offer يأخذ to والمصدر (to help).
209. The underground train started ...|moved|moveable|moves|to move|to move|الفعل start يأخذ to والمصدر (to move).
210. Many explorers entered the dense jungle in search for the hidden ...|treasures|houses|rivers|roads|treasures|بحثاً عن الكنوز المخفية (treasures).
211. The old sailor told his story on a popular ... that people could listen to online.|newspaper|podcast|movie|painting|podcast|يمكن الاستماع إليه عبر الإنترنت (podcast).
212. In the deep ..., wild animals move silently among the tall trees.|city|desert|jungle|mountain|jungle|الأشجار العالية والحيوانات البرية في الغابة (jungle).
213. During storms, people must find shelter to ... themselves from danger.|invite|protect|follow|attack|protect|إيجاد مأوى لحماية (protect) أنفسهم.
214. The explorers needed food and tools for their ... in the wild.|painting|survival|celebration|discovery|survival|الطعام والأدوات من أجل البقاء (survival).
215. Some ... are home to rare plants and dangerous animals.|cities|jungles|villages|valleys|jungles|الغابات (jungles) موطن للنباتات النادرة.
216. Even when facing great ..., the explorers continued their journey.|laughter|fear|peace|sleep|fear|على الرغم من مواجهة الخوف (fear) العظيم.
217. Every little action you take can ... in making the world better.|break|matter|disappear|fall|matter|كل فعل صغير يمكن أن يهم ويحدث فرقاً (matter).
218. The old map showed the ... buried under the ancient temple.|clouds|treasures|rocks|villages|treasures|الخريطة أظهرت الكنوز (treasures) المدفونة.
219. Washing hands often can prevent the spread of ...|disease|excitement|laughter|fashion|disease|غسل اليدين يمنع انتشار المرض (disease).
220. Ibrahim asked Marwan where he ... the night before.|has been|had been|is|were|had been|كلام غير مباشر في الماضي التام (had been).
221. The child was ... by the magician's amazing tricks.|frightened|confused|fascinated|disappointed|fascinated|كان منبهراً (fascinated) بالخدع.
222. A gymnast must be ... to perform difficult movements easily.|flexible|clumsy|stiff|lazy|flexible|لاعب الجمباز يجب أن يكون مرناً (flexible).
223. The lake was completely ... during the long winter.|flowing|frozen|boiling|empty|frozen|البحيرة كانت متجمدة (frozen) في الشتاء.
224. Adham asked Ziad where she ... the following day.|went|has gone|going|would go|would go|كلام غير مباشر للمستقبل نستخدم (would go).
225. The Titanic's final ... ended in tragedy.|voyage|meeting|lunch|promise|voyage|الرحلة البحرية الأخيرة (voyage) للتيتانيك.
226. The car had a sudden ... in the middle of the road.|vacation|breakdown|picnic|holiday|breakdown|السيارة حدث لها عطل مفاجئ (breakdown).
227. People began to ... when the fire alarm went off.|celebrate|panic|sleep|whisper|panic|بدأ الناس في الذعر (panic) عند انطلاق الإنذار.
228. The teacher warned that ... could lead to mistakes during exams.|patience|calmness|impatience|relaxation|impatience|قلة الصبر (impatience) قد تؤدي للأخطاء.
229. Shahd asked Salsabil what she ... the previous week.|does|had done|would do|is doing|had done|كلام غير مباشر في الماضي التام (had done).
230. Yesterday, I ... Adham at the market.|meet|meets|met|meeting|met|في الماضي البسيط (Yesterday) نستخدم التصريف الثاني (met).
231. The archaeologists discovered ancient ... filled with treasures.|tombs|roads|shops|bridge|tombs|علماء الآثار اكتشفوا مقابر (tombs) قديمة.
232. We decided to ... the rainforest to see exotic animals.|explore|ignore|hide|skip|explore|قررنا استكشاف (explore) الغابة المطيرة.
233. The safari trip was a / an ... experience that I will never forget.|forgettable|unforgettable|boring|ordinary|unforgettable|تجربة لا يمكن نسيانها (unforgettable).
234. After Hager ... TV, she slept.|has watched|had watched|watches|watching|had watched|بعد (After) يأتي الماضي التام (had watched).
235. She learned the important ... about honesty from her teacher.|lie|fiction|truth|rumor|truth|تعلمت الحقيقة (truth) المهمة عن الصدق.
236. Many people prefer to spend their ... at exotic destinations.|vacation|work|lecture|shopping|vacation|قضاء إجازتهم (vacation) في أماكن غريبة.
237. After they ..., they celebrated.|win|have won|had won|will win|had won|حدث أول في الماضي نستخدم الماضي التام (had won).
238. He paused with slight ... before giving his speech.|hesitation|courage|determination|confidence|hesitation|توقف بتردد (hesitation) طفيف قبل خطابه.
239. Climbing the mountain was a true test of ...|adventure|laziness|boredom|routine|adventure|تسلق الجبل كان اختباراً حقيقياً للمغامرة (adventure).
240. The navy sent a ... to patrol the coast.|warship|sailboat|yacht|ferry|warship|البحرية ترسل سفينة حربية (warship).
241. When he arrived, I... my homework.|did|do|had done|doing|had done|حدث تم قبل حدث آخر في الماضي (had done).
242. Many students enjoy working in groups because ... helps achieve more.|teamwork|solitude|laziness|hesitation|teamwork|العمل الجماعي (teamwork) يساعد على تحقيق المزيد.
243. Sometimes, it is better to work ... to focus on personal tasks.|alone|together|quickly|easily|alone|من الأفضل أحياناً العمل بمفردك (alone).
244. Father ordered me ... too much.|to play|not to|not playing|not to playing|not to|أمرني ألا ألعب نستخدم (not to).
245. The tourists visited ... to learn about the rich culture of the region.|upper Egypt|lower Egypt|Cairo only|Alexandria only|upper Egypt|زاروا صعيد مصر (upper Egypt) للتعرف على الثقافة.
246. Electric cars often use a ... engine combining fuel and electricity.|hybrid|single|slow|weak|hybrid|المحرك الذي يجمع بين الوقود والكهرباء يسمى هجين (hybrid).
247. The teacher acted as a fair ... during the school debate.|judge|player|listener|visitor|judge|المعلم كان حكماً (judge) عادلاً.
248. The politician launched a new ... to attract voters.|campaign|lecture|festival|meeting|campaign|أطلق حملة (campaign) لجذب الناخبين.
249. Fatima advised Asmaa ... well before the exam.|to revise|revise|revised|revising|to revise|الفعل advise يأخذ to والمصدر (to revise).
250. Economic growth brings... to many communities.|poverty|prosperity|conflict|budget|prosperity|النمو الاقتصادي يجلب الرخاء (prosperity).
251. It is important to ... the main points when giving a presentation.|ignore|emphasize|forget|postpone|emphasize|من المهم التأكيد على (emphasize) النقاط الرئيسية.
252. The government announced a new annual ... for all departments.|budget|festival|meeting|sale|budget|الحكومة أعلنت عن ميزانية (budget) سنوية جديدة.
253. Companies spend large sums on ... to promote their products.|marketing|fighting|budgeting|reading|marketing|الشركات تنفق على التسويق (marketing).
254. Mohamed Salah is a well known player. The synonym of (well-known) is ...|famous|old|intelligent|silent|famous|مرادف مشهور (well-known) هو (famous).
255. The suffix ... turns the word (culture) into an adjective.|-ed|-ous|-ing|-al|-al|إضافة al لكلمة ثقافة تصبح ثقافي (cultural).
256. ... is a small electric lamp that you can hold in your hand.|Bank|Car|Torch|Chair|Torch|المصباح اليدوي (Torch).
257. We add the suffix ... to the word (tradition) to form an adjective.|-al|-ous|-ing|-ed|-al|إضافة al لتصبح تقليدي (traditional).
258. The opposite of the word (powerful) is ...|strong|courage|kind|weak|weak|عكس قوي (powerful) هو ضعيف (weak).
259. Eating healthy food helps keep our... strong.|muscles|houses|work|environment|muscles|الطعام الصحي يبقي العضلات (muscle) قويه.`;

 
const rawCorrect = `1. I (use) to play in the park when I was a child.|used|للتعبير عن عادة في الماضي وانتهت، نستخدم used to + المصدر.
2. My father didn't (used) to work in the bank.|use|بعد didn't نستخدم الفعل في المصدر (use).
3. We used to (going) to Alexandria every summer.|go|بعد used to يأتي الفعل في المصدر بدون إضافات (go).
4. (Do you / used) to watch cartoons when you were young?|Did you use|للسؤال عن عادة في الماضي نبدأ بـ Did والفاعل ثم use في المصدر.
5. He (not/use) to drink tea.|didn't use|لنفي العادة في الماضي نستخدم didn't use to.
6. I (use to) play tennis every Friday.|used to|الجملة تعبر عن عادة، فتكون used to.
7. She (doesn't use to) like coffee when she was young.|didn't use to|الماضي يُنفى بـ didn't وليس doesn't.
8. There (use to) be a movie theater near my house.|used to|للتعبير عن شيء كان موجوداً بالماضي: There used to be.
9. Rashwan (used) train hard.|used to|لابد من وضع to بعد used قبل الفعل في المصدر.
10. My brother (use to) play football every weekend.|used to|نحتاج للماضي used للتعبير عن العادة القديمة.
11. There (use) to be a park here, but now it's gone.|used|الجملة تدل على الماضي (but now it's gone) لذا نستخدم used.
12. We didn't (used) to go out at night when we were children.|use|بعد didn't نضع المصدر use.
13. (Were) you use to visit ancient sites?|Did|في سؤال العادة في الماضي نستخدم Did وليس Were.
14. He (use) to play judo every day.|used|عادة ماضية فتصبح used.
15. Did the player (used) to win many matches?|use|في السؤال بعد Did يرجع الفعل لمصدره use.
16. He (don't) use to be rude.|didn't|نفي العادة في الماضي يكون بـ didn't.
17. The team (used to) train at noon. It was very hot at that time.|used to|الجملة صحيحة قواعدياً (كانوا معتادين على)، ولا تحتاج تعديل.
18. People used to (admired) Aya's honesty.|admire|بعد used to يجب وضع الفعل في المصدر (بدون d).
19. He used to (rode) his bike to school.|ride|المصدر من rode هو ride.
20. We didn't (used) to live in Luxor.|use|بعد didn't مصدر use.
21. (Do) you use to travel alone?|Did|السؤال عن الماضي يبدأ بـ Did.
22. My father didn't use to work in the bank when he (is) young.|was|الجملة في الماضي (didn't use) لذا نستخدم was بدلاً من is.
23. He (use / is) a football player, but now he's a coach.|used to be|كان معتاداً أن يكون لاعباً (used to be).
24. My sister (use / not like) coffee, but now she drinks it every day.|didn't use to like|نفي العادة في الماضي: didn't use to + المصدر.
25. My father (doesn't) use to like tea when he was young.|didn't|نفي الماضي بـ didn't.
26. The knife (used to) cut meat.|is used to|هنا تستخدم بمعنى "تُستخدم لـ" (مبني للمجهول: is used to + المصدر) وليست قاعدة العادة!
27. The book (when) I borrowed is very interesting.|which|الكتاب غير عاقل، نستخدم ضمير الوصل which أو that.
28. The man (which) spoke to us is my teacher.|who|الرجل عاقل فاعل، نستخدم who.
29. The city (when) we visited last summer is very old.|which / that|عندما نصف مدينة كشيء (تمت زيارته) وليس كظرف مكان، نستخدم which.
30. 2006 was the year (where) my brother was born.|when|العام يدل على زمن، فنستخدم when.
31. The boy (which) plays football is my cousin.|who / that|الولد عاقل، نستخدم who أو that.
32. I know the city (who) has a famous museum.|which / that|المدينة غير عاقل، نستخدم which أو that.
33. She is the teacher (where) teaches English.|who / that|المعلمة عاقل، نستخدم who.
34. That is the time (who) we met our teacher for the first time.|when|الوقت زمن، نستخدم when.
35. The festival (when) is held every spring is very colorful.|which / that|المهرجان غير عاقل ويعامل هنا كفاعل (الذي يُقام)، نستخدم which.
36. The woman (where) won the prize is very talented.|who / that|المرأة عاقل، نستخدم who.
37. I met Ameer (who) father is an engineer.|whose|والد أمير (ملكية)، نستخدم whose.
38. Ramy bought a mobile (whose) was expensive.|which / that|الموبايل غير عاقل، نستخدم which.
39. Mansoura is the place (when) I was born.|where|المنصورة مكان، نستخدم where.
40. This is the hotel (where) we stay in.|which / that|لوجود حرف الجر (in) يعود على المكان، نستخدم which ولا نستخدم where.
41. This is the school (which) I was educated.|where|المدرسة مكان تم فيه الفعل ولا يوجد حرف جر، نستخدم where.
42. I met Mr Ali (whose) is my teacher.|who|مستر علي عاقل، نستخدم who.
43. Tom, (where) grew up in London, has lived in Egypt for 15 years.|who|توم عاقل، نستخدم who.
44. Samir (whose) I helped is naughty.|whom / who|سمير مفعول به عاقل، نستخدم whom أو who.
45. The car (whose) I bought is cheap.|which / that|السيارة غير عاقل، نستخدم which.
46. Friday is the day (where) I was born.|when|يوم الجمعة زمان، نستخدم when.
47. She enjoys (reads) stories before bed.|reading|الفعل enjoy يتبعه الفعل مضافاً له ing.
48. Mazen promised (calling) me after the exam.|to call|الفعل promise يتبعه to + المصدر.
49. My team want (win) the competition this year.|to win|الفعل want يتبعه to + المصدر.
50. My mom finished (does) the dishes in the kitchen.|doing|الفعل finish يتبعه v+ing.
51. He refused (wait) for us.|to wait|الفعل refuse يتبعه to + المصدر.
52. Ali kept (asks) questions about his new lessons.|asking|الفعل keep/kept يتبعه v+ing.
53. We hope (see) our French friends when we visit Paris.|to see|الفعل hope يتبعه to + المصدر.
54. He refused (apologized) for what he had done.|to apologize|الفعل refuse يتبعه to + المصدر.
55. We like it so much. We've decided (stay) for another year.|to stay|الفعل decide يتبعه to + المصدر.
56. The boy's father promised (would pay) for the window to be repaired.|to pay|الفعل promise يتبعه to + المصدر.
57. The boy began (crying) in the middle of the night.|to cry / crying|الفعل begin يأتي بعده to + المصدر أو v+ing كلاهما صحيح.
58. He offered (helping) us.|to help|الفعل offer يتبعه to + المصدر.
59. The underground train started (moved).|moving / to move|الفعل start يأتي بعده v+ing أو to+المصدر.
60. She asked me if I (will go) to the party that evening.|would go|في الـ Reported Speech نحول will للمركز الأقدم فتصبح would.
61. Ahmed asked Hana if she (find) a new job.|had found / found|بعد asked الجملة تتحول للماضي الأقدم (ماضي بسيط أو ماضي تام).
62. They wondered (whether they finish) their homework already.|whether they had finished|نحول المضارع التام/الماضي إلى ماضي تام (had + pp).
63. The teacher asked him what the answer (be).|was|في السؤال غير المباشر نضع الفاعل ثم الفعل في الماضي (was).
64. She asked if he (have) any news about the event.|had|يتحول المضارع have إلى الماضي had.
65. They asked me if I (go) to the concert the day before.|had gone|كلمة the day before تعني أن الجملة الأصلية ماضي، فتتحول لماضي تام had gone.
66. She asked her dad (can) use his laptop.|if she could|السؤال بهل يُربط بـ if ثم الفاعل ثم الفعل بالماضي could.
67. She asks her friend where she (live).|lives|إذا كان فعل القول مضارعاً (asks)، لا نغير زمن الجملة الداخلية (تظل مضارع بسيط lives).
68. Basma wondered if I (am) coming to the festival.|was|am تتحول إلى الماضي was.
69. Hatem wanted to know if Hisham (can) help him with the project.|could|can تتحول إلى الماضي could.
70. I asked him when the report (be) done.|would be|لو كان المعنى للمستقبل تتحول will be إلى would be، أو is إلى was.
71. He asked me what I (think) of his presentation.|thought|الفعل think يتحول للماضي thought.
72. They wanted to know if I (have) a bicycle.|had|الفعل have يتحول للماضي had.
73. I wondered where Sami (has met) Nabil before.|had met|المضارع التام (has met) يتحول لماضي تام (had met).
74. Azza said when they (arrived) the night before.|had arrived|the night before تدل على الماضي الذي يتحول لماضي تام (had arrived).
75. Shahd asked Salsabil what she (do) the previous week.|had done|the previous week تحول الماضي البسيط إلى ماضي تام (had done).
76. Adham asked Ziad where she (will go) the following day.|would go|the following day تحول will إلى would.
77. Ibrahim asked Marwan where he (has be) the night before.|had been|المضارع التام/الماضي يتحول لماضي تام had been.
78. Sama asked Farida which dress she (chooses).|chose / had chosen|المضارع يتحول للماضي.
79. The teacher wanted to know (where) I was late.|why|المعنى يحتاج لسؤال عن السبب: لماذا تأخرت (why).
80. The doctor asked me (when) I had taken the medicine or not.|whether|وجود or not في النهاية يجبرنا على استخدام whether بدلاً من if.
81. We (will visit) Rome before we traveled to London.|had visited|الحدث الأول قبل before يكون ماضي تام (had + pp).
82. After she (finished) packing, she called a taxi.|had finished|بعد After يأتي الماضي التام للحدث الأول.
83. (After then) she had finished packing, she called a taxi.|After|الرابط الصحيح هو After.
84. The tour guide explained that the museum (has closed) early.|had closed|في الكلام غير المباشر، المضارع التام يتحول لماضي تام.
85. Bassem watched T.V after he (was doing) his homework.|had done|الحدث الذي تم أولاً (عمل الواجب) يكون في الماضي التام had done.
86. Before the train (had arrived), we had booked our tickets.|arrived|بعد Before يأتي الماضي البسيط (الحدث الثاني).
87. Last week, my grandpa (given) me a present.|gave|Last week تدل على الماضي البسيط (التصريف الثاني gave).
88. I (met) him before he came to our school.|had met|الحدث الأول قبل before يكون ماضي تام had met.
89. Last summer, I (plan) a perfect beach vacation in Hawaii.|planned|Last summer تدل على الماضي البسيط.
90. Yesterday, I (book) flights.|booked|Yesterday تدل على الماضي البسيط.
91. Last week, I (reserve) a hotel.|reserved|ماضي بسيط لوجود Last week.
92. Earlier, I (research) all the best beaches.|had researched|كلمة Earlier تدل على حدث أقدم (ماضي تام).
93. When I (arrive) at the airport, I discovered that I (forget) my passport at home!|arrived / had forgotten|وصلت (ماضي بسيط arrived)، اكتشفت أني نسيت (حدث أقدم: ماضي تام had forgotten).
94. That morning, I (miss) my flight and had to reschedule everything.|missed|سرد أحداث متتالية في الماضي يكون بالماضي البسيط.
95. During our last trip, the weather (be) perfect.|was|الماضي من be مع المفرد هو was.
96. After we (reach) the mountain village, it (got) completely dark.|had reached / got|بعد After ماضي تام (had reached)، والحدث الثاني ماضي بسيط (got).
97. We (not expect) the journey to take so long because we (never travel) on such difficult roads before.|didn't expect / had never traveled|لم نتوقع (ماضي بسيط منفي didn't expect) لأننا لم نسافر من قبل (حدث أقدم: ماضي تام had never traveled).
98. He got up, opened the door, and (leave).|left|سرد أحداث متتالية في الماضي (ماضي بسيط left).
99. Yesterday, I (meet) Adham at the market.|met|Yesterday تدل على الماضي البسيط.
100. When he arrived, I (do) my homework.|was doing / had done|لو كنت مستمراً في الواجب وقت وصوله (was doing)، ولو أنهيته قبل وصوله (had done).
101. My father said, "(To switch) off the lights."|Switch|الجملة الأمرية المباشرة تبدأ بمصدر الفعل (Switch).
102. The teacher told the students (not start talking) during the test.|not to start talking|الأمر المنفي غير المباشر يربط بـ (not to + المصدر).
103. The manager (said us) to finish the report by 5 p.m.|told us|told يأتي بعدها مفعول (us)، أما said فلا ياتي بعدها مفعول مباشرة.
104. The policeman ordered me (to stopped) right there.|to stop|بعد to الفعل يكون في المصدر.
105. The coach ordered the players (run) faster.|to run|فعل الأمر المثبت يربط بـ (to + المصدر).
106. She told me (don't) to talk during the meeting.|not|الأمر المنفي يربط بـ not to وليس don't to.
107. The teacher told me (sitting) down.|to sit|نربط بـ to + المصدر.
108. The officer ordered us (not parking) there.|not to park|النهي يربط بـ not to + المصدر.
109. She commanded me (stop) talking.|to stop|الأمر يربط بـ to + المصدر.
110. He ordered the soldiers (stand) at attention.|to stand|نفس القاعدة (to + المصدر).
111. The teacher told the students (handed) in their assignments.|to hand|نفس القاعدة.
112. The doctor (suggested) the patient to rest for a few days.|advised / told|suggested يتبعها v+ing أو that فاعل، الأصح هنا advised (نصح) لأنه يوجد مفعول ثم to.
113. She advised me (do) my homework.|to do|نربط بـ to + المصدر.
114. Mother told me (not come) late.|not to come|النهي يربط بـ not to + المصدر.
115. The teacher told us (to writing) the lesson.|to write|بعد to نضع الفعل في المصدر.
116. Jana told Malk to (came) on time.|come|بعد to فعل في المصدر.
117. My grandma told me (not to) cook well.|to|السياق إيجابي (أن أطبخ جيداً) لذا نستخدم to بدلاً من not to.
118. The doctor (suggested) me to take the medicine on time.|advised / told|لأن suggest لا يأتي بعدها مفعول به مباشر ثم to، الأصح advised.
119. The teacher (promised) the students to stay in their seats.|ordered / told|المعلم يأمر (ordered) الطلاب بالبقاء.
120. My friend (offered) me that we should go to the cinema.|suggested to|الاقتراح بـ that نستخدم معه suggested.
121. The policeman (said) the driver to stop the car.|ordered / told|لأنه يوجد مفعول (the driver) نستخدم told أو ordered بدلاً من said.
122. She warned me (for not touching) the hot stove.|not to touch|التحذير يُربط بـ not to + المصدر.`;

const rawRewrite = `1. He used to ride his bike to school. (not)|He didn't use to ride his bike to school.|لنفي (used to) نستخدم (didn't use to).
2. She used to live in Luxor. (Where)|Where did she use to live?|للسؤال بكلمة استفهام نضع (Where + did + الفاعل + use to).
3. No, he didn't use to travel alone. (Did)|Did he use to travel alone?|سؤال بهل نلغي No ونبدأ بـ Did ثم نرجع الفعل لمصدره (use).
4. My father doesn't smoke any more. (used)|My father used to smoke.|لم يعد يدخن (doesn't smoke anymore) تعني أنه كان معتاداً في الماضي (used to).
5. It was her habit to sleep early every night. (used)|She used to sleep early every night.|كانت عادتها (was her habit) نستبدلها بـ used to.
6. Ali didn't use to drink fizzy drinks when he was young. (never)|Ali never used to drink fizzy drinks when he was young.|نفي used to يمكن أن يكون بـ never used to.
7. She was very shy when she was a child. (used to)|She used to be very shy when she was a child.|الفعل الأساسي was، مصدره be فوضعه بعد used to يجعله (used to be).
8. We were close friends in the past. (used)|We used to be close friends in the past.|في الماضي كنا (were)، المصدر be بعد used to.
9. A festival is a special event. People celebrate it every year. (which)|A festival is a special event which people celebrate every year.|نربط الجملتين بـ which ونحذف الضمير (it) العائد على الحدث.
10. The teacher explained the tradition. Students asked about it. (that)|The teacher explained the tradition that students asked about.|نربط بـ that التي تحل محل غير العاقل ونحذف (it).
11. I met a journalist. He writes articles about the environment. (who)|I met a journalist who writes articles about the environment.|نحذف الفاعل العاقل (He) ونضع مكانه who.
12. Cairo is the largest city in Egypt. We live in it. (where)|Cairo where we live is the largest city in Egypt.|where تدل على المكان فنحذف حرف الجر (in) والضمير (it).
13. His wife is a very social lady. He respects his wife. (who)|His wife who he respects is a very social lady.|نربط الجملة بـ who ونحذف المفعول العاقل المكرر.
14. His favorite hobby is to write poetry. (enjoy)|He enjoys writing poetry.|الفعل enjoy يأتي بعده الفعل مضافاً له ing.
15. Let's play chess. (He suggested)|He suggested playing chess.|الفعل suggest يأتي بعده v+ing.
16. The students have done the exercise. (finished)|The students finished doing the exercise.|الفعل finish يأتي بعده v+ing ومصدر done هو do فتصبح doing.
17. Could you turn the light off, please? (mind)|Do you mind turning the light off?|الطلب المؤدب بـ Do you mind يتبعه الفعل + ing.
18. She said that she didn't break the glass. (She denied)|She denied breaking the glass.|الفعل deny (ينكر) يأتي بعده v+ing.
19. Why don't we go to the theatre? (I suggested)|I suggested going to the theatre.|suggest يتبعه v+ing كبديل للاقتراح.
20. The thief said that he had stolen the jewellery. (admitted)|The thief admitted stealing the jewellery.|الفعل admit (يعترف) يتبعه v+ing.
21. He didn't want to come to the meeting. (refused)|He refused to come to the meeting.|الفعل refuse (يرفض) يتبعه to + المصدر.
22. It's not a good idea to smoke cigarettes. (avoid)|You should avoid smoking cigarettes.|الفعل avoid (يتجنب) يتبعه v+ing.
23. You shouldn't park here. (avoid)|You should avoid parking here.|نفس القاعدة، avoid يتبعه v+ing.
24. I no longer borrow books from the library. (stopped)|I stopped borrowing books from the library.|الفعل stop عندما يعني الامتناع النهائي يتبعه v+ing.
25. They finished making the bed early. (managed to)|They managed to make the bed early.|الفعل manage يتبعه to + المصدر.
26. It is not a good idea to waste your time. (avoid)|You must avoid wasting your time.|avoid يتبعه v+ing.
27. She said that she didn't break the vase. (denied)|She denied breaking the vase.|deny يتبعه v+ing.
28. I am sorry that I didn't study hard for the exam. (regret)|I regret not studying hard for the exam.|الندم على فعل شيء في الماضي regret + v+ing، وفي النفي regret not + v+ing.
29. "Shall I open the window for you?" said Ali. (offered)|Ali offered to open the window for me.|offer يتبعه to + المصدر، وهو يعبر عن تقديم عرض.
30. "How do Arctic foxes survive in their habitats?" (The student asked ...)|The student asked how Arctic foxes survived in their habitats.|نحذف الأقواس و do ونحول الفعل survive للماضي survived.
31. "Do penguins migrate south?" (She wanted to know...)|She wanted to know if penguins migrated south.|سؤال بهل نربط بـ if، نحذف do ونحول الفعل migrate للماضي migrated.
32. "How do camels store water?" (He asked ...)|He asked how camels stored water.|نحذف do ونحول الفعل الأساسي للماضي.
33. "Can polar bears swim long distances?" (They wondered...)|They wondered if polar bears could swim long distances.|نربط بـ if ونقدم الفاعل polar bears على can ونحولها للماضي could.
34. "Why do some animals hibernate?" (The teacher asked ...)|The teacher asked why some animals hibernated.|نربط بأداة الاستفهام why ونحول الفعل للماضي.
35. Abdo asked me, "Where have you spent the holiday?" (I)|Abdo asked me where I had spent the holiday.|نربط بـ where ونحول المضارع التام (have spent) لماضي تام (had spent).
36. Hana asked Basmalla, "What did you buy last week?" (the week before)|Hana asked Basmalla what she had bought the week before.|تحويل السؤال غير المباشر: الفاعل ثم الماضي التام (لأن السؤال ماضي did) وتحويل last week لـ the week before.
37. Eman asked Mariam, "When will you finish?" (would)|Eman asked Mariam when she would finish.|نربط بـ when، نقدم الفاعل، ونحول will إلى would.
38. She asked, "Do you like pizza?" (She asked me....)|She asked me if I liked pizza.|سؤال بهل يربط بـ if والمضارع (like) يصبح ماضي (liked).
39. My friend asked me if I lived in Cairo. ("Do.....?")|"Do you live in Cairo?" my friend asked me.|تحويل عكسي للمباشر: نضع الأقواس، نستخدم Do للمضارع، ونعيد الفعل للمصدر.
40. The coach asked me if I had played the match well. (Did.....?)|"Did you play the match well?" the coach asked me.|تحويل عكسي: الجملة الغير مباشرة ماضي تام، إذن السؤال الأصلي كان بالماضي البسيط Did.
41. The man said to the girl, "Do you need any help?" (if)|The man asked the girl if she needed any help.|نربط بـ if ونحول need للماضي needed.
42. We ate dinner. We went for a walk. (After)|After we had eaten dinner, we went for a walk.|الحدث الأول (العشاء) يصبح ماضي تام (had eaten) بعد After.
43. I had never seen such beautiful mountains so I was surprised (because)|I was surprised because I had never seen such beautiful mountains.|السبب يوضع بعد because ويكون في الماضي التام لأنه الحدث الأقدم.
44. We arrived at the stop, then the bus left. We didn't catch it. (Before)|Before we arrived at the stop, the bus had left.|الحدث الثاني (الوصول) يأتي بعد Before بالماضي البسيط، والحدث الأول (مغادرة الباص) ماضي تام.
45. We had already visited five countries before we went to Italy. (after)|After we had already visited five countries, we went to Italy.|بعد After نضع الحدث الأقدم وهو الماضي التام.
46. We arrived at the station. The train had already left. (After)|After the train had already left, we arrived at the station.|القطار غادر أولاً، فنضعه كحدث أقدم (ماضي تام) بعد After.
47. He finished his homework and then he watched TV. (before)|Before he watched TV, he had finished his homework.|قبل الحدث الثاني (before + ماضي بسيط)، يكون الحدث الأول ماضي تام.
48. First, she ate her breakfast, then she went to the park. (before)|Before she went to the park, she had eaten her breakfast.|نفس القاعدة: before + ماضي بسيط، ثم ماضي تام.
49. He visited Rome before he knew the best places to eat. (After)|After he had visited Rome, he knew the best places to eat.|الحدث الذي تم أولاً نضعه بعد After في صيغة الماضي التام.
50. He was tired. He had studied all night. (because)|He was tired because he had studied all night.|المبرر أو الحدث الأول يوضع بعد because كـ ماضي تام.
51. After finishing his homework, he went to play football. (had)|After he had finished his homework, he went to play football.|استبدلنا (v+ing) بعد After بفاعل ثم ماضي تام (had + pp).
52. By the time we arrived, the train had left the station. (until)|We didn't arrive until the train had left the station.|قاعدة until: قبلها ماضي بسيط غالباً منفي، وبعدها ماضي تام.
53. The teacher said, "Close your books." (The teacher told us ...)|The teacher told us to close our books.|الأمر الإيجابي يربط بـ to + المصدر.
54. My mother said, "Help your brother with his homework." (My mother told me ...)|My mother told me to help my brother with his homework.|نربط الجملة الأمرية المباشرة بـ to.
55. The coach said to the players, "Run faster!" (ordered)|The coach ordered the players to run faster.|تستخدم ordered للأمر المباشر ونربط بـ to.
56. Our manager said, "Send the report by Monday." (told us...)|Our manager told us to send the report by Monday.|أمر مباشر يربط بـ to + المصدر.
57. The doctor said to me, "Take this medicine twice a day." (The doctor told me ...)|The doctor told me to take this medicine twice a day.|تعليمات الطبيب تربط كأمر أو نصيحة بـ to + المصدر.
58. The mother said, "Finish your homework before dinner." (The mother told me ...)|The mother told me to finish my homework before dinner.|نربط الأمر بـ to.
59. "Don't touch the hot stove." The father said. (The father warned me ...)|The father warned me not to touch the hot stove.|النهي المنفي يربط بـ not to + المصدر.
60. "Drink plenty of water every day." The doctor said. (advised)|The doctor advised me to drink plenty of water every day.|النصيحة تربط بـ to + المصدر.`;

const rawReadComplete = [
    { 
        words: ["spirit", "competitions", "basketball", "inspiration", "teams"], 
        answers: ["basketball", "competitions", "spirit", "inspiration"], 
        text: "Many young people enjoy playing {1} because it is a fast and exciting sport. Schools often hold {2} where teams try to win and show their skills. What makes the game special is not only winning, but also the {3} of teamwork and cooperation. Many athletes say that their {4} comes from watching professional players and learning from them.", 
        expl: "استخدم المعنى: 1. رياضة تلعب (basketball)، 2. مسابقات تُقام (competitions)، 3. روح الفريق (spirit)، 4. إلهام من اللاعبين (inspiration)." 
    },
    { 
        words: ["carnival", "traditions", "connected", "families", "festival"], 
        answers: ["traditions", "families", "festival", "carnival", "connected"], 
        text: "Every country has its own {1} that show its culture and history. In Egypt, for example, {2} come together to celebrate different events each year. One popular {3} is held in spring when people enjoy food, music, and dancing. Another exciting {4} takes place in the streets with colorful clothes and songs. These celebrations make people feel {5} and proud of their culture.", 
        expl: "1. تقاليد تعكس الثقافة (traditions). 2. عائلات تتجمع (families). 3. مهرجان الربيع (festival). 4. كرنفال الشوارع (carnival). 5. يشعرون بالترابط (connected)." 
    },
    { 
        words: ["jungle", "treasures", "courage", "encourage", "shelter"], 
        answers: ["jungle", "treasures", "shelter", "courage"], 
        text: "The explorers entered the deep {1} in search for the hidden {2}. They built a small {3} to protect themselves from the heavy rain and wild animals. It was great {4} to continue their journey, but they never gave up.", 
        expl: "1. غابة عميقة (jungle). 2. كنوز مخفية (treasures). 3. بنوا مأوى (shelter) للحماية. 4. الشجاعة العظيمة (courage)." 
    },
    { 
        words: ["survive", "feathers", "store", "shells", "scarce"], 
        answers: ["feathers", "store", "scarce", "shells"], 
        text: "Camels are amazing animals that live in the desert. Unlike birds that have {1} camels have thick fur to protect them from the sun. They can {2} fat in their humps, which helps them when food and water become {3}. Although they don't have {4} like tortoises, their tough skin protects them well. These features help them survive in very difficult conditions for a long time.", 
        expl: "1. ريش الطيور (feathers). 2. يخزن الدهون (store). 3. عندما يندر الماء (scarce). 4. أصداف مثل السلاحف (shells)." 
    },
    { 
        words: ["safari", "holiday", "water", "snorkeling", "reefs"], 
        answers: ["holiday", "snorkeling", "reefs", "water"], 
        text: "Last winter, I went with my cousins to Hurghada. It was an amazing {1} that I will never forget. On the second day, we tried {2}. The fish and coral {3} looked beautiful under the {4} in the clear sea. Later, we went on a desert safari and enjoyed riding camels.", 
        expl: "1. عطلة مذهلة (holiday). 2. الغوص (snorkeling). 3. الشعاب المرجانية (coral reefs). 4. تحت الماء (under the water)." 
    },
    { 
        words: ["problem", "inspire", "decision", "solve", "communication"], 
        answers: ["communication", "solve", "problem", "inspire"], 
        text: "I always try to be a helpful person. To do this, I improve my {1} skills by talking clearly and listening to others. I like to work with my friends to {2} any {3} we face at school. I also want to {4} my classmates to do better in their studies. Decision making helps us choose the best solutions in different situations.", 
        expl: "1. مهارات التواصل (communication skills). 2. يحل (solve) يتبعها مفعول هو 3. المشكلة (problem). 4. يُلهم زملاءه (inspire)." 
    },
    {
        words: ["hide", "thick", "miles", "demonstrate", "strength"],
        answers: ["hide", "miles", "demonstrate", "strength", "thick"],
        text: "1. The soldier's uniform allowed him to {1} in the forest.\n2. The school is five {2} from my house.\n3. The teacher will {3} how to solve the problem.\n4. Running a marathon needs a lot of {4}.\n5. The forest is so {5} that little sunlight gets through.",
        expl: "استخدم المعنى: 1. الزي سمح له بالتخفي (hide)، 2. مسافة خمسة أميال (miles)، 3. المعلم سيوضح/يشرح (demonstrate)، 4. الماراثون يحتاج للكثير من القوة (strength)، 5. غابة كثيفة (thick)."
    },
    {
        words: ["continents", "countries", "Athletes", "event", "sports"],
        answers: ["event", "Athletes", "sports", "continents"],
        text: "The Olympic Games are the most famous sport {1} in the world. Today, they are held every four years in different countries. {2} come together to compete in many {3} such as football, swimming, athletics and gymnastics. The Olympic flag, with its five rings, represents the five {4} of the world united in friendship.",
        expl: "استخدم المعنى: 1. حدث رياضي (event)، 2. الرياضيون يتجمعون (Athletes)، 3. الكثير من الرياضات (sports)، 4. القارات الخمس (continents)."
    },
    {
        words: ["health", "exercise", "old", "strength", "enjoy"],
        answers: ["old", "exercise", "strength", "health", "enjoy"],
        text: "Sports are very important for people of all ages. Both the young and the {1} can take part in games and activities that make life more active and fun. Regular {2} helps the body stay strong and keeps the mind fresh. Playing football, swimming, or even walking gives people more {3} to do their daily tasks. Sport is not only good for physical {4} but also helps people meet friends and work as a team. Many people also {5} watching sport together, which makes it a social activity.",
        expl: "استخدم المعنى: 1. الصغار والكبار (old)، 2. التمارين المنتظمة (exercise)، 3. تعطيهم مزيداً من القوة (strength)، 4. الصحة البدنية (health)، 5. يستمتعون بمشاهدة (enjoy)."
    },
    {
        words: ["Festivals", "communities", "gather", "celebration", "value", "gathering"],
        answers: ["communities", "celebration", "gathering", "Festivals", "gather", "value"],
        text: "Italy is a country rich in traditions that bring families and {1} together. One of the most famous traditions is the {2} of food. Italians enjoy long family {3} often starting with pasta and ending with coffee. Every region has its own special dishes, such as pizza in Naples and risotto in Milan. {4} are also an important part of Italian culture. At Easter, people share special cakes, and at Christmas, families {5} to exchange gifts. Weddings, too, are celebrated with music, dancing, and big feasts. These traditions show how much Italians {6} family, history, and joyful gatherings.",
        expl: "استخدم المعنى: 1. تجمع المجتمعات (communities)، 2. الاحتفال بالطعام (celebration)، 3. التجمعات العائلية (gathering)، 4. المهرجانات (Festivals)، 5. تتجمع العائلات (gather)، 6. يقدرون قيمة (value)."
    },
    {
        words: ["champion", "reflect", "knight", "customize", "harmony"],
        answers: ["knight", "champion", "reflect", "harmony"],
        text: "1. A brave warrior who served a king or queen was known as a {1}.\n2. The Olympic gold medalist was welcomed as a true {2} after winning the race.\n3. After the difficult meeting, the manager needed time to {3} on the decisions made.\n4. The team coach wants to create {4} between the players.",
        expl: "استخدم المعنى: 1. المحارب الشجاع يسمى فارس (knight)، 2. الفائز بالذهبية هو بطل (champion)، 3. يحتاج وقتاً ليتأمل/يفكر (reflect)، 4. يخلق انسجاماً وتناغماً (harmony)."
    },
    {
        words: ["challenging", "unforgettable", "together", "breathtaking", "unexpected"],
        answers: ["breathtaking", "challenging", "unexpected", "unforgettable", "together"],
        text: "Last summer, my family and I went on a camping trip in the forest. The place was {1} with tall green trees and birds singing everywhere. Setting up the tent was a bit {2} but we were excited. While enjoying our picnic, something {3} happened. A hungry monkey suddenly appeared and tried to steal fruit from our basket. I jumped to scare it away, but I slipped and fell, which made everyone laugh. The monkey ran off with an apple, and I felt very embarrassed. It was an {4} day that we still talk about and laugh at {5}.",
        expl: "استخدم المعنى: 1. مكان يخطف الأنفاس (breathtaking)، 2. نصب الخيمة كان صعباً/يمثل تحدياً (challenging)، 3. حدث شيء غير متوقع (unexpected)، 4. يوم لا يُنسى (unforgettable)، 5. نضحك عليه معاً (together)."
    },
    {
        words: ["struggled", "southward", "solo", "landmarks", "determined", "memorable"],
        answers: ["solo", "determined", "struggled", "southward", "memorable", "landmarks"],
        text: "1. He played {1} music in front of the class.\n2. He was {2} to finish his project on time.\n3. The boy {3} to carry the heavy box.\n4. The travelers moved {4} toward the mountains.\n5. Visiting Luxor is the most {5} visit in my life.\n6. We visited famous {6} like the Cairo Tower.",
        expl: "استخدم المعنى: 1. موسيقى منفردة (solo)، 2. كان مُصمماً على (determined)، 3. كافح/عانى لحمل الصندوق (struggled)، 4. تحركوا باتجاه الجنوب (southward)، 5. زيارة لا تُنسى/لا تُمحى من الذاكرة (memorable)، 6. معالم بارزة ومشهورة (landmarks)."
    },
    {
        words: ["unforgettable", "breathtaking", "bound", "slippery", "struggled", "solo", "landmarks"],
        answers: ["breathtaking", "unforgettable", "slippery", "solo", "landmarks", "struggled"],
        text: "1. The view from the top of the mountain was absolutely {1}.\n2. The trip to Paris was {2} because I saw the Eiffel Tower for the first time.\n3. Be careful when walking on the wet floor; it's very {3}.\n4. She decided to take a {4} journey across the desert on her camel.\n5. The tourists visited famous {5} like the Pyramids and the Great Wall of China.\n6. They {6} to reach to the top of the mountain.",
        expl: "استخدم المعنى: 1. منظر يخطف الأنفاس (breathtaking)، 2. رحلة لا تُنسى (unforgettable)، 3. الأرضية المبللة زلقة (slippery)، 4. رحلة فردية (solo)، 5. معالم سياحية (landmarks)، 6. كافحوا للوصول للقمة (struggled)."
    },
    {
        words: ["modesty", "motivated", "empathy", "guide", "conflict"],
        answers: ["guide", "empathy", "motivated", "modesty", "conflict"],
        text: "1. The teacher will {1} the students through the science project.\n2. She showed {2} when her friend was sad.\n3. The team was {3} to win the game.\n4. He won the race but showed {4} by saying, 'I was just lucky'.\n5. The {5} between the two team members was solved after they understood each other's point of view.",
        expl: "استخدم المعنى: 1. المعلم سيوجه ويرشد (guide)، 2. أظهرت التعاطف (empathy)، 3. الفريق كان متحمساً/متحفزاً (motivated)، 4. أظهر التواضع (modesty)، 5. الخلاف/الصراع (conflict)."
    },
    {
        words: ["communication", "problem", "cooperation", "decision", "inspire", "achieve"],
        answers: ["communication", "cooperation", "problem", "inspire", "decision", "achieve"],
        text: "My Leadership Goal\nI want to become a better leader. To do this, I will improve my {1} skills by working with my team and listening to everyone's ideas. I will focus on team {2} and help solve any {3} we face together. I also want to {4} others by encouraging them to do their best. {5} making is important, so I will practice making choices that help the group. In the future, I hope to be a leader who helps others {6} their goals.",
        expl: "استخدم المعنى: 1. مهارات التواصل (communication)، 2. التعاون الجماعي (cooperation)، 3. حل أي مشكلة (problem)، 4. يُلهم الآخرين (inspire)، 5. عملية صنع القرار (decision)، 6. تحقيق أهدافهم (achieve)."
    }
];


function cleanUpText(text) {
    return text
        .replace(/<\/?span[^>]*>/gi, '')
        .replace(/\bstart span\b/gi, '')
        .replace(/\bend span\b/gi, '') 
        .replace(/\bspan\b/gi, '')      
        .replace(/ {2,}/g, ' ')       
        .trim();
}

const rawStoryChoose = cleanUpText(`1. At dawn, they finally reached the ...|mountain|road|ship|shore|shore| (shore) . (النص الأصلي يشير للشاطئ).
2. Captain Nemo hinted at forgotten civilizations swallowed by the ...|earth|storms|waves|mountains|waves|ابتلعتها الأمواج (waves).
3. ... began to admire Nemo, at the same time he feared him.|Jules|Ned Land|Aronnax|Conseil|Aronnax|البروفيسور أروناكس (Aronnax) كان معجبا به ويخافه في نفس الوقت.
4. The crew attacked the creature with cannon fire and ...|harpoons|arrows|nets|axes|harpoons|استخدموا الحِرَاب (harpoons) لمهاجمة الوحش.
5. Nemo attacked ... without hesitation.|submarines|towers|warships|waves|warships|هاجم السفن الحربية (warships) بلا تردد.
6. ... recorded everything making use of the chance to study marine life.|Conseil|Professor Aronnax|Captain Nemo|Ned Land|Professor Aronnax|البروفيسور (Aronnax) استغل الفرصة لدراسة الحياة البحرية.
7. Nautilus looked like a floating ... under the water.|library|farm|palace|home|palace|كانت الغواصة نوتيلوس كالقصر العائم (palace).
8. Conseil remained ... to Aronnax.|lazy|loyal|confused|afraid|loyal|ظل كونساي مخلصا (loyal) لأروناكس.
9. Conseil and Ned Land became part of the ...|army|debate|invention|crew|crew|أصبحا جزءا من طاقم الغواصة (crew).
10. The submarine got stuck under ...|rocks|ice|sand|seaweed|ice|علقت الغواصة تحت الجليد (ice).
11. Nemo kept his past completely ...|open|hidden|funny|beautiful|hidden|أبقى ماضيه مخفيا (hidden).
12. The sea creature was described as ...|marvelous|slow|friendly|tiny|marvelous|وُصف بأنه رائع / مذهل (marvelous).
13. Nemo declared that the ... was his only homeland.|land|sea|island|wind|sea|أعلن أن البحر (sea) هو وطنه الوحيد.
14. The Nautilus was attacked by a ...|shark|squid|whale|turtle|squid|تعرضت لهجوم من حبار ضخم (squid).
15. Captain Nemo's silence about his past and motives filled them with ...|love|curiosity|fear|anger|curiosity|صمته ملأهم بالفضول (curiosity).
16. When warships appeared on the surface, Nemo ...|ran away|felt comfortable|attacked them|helped them|attacked them|هاجم السفن الحربية (attacked them).
17. The companions saw ... glowing with color through the great observation windows.|fish|coral reefs|shipwrecks|sharks|coral reefs|رأوا الشعاب المرجانية (coral reefs) الملونة.
18. Professor Aronnax was invited to join the ...|party|voyage|army|flight|voyage|تمت دعوته لرحلة استكشافية (voyage).
19. Nemo showed them valuable ... collected from the sea.|plants|treasures|bottles|letters|treasures|أراهم كنوزا قيمة (treasures).
20. The crew feared losing ...|fuel|oxygen|food|light|oxygen|خاف الطاقم من نفاد الأكسجين (oxygen).
21. Aronnax realized that Nemo saw himself as part of the ...|underground|prison|dead world|scientific research|dead world|كان نيمو يرى نفسه جزءا من العالم الميت/المنعزل (dead world).
22. The crew worked hard to break a ... in the ice to the surface.|bridge|path|land|hole|hole|عملوا على فتح حفرة (hole) في الجليد.
23. Professor Aronnax accepted to be on the Nautilus because of his ...|honesty|curiosity|fear|desire|curiosity|قبل البقاء بسبب فضوله العلمي (curiosity).
24. Ned Land believed they were ... on the Nautilus.|guests|prisoners|workers|visitors|prisoners|ند لاند كان يعتقد أنهم سجناء (prisoners).
25. Nautilus could travel very long distances without ...|fuel|masters|gold|surfacing|surfacing|السفر لمسافات طويلة دون الصعود للسطح (surfacing).
26. The monster was actually a ...|whale|submarine|boat|machine|submarine|الوحش كان في الحقيقة غواصة (submarine).
27. The men collected ... from strange underwater plants.|samples|metals|shells|bones|samples|جمعوا عينات (samples).
28. They secretly left the Nautilus in a small ...|boat|submarine|river|rocket|boat|هربوا في قارب صغير (boat).
29. Professor Aronnax was a French ... invited to join the voyage.|captain|harpooner|marine scientist|ruler|marine scientist|كان عالما بحريا (marine scientist).
30. Nautilus was powered by ... so it could travel long distances.|wind|water|electricity|money|electricity|كانت تعمل بالكهرباء (electricity).
31. Newspapers described the monster as marvelous and ...|bright|friendly|terrifying|hard|terrifying|الصحف وصفت الوحش بأنه رائع ومخيف (terrifying).
32. A voyage was launched to capture or kill the ...|submarine|beast|killers|sail|beast|تم إطلاق الرحلة للقبض على الوحش (beast).
33. Professor Aronnax was a French marine ...|officer|servant|sailor|scientist|scientist|كان أروناكس عالم بحار (scientist).
34. They swam toward the ... creature struggling to survive.|impatient|mysterious|loyal|glowing|mysterious|سبحوا نحو المخلوق الغامض (mysterious).
35. They discovered the glowing shape was a ...|ship|whale|beast|submarine|submarine|اكتشفوا أن الشكل اللامع كان غواصة (submarine).
36. Ned Land was a Canadian ...|marine scientist|sailor|harpooner|beast|harpooner|ند لاند كان صائد حيتان (harpooner).
37. ... was a mysterious man with a strong will and deep knowledge.|Ned Land|Captain Nemo|Conseil|Nautilus|Captain Nemo|كابتن نيمو (Captain Nemo) كان رجلاً غامضاً.
38. Once they accepted to stay aboard, they could never return to ...|water|prison|land|palace|land|بمجرد بقائهم، لن يعودوا أبداً إلى اليابسة (land).
39. Professor Aronnax accepted to stay his entire life on ...|Nautilus|science fiction|palace|space|Nautilus|قبل البقاء طوال حياته على الغواصة نوتيلوس (Nautilus).
40. Ned valued ... so he wanted to escape.|loyalty|science fiction|pearls|freedom|freedom|كان ند لاند يقدر الحرية (freedom).
41. Nemo invited his guests on ...|luxury dinners|diving voyages|science experiments|picnics|diving voyages|دعاهم إلى رحلات غوص (diving voyages).
42. They wore special ... to allow them to walk over the sea bed.|boots|jackets|masks|suits|suits|ارتدوا بدلات (suits) خاصة للمشي في قاع البحر.
43. They hunted and collected samples from the underwater ...|shipwrecks|ocean|forest|whales|forest|جمعوا عينات من الغابة (forest) المغمورة.
44. Nemo hinted that some forgotten civilizations swallowed by the ...|waves|science|Captain Nemo|Ned Land|waves|ألمح إلى أن حضارات منسية ابتلعتها الأمواج (waves).
45. Ned Land was ... at first but he missed freedom.|careful|worried|nervous|excited|excited|كان متحمساً (excited) في البداية لكنه افتقد الحرية.
46. ... killed the monster bravely.|Nemo|Aronnax|Conseil|Ned Land|Ned Land|ند لاند (Ned Land) قتل الوحش بشجاعة.
47. Nemo showed calm and courage yet also a cold indifference to ...|the crew|dangers|scientific research|human life|human life|أظهر لامبالاة باردة تجاه حياة البشر (human life).
48. The ocean was a ... for Nemo.|battlefield|school|path|prison|battlefield|كان المحيط بمثابة ساحة معركة (battlefield) لنيمو.
49. ... was determined to learn the truth about Nemo.|Conseil|Ned Land|Verne|Aronnax|Aronnax|أروناكس (Aronnax) كان مصمماً على معرفة الحقيقة.
50. Captain Nemo was a man of wealth, education, and ...|determination|sorrow|hesitation|humor|sorrow|كان رجل ثروة وتعليم وحزن (sorrow).
51. Ned planned to ...|lead|discover underworld|escape|kill Nemo|escape|خطط ند لاند للهروب (escape).
52. Aronnax was torn between scientific discovery and ...|Nemo|wealth|his family|freedom|freedom|كان ممزقاً بين الاكتشاف العلمي والحرية (freedom).
53. Nemo guided the submarine through a ... of sunken ships.|graveyard|museum|home|world|graveyard|قاد الغواصة عبر مقبرة (graveyard) سفن غارقة.
54. What was the main motivation of the characters when they secretly lowered a small boat into sea?|To escape their enemies.|To find treasure.|To seek freedom.|To explore new lands.|To seek freedom.|كان دافعهم هو البحث عن الحرية (To seek freedom).
55. How was the weather described during their escape attempt?|Dangerous and stormy.|Calm and peaceful.|Clear and sunny.|Foggy and cloudy.|Dangerous and stormy.|كان الطقس خطيراً وعاصفاً (Dangerous and stormy).
56. What happened at dawn after the storm?|They reached the shore.|The boat sank.|They were captured.|They turned back to the submarine.|They reached the shore.|وصلوا إلى الشاطئ (They reached the shore) عند الفجر.
57. What was the final lesson learned by Aronnax about human knowledge?|It can solve all problems.|It cannot achieve true freedom.|It can achieve great things but is limited.|It is useless in the ocean.|It can achieve great things but is limited.|أن المعرفة تحقق أشياء عظيمة لكنها محدودة.
58. ... wrote down their incredible adventures.|Ned Land|Captain Nemo|Conseil|Aronnax|Aronnax|أروناكس (Aronnax) هو من دوّن المغامرات.
59. The three companions drifted away because of the ...|earthquake|storm|flood|mankind|storm|جرفتهم العاصفة (storm) بعيداً.`);

const rawStoryQuestions = cleanUpText(`1. Why was the voyage launched?|To search for and destroy the mysterious sea monster that was attacking ships.|للبحث عن الوحش البحري الغامض وتدميره.
2. How did the companions see Nemo's character?|They saw him as a genius but mysterious and sometimes cruel person.|رأوه عبقريا ولكنه غامض وقاس أحيانا.
3. How did the newspapers describe the monster?|They described it as a giant, marvelous, and fast sea creature.|وصفته بأنه مخلوق عملاق، رائع، وسريع جدا.
4. Why do you think Captain Nemo chose to keep Aronnax and his friends on the Nautilus instead of sending them back to land?|Because he wanted to keep his submarine and his underwater life a secret.|لأنه أراد الحفاظ على سرية غواصته وحياته تحت الماء.
5. Why did some sailors doubt the monster's existence?|Because they hadn't seen it themselves and thought it was just a myth or a floating island.|لأنهم لم يروه بأنفسهم وظنوا أنه خرافة أو جزيرة عائمة.
6. In your opinion, what was the biggest danger of staying on the Nautilus?|The biggest danger was losing their freedom and being part of Nemo's dangerous attacks.|أكبر خطر كان فقدان حريتهم والتورط في هجمات نيمو.
7. Do you think life on the Nautilus is better or worse than life on land?|It depends. It is better for discovering marine life, but worse because of the lack of freedom.|حسب الرأي: أفضل لاكتشاف البحر، وأسوأ لغياب الحرية.
8. Why did Ned Land believe they were prisoners, not guests?|Because they were not allowed to leave the submarine and return to their homes.|لأنه لم يُسمح لهم بمغادرة الغواصة والعودة لأوطانهم.
9. How was the Nautilus different from a ship?|It was a submarine that traveled under the water, powered by electricity, and provided everything needed for life.|غواصة تسير تحت الماء وتعمل بالكهرباء.
10. Do you think Captain Nemo's calmness was a key factor in their survival? Why?|Yes, his calmness helped him make the right decisions during dangerous situations like the ice trap.|نعم، هدوؤه ساعده في اتخاذ قرارات صحيحة في المواقف الخطرة.
11. Where did the ship search for the monster?|It searched in the oceans where the monster was reported to be seen.|في المحيطات التي شوهد فيها الوحش.
12. Why do you think Captain Nemo's past was kept a secret?|Because he had suffered deeply on land and wanted to cut all ties with humanity.|لأنه عانى كثيرا وأراد قطع كل صلاته بالبشر.
13. What do you know about Professor Pierre Aronnax?|He is a famous French marine scientist who was invited to join the expedition to hunt the monster.|عالم بحار فرنسي شهير تمت دعوته لاصطياد الوحش.
14. Does the sea symbolize freedom or danger in the story? Why?|It symbolizes both. Freedom for Nemo to live away from society, and danger due to monsters and ice.|يرمز للاثنين: الحرية لنيمو، والخطر بسبب الكائنات والجليد.
15. What was the main risk faced by Captain Nemo and his crew?|The main risk was getting trapped in the ice and running out of oxygen.|الخطر الأكبر كان العلوق في الجليد ونفاد الأكسجين.
16. Why do you think the sailors were so fascinated with the idea of a sea monster?|Because it moved faster than whales and smashed ships with terrible force.|لأن الوحش كان يتحرك أسرع من الحيتان ويحطم السفن بقوة رهيبة.
17. Why do you think some sailors doubted the existence of the sea monster while others were determined to capture it?|Some doubted because they didn't find anything, while others were determined to capture it.|بعضهم شك لأنهم لم يجدوا شيئًا بينما كان آخرون مصممين على الإمساك به.
18. How did the description of the monster create a sense of fear and wonder among the crew?|Because the monster was powerful and dangerous but also amazing and new.|لأنه كان قويا وخطيرا لكنه كان مدهشا وجديدا عليهم.
19. What do you think the importance of the "public debate" over the sea monster's existence was?|It was important because it led to launching a voyage to find the monster.|كانت مهمة لأنها تسببت في إطلاق رحلة بحرية للعثور على الوحش.
20. In your opinion, how might the voyage to capture the sea monster affect the relationships between the crew members?|It made them work together to find the monster.|جعلتهم يعملون معًا للعثور على الوحش.
21. Where did the ship search for the monster?|Across the Pacific.|عبر المحيط الهادئ.
22. How did the crew react when the glowing shape appeared?|They chased it desperately and fired cannons and harpoons.|طاردوه بشكل يائس وأطلقوا المدافع والحراب.
23. Why did Ned Land dislike the situation while Aronnax was fascinated?|Aronnax loved science and discovery, while Ned Land loved freedom and adventure on land.|كان أروناكس يحب العلم والاكتشاف، بينما كان ند لاند يحب الحرية والمغامرة على اليابسة.
24. Do you think it was fair for Captain Nemo to keep the men on the Nautilus forever? Why or why not?|It was not fair because they didn't choose to stay and they lost their freedom.|لم يكن عادلاً لأنهم لم يختاروا البقاء وفقدوا حريتهم.
25. In what way could life on the Nautilus be better or worse than life on land? Give examples.|Better because they can explore the deep sea, but worse because they lost freedom.|أفضل لأنهم يستطيعون استكشاف أعماق البحر، لكنها أسوأ لأنهم فقدوا حريتهم.
26. How might life under the sea change the behavior and feelings of the captives over time?|They might feel curious at first, but later become stressed or desperate to return home.|قد يشعرون بالفضول في البداية، ولكن لاحقًا قد يصبحون متوترين أو يائسين للعودة إلى الوطن.
27. Why was Ned Land so restless and angry about being aboard the ship?|Because he valued freedom above all and wanted to escape.|لأنه كان يقدر الحرية فوق كل شيء ويريد الهرب.
28. How was life on the Nautilus?|It was astonishing, like a floating palace under water.|كانت مدهشة كقصر عائم تحت الماء.
29. What treasures did Nemo show them from the sea?|Pearls, gold and ancient artifacts.|لآلئ وذهب وقطع أثرية قديمة.
30. What do you think Aronnax felt when he first saw the underwater wonders?|He felt great amazement and excitement while watching coral reefs, fish, and shipwrecks.|شعر باندهاش وحماس شديد وهو يشاهد الشعاب المرجانية والأسماك وحطام السفن.
31. Why do you think Nemo wanted them to join the diving voyages using special suits?|He wanted them to explore the deep sea themselves, not just watch from the windows.|أراد منهم استكشاف أعماق البحر بأنفسهم وليس فقط المشاهدة من النوافذ.
32. How might visiting the ruins of a sunken city change their understanding of forgotten civilizations?|It showed them that great civilizations could disappear and be swallowed by the sea.|أظهرت لهم أن حضارات عظيمة يمكن أن تختفي ويبتلعها البحر.
33. How do you think Conseil's calmness and accuracy helped during their underwater exploration, compared to Ned Land's impatience?|Conseil supported Aronnax calmly, while Ned Land wanted freedom and became impatient.|كان كونساي يدعم أروناكس بهدوء، بينما كان ند لاند يريد الحرية وأصبح غير صبور.
34. Why did Aronnax record everything carefully and Conseil name each creature accurately?|Because Aronnax wanted scientific knowledge and Conseil was helpful and exact.|لأن أروناكس أراد المعرفة العلمية وكونساي كان مساعدًا ودقيقا.
35. How did Conseil support Aronnax underwater?|He named each sea creature accurately.|كان يسمي كل كائن بحري بدقة.
36. Why did Ned Land become impatient?|He missed freedom.|لأنه افتقد الحرية.
37. Why did professor Aronnax find the chance to study marine life so exciting, and how did he take this opportunity?|Because no scientist had ever had that chance, so he observed and wrote down every detail.|لأن لم يحصل عالم على تلك الفرصة من قبل، لذلك كان يراقب ويدوّن كل التفاصيل.
38. If you were a crew member, how would you have reacted to the dangers described in the text?|I would feel scared but try to stay calm and help the crew.|سأشعر بالخوف، لكنني سأحاول أن أبقى هادئا وأساعد بقية الطاقم.
39. Why do you think Captain Nemo was able to stay calm during such difficult situation?|Because he trusted his ship and his crew.|لأنه كان يثق في سفينته وطاقمه.
40. Do you think Captain Nemo's calmness was a key factor in their survival? Why/Why not?|Yes, because it helped everyone stay focused and act wisely.|نعم، لأنه ساعد الجميع على التركيز والتصرف بحكمة.
41. If Captain Nemo had panicked, how might the crew's chances of survival have changed?|The crew might have made mistakes and failed to escape.|ربما كان سيرتكب الطاقم أخطاء ويفشل في الهروب.
42. Do you think it was right for Nemo to risk the crew's lives when fighting the squid? Why?|No, because they could have killed them.|لا لأنهم ربما سيتعرضون للقتل.
43. What dangers did the Nautilus face during its journey?|It was attacked by a giant squid and trapped beneath thick ice.|هاجمها حبار عملاق، وعلقت تحت جليد سميك.
44. How did the crew manage to survive the attacks from the giant squid?|By fighting bravely with axes and harpoons.|بالقتال بشجاعة مستخدمين الفؤوس والرماح.
45. What was Captain Nemo's role in facing the dangers on the submarine?|He showed courage and calm leadership, guiding his crew through danger.|أظهر شجاعة وقيادة هادئة في قيادة طاقمه خلال الخطر.
46. Why do you think Captain Nemo kept his past hidden?|Because it was full of pain and he didn't want to remember it.|لأنه كان مليء بالألم ولا يريد تذكره.
47. Why do you think Captain Nemo chose to fight against cruelty?|Because humans treated him cruelly before.|لأن البشر عاملوه بقسوة من قبل.
48. Nemo attacked warships without hesitation. Do you think this makes him a hero or a dangerous man? Why?|A hero to the sea, but dangerous to men on land.|كان بطلا تجاه البحر ولكن خطير على البشر على اليابسة.
49. Conseil was torn between discovery and freedom. If you were in his place, which would you choose, and Why?|I would choose freedom because it is more important.|سأختار الحرية لأنها أكثر أهمية.
50. Why do you think Nemo saw the graveyard of ships as part of his world?|Because he felt connected to those who suffered like him.|لأنه يشعر بأنه مرتبط بمن عانوا مثله.
51. What does Ned Land's attitude tell you about his character?|He loves freedom and refuses to give up.|يحب الحرية ويرفض الاستسلام.
52. What did Ned Land decide to do while living on the Nautilus?|He planned to escape because he thought they were prisoners.|خطط للهروب لأنه اعتقد أنهم سجناء.
53. Why did Ned Land believe they were prisoners, not guests?|Because Nemo didn't allow them to go back to land.|لأن نيمو لم يسمح لهم بالعودة إلى اليابسة.
54. How did Aronnax feel when he saw the graveyard of sunken ships?|He felt sad and more curious about Nemo's secrets.|شعر بالحزن وازداد فضوله لمعرفة أسرار نيمو.
55. What do you think Aronnax meant by "the ocean remains vast and mysterious"?|That the sea is full of unknown secrets humans cannot reach.|إن البحر مليء بالأسرار المجهولة التي لا نصل إليها.
56. Why do you think Captain Nemo chose to isolation instead of interacting with the world?|I think he believed humans on land were cruel, and isolation protected him from pain.|أعتقد لأنه اعتقد أن البشر على اليابسة قساة، وأن العزلة تحميه من الألم.
57. Why did Aronnax agree to escape even though the plan was risky?|Because he felt trapped for months and wanted his freedom back.|لأنه شعر بأنه سجين لعدة أشهر وأراد استعادة حريته.
58. How did the storm make escaping both dangerous and possible at the same time?|It was about to damage their boat, but it also pushed them far away from the Nautilus.|لأنها كادت تدمر مركبهم لكنها ساعدتهم على الابتعاد عن الغواصة نوتيلوس.
59. Why do you think the companions felt an emotional relief when they stepped on solid land?|Because they finally felt safe and free after struggling for so long at sea.|لأنهم شعروا بالأمان والحرية بعد معاناة طويلة في البحر.
60. What did Aronnax hope to achieve by writing about their adventures?|He wanted people to learn from the wonders and dangers they had seen.|أراد أن يتعلم الناس من عجائب ومخاطر البحر التي شاهدوها.
61. How did the storm affect the companions' journey and what challenges did it present?|It made it dangerous.|جعلت الرحلة خطيرة.
62. How did the three companions feel when they finally reached the shore?|They felt safe and happy to touch solid ground again.|شعروا بالأمان والسعادة لملامسة الأرض الصلبة مجددا.
63. What did Aronnax write about?|He wrote about the wonders and dangers of the sea and Nemo's brilliance.|كتب عن عجائب البحر ومخاطره وعبقرية نيمو.`);

 
const rawDialogues = [
    {
        context: "Ahmed suggests going to the theatre. His brother Samir likes the idea.",
        q: "Samir: How will we spend the weekend?\nAhmed: 1 .................................\nSamir: OK, but 2 ............................. ?\nAhmed: I'll pay, don't worry.\nSamir: But theatre tickets have become very expensive. 3 ........................................ ?\nAhmed: I've got 40 pounds.\nSamir: That's not enough. I think 4 ....................................\nAhmed: Father? I don't think he'll give me any.\nSamir: No problem. Let it be later. We can go to the club then.\nAhmed: 5 .........................................",
        a: "1. Let's go to the theatre.\n2. I don't have money.\n3. How much do you have?\n4. You can ask father.\n5. That's a good idea.",
        expl: "اقرأ المحادثة بالكامل. سمير يسأل عن التكلفة وأحمد سيتكفل بها، ولأن 40 جنيهاً غير كافية اقترح سمير أن يطلب من والده."
    },
    {
        context: "Mohsen is having an interview for a new job.",
        q: "Abdallah: You look very smart. Why all that?\nMohsen: 1 .. ........................................\nAbdallah: 2 ................................. ?\nMohsen: Yes, I finished my university last year. I want to find a job in Egypt.\nAbdallah: Have you thought of travelling to another country?\nMohsen: 3 .. ........................................\nAbdallah: 4 .. ........................................ ?\nMohsen: No, it isn't easy to find one. I should have a lot of skills.\nAbdallah: I hope you will succeed in your interview.\nMohsen: 5 . .........................................",
        a: "1. I have an interview for a new job.\n2. Have you finished your university?\n3. No, I haven't.\n4. Is it easy to find a job there?\n5. Thank you.",
        expl: "الإجابة الأولى من السياق. الثانية استنتجناها من الرد Yes. الثالثة لأنه يفضل البقاء بمصر."
    },
    {
        context: "Leila is phoning her friend, Samia to invite her to her birthday party.",
        q: "Leila: Hello, Samia. This is Leila speaking. You know, Samia, my birthday is next Tuesday.\nSamia: Really? 1 . ......................................... ?\nLeila: Twenty-five. I'll be giving a birthday party. Are you free on that day?\nSamia: 2 .. ........................................\nLeila: I'm glad you can come.\nSamia: 3  .......................................... ?\nLeila: Only some of the closest friends.\nSamia: Do I know all of them?\nLeila: 4 .. ........................................\nSamia: What would you like for a birthday present?\nLeila: A camera if you don't mind.\nSamia: Do you need any help?\nLeila: 5 .. ........................................ Everything is now ready.",
        a: "1. How old will you be?\n2. Yes, I am free.\n3. Who are you inviting?\n4. Yes, you know them.\n5. No, thanks.",
        expl: "الرد الأول 25 يعني السؤال عن العمر. الثاني موافقة للحضور لأن ليلى سعيدة بقدومها. الثالث سؤال عن المدعوين."
    },
    {
        context: "Nora is asking Huda about her plans for the mid-year holiday.",
        q: "Nora: Hello, Huda!\nHuda: Hello, Nora!\nNora: How are you?\nHuda: 1 . .........................................\nNora: What are you going to do in the mid-year holiday?\nHuda: 2 .. ........................................\nNora: 3 ... ....................................... ?\nHuda: I will go there by train.\nNora: 4 .. ........................................ ?\nHuda: I'll stay in Luxor for two days and four days in Aswan.\nNora: Great. Have a nice holiday.\nHuda: 5 .. ........................................",
        a: "1. I'm fine, thank you.\n2. I will visit Luxor and Aswan.\n3. How will you go there?\n4. How long will you stay there?\n5. Thank you.",
        expl: "تحديد المكان ظهر من ذكر الأقصر وأسوان لاحقاً. الوسيلة بالقطار تسأل عنها بـ How، والمدة تسأل عنها بـ How long."
    },
    {
        context: "A reporter met a tourist at the Egyptian Grand Museum.",
        q: "Reporter: Pleased to meet you.\nTourist: 1  ..........................................\nReporter: 2 . ......................................... ?\nTourist: Yes, of course. Go ahead.\nReporter: Where do you come from?\nTourist: 3  ..........................................\nReporter: Paris! 4  .......................................... ?\nTourist: Yes, I like Egypt very much.\nReporter: Which places would you like to visit in Egypt?\nTourist: 5 .. ........................................",
        a: "1. Pleased to meet you too.\n2. Can I ask you some questions?\n3. I come from Paris.\n4. Do you like Egypt?\n5. I'd like to visit Luxor and Aswan.",
        expl: "تعجب المراسل بـ Paris يؤكد أن الإجابة 3 كانت باريس. والرد بـ Yes of course يدل على طلب طرح أسئلة."
    },
    {
        context: "Mr. Atef is at the mechanic's.",
        q: "Mr. Atef: Will you have a look at my motorbike, please?\nMechanic: 1  .......................................... ?\nMr. Atef: It is not running very well and it doesn't start easily.\nMechanic: 2 . ......................................... ?\nMr. Atef: Yes, it becomes hot very quickly.\nMr. Atef: 3 .. ........................................ ?\nMechanic: I will check the engine for you and find out then.\nMr. Atef: How long will it take you to repair it?\nMechanic: 4 .. ........................................ After 3 hours.\nMr. Atef: Shall I give you a call first?\nMechanic: 5  ..........................................",
        a: "1. What is the problem with it?\n2. Does it become hot quickly?\n3. What will you do?\n4. It will take 3 hours.\n5. Yes, of course.",
        expl: "يسأل الميكانيكي عن المشكلة. سؤال الميكانيكي الثاني استنتجناه من رد عاطف 'نعم، تسخن بسرعة'."
    },
    {
        context: "A lady is at the watchmaker's to repair her watch.",
        q: "Salesman: Can I help you, madam?\nLady: Well, it depends: Do you do watch-repairs?\nSalesman: 1 . .........................................\nLady: Could you examine my watch, please? It's stopped.\nSalesman: 2 . ......................................... ?\nLady: Only yesterday. Can you repair it?\nSalesman: Yes, I can, but I'm afraid you'll have to leave it.\nLady: All right. When will it be ready?\nSalesman: 3 . ......................................... Now you need a receipt.\nLady: Oh, yes. I mustn't forget that. 4 ... ....................................... ?\nSalesman: No. You won't be able to get the watch without it.\nLady: 5 . .........................................",
        a: "1. Yes, we do.\n2. When did it stop?\n3. Tomorrow.\n4. Can I get the watch without it?\n5. OK, here is the watch.",
        expl: "Only yesterday تدل على سؤال متى توقفت. سؤال السيدة 4 استنتجناه من رفض البائع إعطائها الساعة بلا إيصال."
    },
    {
        context: "Nadia and Sara are talking about the Olympic Games.",
        q: "Nadia: I'm a big fan of the Olympic Games.\nSara: Me too! 1 . ......................................... ?\nNadia: I really enjoy watching gymnastics. It requires so much skill.\nSara: 2  .......................................... It needs a lot of practice, too.\nNadia: Why do you think the Olympics are so important?\nSara: 3 .. ........................................\nNadia: That's true. Friendship and respect are good values.\nSara: 4 . ......................................... ?\nNadia: Yes, I think Egypt can host the Olympic Games.\nSara: 5 . ......................................... !",
        a: "1. What is your favourite sport?\n2. You are right.\n3. Because they teach us friendship and respect.\n4. Can Egypt host the Olympic Games?\n5. I hope so!",
        expl: "تفضيل نادية للجمباز يوضح أن سارة سألتها عن رياضتها المفضلة."
    },
    {
        context: "Habiba and Salsabil met after a long absence.",
        q: "Habiba: Hi! I haven't seen you for a long time. Where have you been?\nSalsabil: 1 . .........................................\nHabiba: How was your holiday?\nSalsabil: 2 .. ........................................\nHabiba: 3 .. ........................................ ?\nSalsabil: We went to the North Coast. It's such an amazing place.\nHabiba: Really! Did you go with your parents?\nSalsabil: 4 ... I went with my cousins.\nHabiba: 5 . ......................................... ?\nSalsabil: Yes. I took many pictures. I'll post them on my Facebook today.",
        a: "1. I have been on a holiday.\n2. It was wonderful.\n3. Where did you go?\n4. No, I didn't.\n5. Did you take any pictures?",
        expl: "الرد بالذهاب للساحل الشمالي يعني السؤال عن المكان. والرد 'ذهبت مع أولاد عمي' ينفي الذهاب مع الوالدين."
    },
    {
        context: "Sara and Nadia are talking about values.",
        q: "Sara: What values do you think are most important?\nNadia: I believe in helping others and being fair.\nSara: 1  .......................................... ?\nNadia: Fairness means treating everyone equally.\nSara: That's a good point. 2 . .........................................\nNadia: 3 . .........................................\nSara: I also believe in patience.\nNadia: 4 .. ........................................\nSara: These values help us become better people.\nNadia: 5 . .........................................\nSara: Let's share them with our classmates.",
        a: "1. What does fairness mean?\n2. What about you?\n3. Do you believe in any other values?\n4. How do these values help us?\n5. I agree. Let's share them.",
        expl: "ركز على تعريف Fairness في السطر الرابع لتستنتج السؤال الأول."
    },
    {
        context: "Mariam and Salsabil are talking about reading books.",
        q: "Mariam: Hi! What do you like doing in your free time?\nSalsabil: 1 .. ........................................\nMariam: I also enjoy reading books. 2  .......................................... ?\nSalsabil: I prefer scientific books.\nMariam: 3  ..........................................\nSalsabil: 4 . ......................................... ?\nMariam: Maybe we can read together someday.\nSalsabil: 5 .. ........................................",
        a: "1. I like reading books.\n2. What kind of books do you prefer?\n3. That's great.\n4. Can we read together?\n5. Sure, I'd love to.",
        expl: "ردت مريم 'أنا أيضاً أستمتع بالقراءة' مما يدل أن إجابة سلسبيل كانت القراءة."
    },
    {
        context: "A teacher is talking to a student who is late.",
        q: "Student: Please, sir. Can I come in?\nTeacher: Yes, you can. But why 1 . ......................................... ?\nStudent: There was an accident on the road.\nTeacher: An accident! Really?\nStudent: Yes, sir. Our bus had an accident.\nTeacher: 2 . ......................................... ?\nStudent: Badly damaged.\nTeacher: 3 . ......................................... ?\nStudent: No, but only three were injured.\nTeacher: Where did they go?\nStudent: 4  ..........................................\nTeacher: 5 .. ........................................ ?",
        a: "1. are you late?\n2. How was the bus?\n3. Did anyone die?\n4. They went to the hospital.\n5. Are you okay?",
        expl: "يسأل المعلم عن سبب التأخير، وحالة الحافلة بناء على الرد Badly damaged، والإصابات."
    },
    {
        context: "Ali wants to buy a shirt.",
        q: "Ali: Excuse me, how much is this shirt?\nSalesperson: 1 . .........................................\nAli: 2 . ......................................... ?\nSalesperson: Sure, you can try it.\nAli: It fits perfectly. I'll take it.\nSalesperson: 3 .. ........................................\nAli: 4 . .........................................\nSalesperson: I would like to pay by cash.\nAli: Here is your receipt.\nSalesperson: 5 . .........................................",
        a: "1. It is 200 pounds.\n2. Can I try it on?\n3. How would you like to pay?\n4. I will pay in cash.\n5. Thank you.",
        expl: "السؤال عن السعر How much. السؤال عن القياس بناء على رد البائع (يمكنك قياسه)."
    },
    {
        context: "Two passengers on a train.",
        q: "A: Good morning! Is this seat free?\nB: 1 . .........................................\nA: Thank you. 2 . ......................................... ?\nB: It takes about 20 minutes to reach the next station\nA: I'm new here. Can you tell me about the stops?\nB: 3 .. ........................................\nA: That's very helpful. Are there any restaurants near the station?\nB: 4 . .........................................\nA: Thank you very much.\nB: 5 . .........................................",
        a: "1. Yes, it is.\n2. How long does it take to reach the next station?\n3. Yes, there are three stops.\n4. Yes, there are many restaurants.\n5. You're welcome.",
        expl: "الإجابة بـ 20 دقيقة تدل على سؤال عن المدة (How long)."
    },
    {
        context: "Hassan and Mohamed are talking about the weekend.",
        q: "Hassan: What did you do last week?\nMohamed: 1 .. ........................................\nHassan: 2  .......................................... ?\nMohamed: I went to the fair with my family.\nHassan: 3 . ......................................... ?\nMohamed: We played and spent a nice time.\nHassan: Next time I will go with you.\nMohamed: 4 . .........................................",
        a: "1. I went to the fair.\n2. Who did you go with?\n3. What did you do there?\n4. You are welcome.",
        expl: "الرد بأنهم ذهبوا للملاهي مع العائلة هو مفتاح أسئلة المكان والأشخاص (Who)."
    }
];

const parsedChoose = rawChoose.split('\n').filter(Boolean).map(line => {
    let p = line.split('|'); return { type: 'choose', q: p[0], options: [p[1], p[2], p[3], p[4]], a: p[5], expl: p[6] };
});

const parsedCorrect = rawCorrect.split('\n').filter(Boolean).map(line => {
    let p = line.split('|'); return { type: 'correct', q: p[0], a: p[1], expl: p[2] };
});

const parsedRewrite = rawRewrite.split('\n').filter(Boolean).map(line => {
    let p = line.split('|'); return { type: 'rewrite', q: p[0], a: p[1], expl: p[2] };
});

const parsedStoryChoose = rawStoryChoose.split('\n').filter(Boolean).map(line => {
    let p = line.split('|'); return { type: 'choose', q: p[0], options: [p[1], p[2], p[3], p[4]], a: p[5], expl: p[6] };
});

const parsedStoryQuestions = rawStoryQuestions.split('\n').filter(Boolean).map(line => {
    let p = line.split('|'); return { type: 'rewrite', q: p[0], a: p[1], expl: p[2] };
});

const parsedReadComplete = rawReadComplete.map((item, i) => {
    let txt = item.text;
    item.answers.forEach((ans, j) => {
        txt = txt.replace(`{${j+1}}`, `<span class='drop-zone' data-answer='${ans}' ondrop='drop(event)' ondragover='allowDrop(event)' onclick='clickZone(this)'></span>`);
    });
    return { type: 'read_complete', title: "Text " + (i + 1), words: item.words, text: txt, blankCount: item.answers.length, expl: item.expl };
});

const parsedDialogues = rawDialogues.map(d => {
    let formattedQ = d.context ? `<div class="dialogue-context">📌 ${d.context}</div>` : '';
    let lines = d.q.split('\n');
    lines.forEach(line => {
        let match = line.match(/^([^:]+):(.*)$/);
        if(match) {
            formattedQ += `<div class="dialogue-line"><span class="speaker-name">${match[1]}:</span>${match[2]}</div>`;
        } else {
            formattedQ += `<div class="dialogue-line">${line}</div>`;
        }
    });
    let formattedA = d.a.split('\n').map(line => `<div>${line}</div>`).join('');
    return { type: 'dialogue', q: `<div class="dialogue-wrapper">${formattedQ}</div>`, a: formattedA, expl: d.expl };
});

const quizData = [
    { id: "choose_tab", title: "Choose", sectionTitle: "Choose the correct answer", questions: parsedChoose },
    { id: "correct_tab", title: "Correct", sectionTitle: "Complete with the correct form", questions: parsedCorrect },
    { id: "rewrite_tab", title: " Rewrite", sectionTitle: "Rewrite using the word in brackets", questions: parsedRewrite },
    { id: "story_tab", title: "Story  📖", sectionTitle: "The Story: 20,000 Leagues Under the Sea", questions: [...parsedStoryChoose, ...parsedStoryQuestions] },
    { id: "read_complete_tab", title: "Complete ", sectionTitle: "Drag & Drop", isDragDrop: true, questions: parsedReadComplete },
    { id: "dialogues_tab", title: "Dialogues💬", sectionTitle: "Complete Dialogues", questions: parsedDialogues },
    { id: "starred_tab", title: "Difficult Questions⭐", sectionTitle: "الأسئلة التي قمت بتحديدها لمراجعتها", questions: [], isStarTab: true }
];

let qIndex = 0;
quizData.forEach(tab => {
    tab.questions.forEach(q => {
        q.uid = 'q_' + qIndex++;
        window.allQuestionsMap[q.uid] = q;
    });
});

const tabButtonsContainer = document.getElementById('tabButtons');
const tabContentsContainer = document.getElementById('tabContents');

function buildQuestionElement(item, isStarredTab = false) {
    if(!isStarredTab) {
        if(item.type === 'choose' || item.type === 'read_complete') window.maxPossibleScore += (item.blankCount || 1);
        else window.maxPossibleScore += 1;
    }

    const qContainer = document.createElement('div');
    qContainer.className = 'q-container';
    qContainer.id = `container_${item.uid}_${isStarredTab ? 'star' : 'main'}`;

    const isStarred = window.starredQuestions.some(sq => sq.uid === item.uid);
    const starBtn = document.createElement('div');
    starBtn.className = 'star-btn ' + (isStarred ? 'active-star' : '');
    starBtn.innerHTML = '⭐';
    starBtn.onclick = function() { toggleStar(this, item.uid); };
    qContainer.appendChild(starBtn);

    if (item.type === 'read_complete') {
        const qTitle = document.createElement('h3');
        qTitle.style.color = 'var(--gold)'; qTitle.style.marginTop = '0';
        qTitle.textContent = item.title;
        qContainer.appendChild(qTitle);

        const wordBank = document.createElement('div');
        wordBank.className = 'word-bank';
        const shuffledWords = [...item.words].sort(() => Math.random() - 0.5);
        shuffledWords.forEach(word => {
            const wordEl = document.createElement('div');
            wordEl.className = 'drag-word'; wordEl.draggable = true;
            wordEl.ondragstart = drag; wordEl.onclick = () => selectWord(wordEl);
            wordEl.textContent = word; wordBank.appendChild(wordEl);
        });
        qContainer.appendChild(wordBank);

        const qText = document.createElement('p');
        qText.className = 'question-text'; qText.innerHTML = item.text;
        qContainer.appendChild(qText);

        const explDiv = document.createElement('div');
        explDiv.className = 'read-complete-expl';
        explDiv.innerHTML = `<div class="answer-wrapper"><p class="reason-text">💡 <b>تلميح:</b> ${item.expl}</p></div>`;
        qContainer.appendChild(explDiv);
    } 
    else if (item.type === 'choose') {
        const qText = document.createElement('p');
        qText.className = 'question-text'; qText.innerHTML = item.q;
        qContainer.appendChild(qText);

        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'options-grid';
        
        const ansDiv = document.createElement('div');
        ansDiv.className = 'answer';
        ansDiv.innerHTML = `<div class="answer-wrapper"><p class="reason-text">💡 <b>تلميح:</b> ${item.expl}</p></div>`;
        
        item.options.forEach(opt => {
            const optBtn = document.createElement('button');
            optBtn.className = 'option-btn'; optBtn.textContent = opt;
            optBtn.onclick = function(e) {
                if(this.classList.contains('disabled') || this.classList.contains('correct')) return;
                if (this.parentElement.dataset.answered) return;
                this.parentElement.dataset.answered = "true";

                Array.from(optionsGrid.children).forEach(b => b.classList.add('disabled'));

                if(opt === item.a) {
                    this.classList.add('correct');
                    if(!isStarredTab) window.totalScore++;
                    playApplause(); burstExplosion(e.clientX, e.clientY);
                    ansDiv.classList.add('visible'); 
                } else {
                    this.classList.add('incorrect');
                    Array.from(optionsGrid.children).forEach(b => { if(b.textContent === item.a) b.classList.add('correct'); });
                    ansDiv.classList.add('visible'); 
                }
            };
            optionsGrid.appendChild(optBtn);
        });
        qContainer.appendChild(optionsGrid);
        qContainer.appendChild(ansDiv);
    } 
    else { 
        const qText = document.createElement('p');
        qText.className = 'question-text'; qText.innerHTML = item.q;
        qContainer.appendChild(qText);

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn-show'; toggleBtn.innerHTML = '👁️ إظهار الإجابة والتقييم';

        const ansDiv = document.createElement('div');
        ansDiv.className = 'answer';
        ansDiv.innerHTML = `
            <div class="answer-wrapper">
                <p class="answer-text">Answer: <br>${item.a}</p>
                <p class="reason-text">💡 <b>تلميح:</b> ${item.expl}</p>
            </div>
            <div class="self-grade-container">
                <p>قيّم إجابتك لتُحسب لك درجتها بكل أمانة:</p>
                <div class="grade-buttons">
                    <button class="grade-btn correct-btn" onclick="gradeSelf(this, true)">✅ إجابتي صحيحة</button>
                    <button class="grade-btn wrong-btn" onclick="gradeSelf(this, false)">❌ إجابتي خاطئة</button>
                </div>
            </div>
        `;

        toggleBtn.onclick = () => {
            ansDiv.classList.toggle('visible');
            toggleBtn.innerHTML = ansDiv.classList.contains('visible') ? '🙈 إخفاء الإجابة' : '👁️ إظهار الإجابة والتقييم';
        };

        qContainer.appendChild(toggleBtn);
        qContainer.appendChild(ansDiv);
    }

    return qContainer;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.target === tabId) btn.classList.add('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if(content.id === tabId) content.classList.add('active');
    });

    if(tabId === 'starred_tab') {
        const starContent = document.getElementById('starred_tab');
        starContent.querySelectorAll('.q-container').forEach(e => e.remove());
        
        if(window.starredQuestions.length === 0) {
            const msg = document.createElement('p');
            msg.className = 'q-container'; msg.style.textAlign = 'center';
            msg.innerHTML = "لم تقم بتحديد أي أسئلة بعد. اضغط على ⭐ بجوار أي سؤال لإضافته هنا.";
            starContent.appendChild(msg);
        } else {
            window.starredQuestions.forEach(q => { starContent.appendChild(buildQuestionElement(q, true)); });
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('searchInput').value = '';
    searchQuestions();
}

quizData.forEach((page, index) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${index === 0 ? 'active' : ''} ${page.isStarTab ? 'star-tab' : ''}`;
    btn.textContent = page.title; btn.dataset.target = page.id;
    btn.onclick = () => switchTab(page.id);
    tabButtonsContainer.appendChild(btn);

    const contentDiv = document.createElement('div');
    contentDiv.className = `tab-content ${index === 0 ? 'active' : ''}`;
    contentDiv.id = page.id;

    const title = document.createElement('h2');
    title.className = 'section-title'; title.innerHTML = page.sectionTitle;
    contentDiv.appendChild(title);

    if (page.isDragDrop) {
        const instructionsP = document.createElement('p');
        instructionsP.style.color = '#fbbf24'; instructionsP.style.textAlign = 'center';
        instructionsP.style.fontWeight = 'bold'; instructionsP.innerHTML = "👆 اسحب الكلمة لمكانها الصحيح.";
        contentDiv.appendChild(instructionsP);
    }

    page.questions.forEach(item => { contentDiv.appendChild(buildQuestionElement(item, false)); });
    tabContentsContainer.appendChild(contentDiv);
});

function searchQuestions() {
    const filter = document.getElementById('searchInput').value.toLowerCase();
    const activeTabContent = document.querySelector('.tab-content.active');
    if (!activeTabContent) return;

    activeTabContent.querySelectorAll('.q-container').forEach(div => {
        div.style.display = div.innerText.toLowerCase().includes(filter) ? "block" : "none";
    });
}

window.addEventListener("load", () => {
    const accessDenied = document.getElementById("access-denied");
    const pageContent = document.getElementById("page-content");

    if (!window.Auth) {
        accessDenied.style.display = "block";
        return;
    }

    window.Auth.checkAccess({ requireAdmin: false }).then((result) => {
        if (!result.allowed) {
            accessDenied.style.display = "block";
            return;
        }

        pageContent.style.display = "block";
    });
});
