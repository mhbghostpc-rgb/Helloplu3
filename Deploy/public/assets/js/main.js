const { useState, useEffect } = React;

// ==========================================
// 📚 Grammar Database - Updated Notes
// ==========================================
const courseData = {
    "Unit 7": {
        title: "\"Used to\" for past habits",
        learn: [
            { id: 1, title: "الإثبات (Affirmative Statements)", rule: "Subj. الفاعل + used to + inf. المصدر", notes: "للتعبير عن عادة كانت تحدث في الماضي وتوقفت الآن.", eg: "Mr. Moheb Mousa used to eat a lot of sweets when he was a child." },
            { id: 2, title: "النفي (Negative Statements)", rule: "Subj. الفاعل + didn't + use to + inf. المصدر", notes: "لاحظ رجوع الفعل للمصدر (use) بدون d بعد didn't.", eg: "She didn't use to drink tea." },
            { id: 3, title: "النفي باستخدام (Never)", rule: "Subj. الفاعل + never + used to + inf.", notes: "ملحوظة هامة: في حالة النفي باستخدام never، تظل used to كما هي ولا نحذف حرف الـ d.", eg: "He started to drink tea nowadays. ➔ He never used to drink tea in the past." },
            { id: 4, title: "سؤال بهل (Yes/No question)", rule: "Did + subj. الفاعل + use to + inf. المصدر ?", notes: "الإجابة تكون بـ Yes, I did أو No, I didn't.", eg: "Did you use to swim when you were a child?" },
            { id: 5, title: "سؤال بأداة استفهام (Wh-question)", rule: "Q.W. كلمة استفهام + did + subj. الفاعل + use to + inf. المصدر ?", notes: "نفس تركيب سؤال هل مع وضع أداة الاستفهام في البداية.", eg: "What did you use to play when you were a child?" }
        ],
        examples: [
            { q: "She (not use) to drink coffee when she was young.", a: "didn't use to", exp: "في حالة النفي بنستخدم didn't وبعدها الفعل في المصدر use to بدون حرف الـ d." },
            { q: "He never (use) to play football in the street.", a: "used", exp: "بما إننا نفينا بـ never، يبقى الفعل بيفضل زي ما هو في الماضي used to." }
        ],
        practice: {
            choose: [
                { q: "Mona didn't ... to drink tea.", options: ["used", "use", "uses", "using"], ans: 1 },
                { q: "He never ... to smoke in the past.", options: ["use", "used", "uses", "using"], ans: 1 },
            ],
            correct: [
                { q: "Did you used to sleep early?", ans: "use to" },
                { q: "Omar never use to play tennis.", ans: "used to" }
            ],
            rewrite: [
                { q: "He started to drink tea nowadays. (used to)", ans: "He never used to drink tea in the past." },
                { q: "He no longer smokes. (used to)", ans: "He used to smoke." }
            ]
        }
    },
    "Unit 8": {
        title: "Defining Relative Clauses",
        learn: [
            { id: 1, title: "للعاقل (who / that)", rule: "who \"for people\"", notes: "تستخدم لتحل محل الفاعل أو المفعول العاقل.", eg: "This is Mr. Moheb Mousa who helped me yesterday." },
            { id: 2, title: "لغير العاقل (which / that)", rule: "which \"for things\"", notes: "تستخدم لتحل محل الأشياء والحيوانات.", eg: "The mobile which I bought was smart." },
            { id: 3, title: "للمكان (where)", rule: "where \"for places\"", notes: "تساوي which + in/at. لا نستخدم where إذا كان هناك حرف جر يعود على المكان.", eg: "This is the shop where I buy sweets. (or: which I buy sweets in)" },
            { id: 4, title: "للزمان (when)", rule: "when \"for time\"", notes: "تستخدم لربط الجمل التي تدل على الوقت.", eg: "Ramadan is the month when we fast." },
            { id: 5, title: "للملكية (whose)", rule: "whose", notes: "تأتي بين اسمين، الاسم الثاني يخص الأول (يحل محل صفات الملكية).", eg: "The man whose meetings are interesting met me yesterday." }
        ],
        examples: [
            { q: "This is the hospital (where / which) my father works in.", a: "which", exp: "طالما موجود حرف الجر in في آخر الجملة أو قبل النقط، لازم نستخدم which ومينفعش نستخدم where." },
            { q: "The man (who / which) we saw yesterday is my uncle.", a: "who", exp: "The man عاقل، فبنستخدم ضمير الوصل who." }
        ],
        practice: {
            choose: [
                { q: "This is the person ... helped me yesterday.", options: ["which", "who", "where", "when"], ans: 1 },
                { q: "This is the hospital in ... my father works.", options: ["where", "which", "who", "that"], ans: 1 }
            ],
            correct: [
                { q: "The mobile who I bought was smart.", ans: "which" },
                { q: "This is the shop which I buy sweets.", ans: "where" }
            ],
            rewrite: [
                { q: "This is the school. I learn here. (where)", ans: "This is the school where I learn." },
                { q: "I met the boy. His father is a doctor. (whose)", ans: "I met the boy whose father is a doctor." }
            ]
        }
    },
    "Unit 9": {
        title: "Verbs + infinitive / -ing form",
        learn: [
            { id: 1, title: "أفعال يتبعها (to + inf)", rule: "agree, arrange, ask, choose, decide, expect, encourage, invite, fail, help, hope, intend, need, learn, manage, offer, plan, promise, refuse, threaten, want, wish.", notes: "جميع هذه الأفعال يأتي بعدها الفعل في المصدر مسبوقاً بـ to.", eg: "My neighbor agreed to water my plants when we were away." },
            { id: 2, title: "أفعال يتبعها (inf + ing)", rule: "avoid, consider, deny, dislike, enjoy, finish, imagine, include, keep, mind, practice, recommend, suggest, admit.", notes: "جميع هذه الأفعال يأتي بعدها الفعل مضافاً له ing.", eg: "You should avoid going out late at night." },
            { id: 3, title: "أفعال يتبعها الاثنان مع اختلاف المعنى", rule: "remember, forget, stop, try", notes: "مثال: remember to bring (يتذكر أن يفعل لسه هيعمله) / remember waking up (يتذكر أنه فعل الشيء مسبقاً الحدث تم).", eg: "Remember to bring your homework tomorrow." }
        ],
        examples: [
            { q: "I remember (to visit / visiting) the Pyramids when I was 5 years old.", a: "visiting", exp: "بما إن الحدث حصل في الماضي (لما كان عمري 5 سنين)، بنستخدم الفعل + ing لأن معناه يتذكر أنه عمل الشيء ده في الماضي." },
            { q: "He promised (buying / to buy) me a present.", a: "to buy", exp: "الفعل promise من المجموعة الأولى اللي بييجي بعدها to + المصدر دايماً." }
        ],
        practice: {
            choose: [
                { q: "My neighbor agreed ... my plants.", options: ["water", "to water", "watering", "watered"], ans: 1 },
                { q: "You should avoid ... out late at night.", options: ["to go", "go", "going", "goes"], ans: 2 },
            ],
            correct: [
                { q: "I enjoy to play chess with Mr. Moheb.", ans: "playing" },
                { q: "She refused helping me.", ans: "to help" }
            ],
            rewrite: [
                { q: "I suggest that we play a game. (playing)", ans: "I suggest playing a game." },
                { q: "It is important that you remember to call him. (Don't forget)", ans: "Don't forget to call him." }
            ]
        }
    },
    "Unit 10": {
        title: "Reported Questions",
        learn: [
            { id: 1, title: "تحويل أفعال القول", rule: "say to ➔ ask | said to ➔ asked", notes: "في السؤال المباشر بنحول فعل القول إلى سأل (asked / wondered / inquired / wanted to know).", eg: "He said to me ➔ He asked me" },
            { id: 2, title: "السؤال بـ هل (Yes / No Questions)", rule: "asked + if / whether + فاعل + فعل ماضي", notes: "نحذف الأقواس، ونربط بـ if أو whether، ثم نرتب الجملة (فاعل ثم فعل) ونحول الأزمنة للماضي.", eg: "She asked if I liked ice cream." },
            { id: 3, title: "سؤال بأداة استفهام (Wh-Questions)", rule: "asked + أداة الاستفهام + فاعل + فعل ماضي", notes: "نحذف الأقواس، ونربط بنفس أداة الاستفهام الموجودة (When, Where, Why...)، ونجيب الفاعل الأول وبعدين الفعل في الماضي.", eg: "He asked when the test was." }
        ],
        examples: [
            { q: "\"Do you like chess?\" he said to me.", a: "He asked me if I liked chess.", exp: "حولنا said to إلى asked، وربطنا بـ if عشان السؤال بيبدأ بـ Do (هل)، وشيلنا Do وعكسنا خلينا الفاعل الأول I وبعدين الفعل ماضي liked." },
            { q: "\"Where are you going?\" Mr. Moheb said.", a: "Mr. Moheb asked where I was going.", exp: "نزلنا أداة الاستفهام where زي ما هي، وحولنا are you إلى I was (فاعل ثم فعل في الماضي)." }
        ],
        practice: {
            choose: [
                { q: "She asked ... I liked ice cream.", options: ["weather", "if", "that", "to"], ans: 1 },
                { q: "He asked me ... the test was.", options: ["when", "if", "that", "to"], ans: 0 },
            ],
            correct: [
                { q: "He asked me what was my name.", ans: "what my name was" },
                { q: "She asked if I will come.", ans: "would" }
            ],
            rewrite: [
                { q: "\"Are you happy?\" she said to me. (asked)", ans: "She asked me if I was happy." },
                { q: "\"Where do you live?\" he said. (wanted to know)", ans: "He wanted to know where I lived." }
            ]
        }
    },
    "Unit 11": {
        title: "Past Perfect",
        learn: [
            { id: 1, title: "التكوين (Form)", rule: "had + p.p. (التصريف الثالث)", notes: "يعبر الماضي التام عن حدث وقع في الماضي قبل حدث آخر (الحدث الأول الأقدم هو الماضي التام).", eg: "Ayman had finished his work before sleeping." },
            { id: 2, title: "مجموعة (After / As soon as)", rule: "After / As soon as + Past Perfect (had+p.p) , Past Simple", notes: "دايماً بييجي بعدهم الحدث الأول (الماضي التام) وبعدين الحدث التاني (الماضي البسيط).", eg: "After Hassan had done his homework, he slept." },
            { id: 3, title: "مجموعة (Before / By the time / When)", rule: "Before / By the time / When + Past Simple , Past Perfect", notes: "دايماً بييجي بعدهم الحدث التاني (الماضي البسيط) وبعدين الحدث الأول الأقدم (الماضي التام).", eg: "Before Heba watched TV, she had washed the dishes." },
            { id: 4, title: "🚨 Very Important Note", rule: "After / Before + (v. + ing)", notes: "في حالة عدم وجود فاعل بعد الروابط (After أو Before)، يأتي الفعل مضافاً له ing (Gerund) مباشرة.", eg: "After doing his homework, Hassan slept. / Before watching TV, she had washed the dishes." }
        ],
        examples: [
            { q: "Before I went to school, I (eat) my breakfast.", a: "had eaten", exp: "Before بييجي بعدها الحدث التاني (الماضي البسيط went)، والناحية التانية بنحط الحدث الأول الأقدم (الماضي التام had + p.p)." },
            { q: "After (finish) the exam, he handed the paper.", a: "finishing", exp: "بما إنه مفيش فاعل بعد After، بنستخدم الـ Gerund ونضيف للفعل ing مباشرة." }
        ],
        practice: {
            choose: [
                { q: "After Hassan ... his homework, he slept.", options: ["does", "did", "had done", "doing"], ans: 2 },
                { q: "Before ... TV, she had washed the dishes.", options: ["watched", "had watched", "watching", "watches"], ans: 2 },
            ],
            correct: [
                { q: "After he finishes his work, he went out.", ans: "had finished" },
                { q: "After had played, he went home.", ans: "playing" }
            ],
            rewrite: [
                { q: "First he studied, then he played chess. (After)", ans: "After he had studied, he played chess." },
                { q: "I watched the movie. Before that, I had done my homework. (By the time)", ans: "By the time I watched the movie, I had done my homework." }
            ]
        }
    },
    "Unit 12": {
        title: "Reported Orders",
        learn: [
            { id: 1, title: "أفعال الأمر المباشر", rule: "We use verbs like: told, ordered, asked, advised", notes: "في حالة الأوامر أو النصيحة بنحول said to إلى أحد هذه الأفعال حسب المعنى.", eg: "The teacher said to Ali ➔ The teacher ordered Ali" },
            { id: 2, title: "الأمر المثبت (Affirmative order)", rule: "مفعول + to + inf.", notes: "بنحذف الأقواس ونربط الجملة بـ to وبعدها الفعل في المصدر.", eg: "The teacher ordered Ali to clean the board." },
            { id: 3, title: "الأمر المنفي (Negative order)", rule: "مفعول + not to + inf.", notes: "لما يكون الأمر بيبدأ بـ Don't أو Never بنربط بـ not to وبعدها المصدر.", eg: "Mother advised Mona not to waste her time." }
        ],
        examples: [
            { q: "The teacher said to Ali, 'Clean the board.'", a: "The teacher ordered Ali to clean the board.", exp: "الجملة دي أمر مثبت، عشان كدا ربطنا بـ to وبعدها المصدر clean، واستخدمنا ordered." },
            { q: "Mother said to Mona, 'Don't waste your time.'", a: "Mother advised Mona not to waste her time.", exp: "دا أمر منفي بـ Don't (نهي)، فبنربط بـ not to وبعدها المصدر waste واستخدمنا advised." }
        ],
        practice: {
            choose: [
                { q: "The teacher ordered Ali ... the board.", options: ["clean", "to clean", "cleaning", "cleans"], ans: 1 },
                { q: "Mother advised Mona ... waste her time.", options: ["to not", "not", "not to", "don't"], ans: 2 }
            ],
            correct: [
                { q: "He told me don't sleep late.", ans: "not to sleep" },
                { q: "Mr. Moheb advised me study hard.", ans: "to study" }
            ],
            rewrite: [
                { q: "\"Close the door,\" he said to Ali. (ordered)", ans: "He ordered Ali to close the door." },
                { q: "\"Don't play in the street,\" she said. (told)", ans: "She told me not to play in the street." }
            ]
        }
    }
};

const App = () => {
    const [activeUnit, setActiveUnit] = useState("Unit 7");
    const [activeSubTab, setActiveSubTab] = useState("learn");
    const [practiceMode, setPracticeMode] = useState("choose");

    // Practice States
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [showTextInputAns, setShowTextInputAns] = useState(false);

    // States for Examples reveal
    const [revealedExamples, setRevealedExamples] = useState({});

    const triggerConfetti = () => {
        confetti({
            particleCount: 100, spread: 70, origin: { y: 0.6 },
            colors: ['#d4af37', '#f3e5ab', '#aa771c', '#ffffff']
        });
    };

    const resetPracticeState = () => {
        setCurrentQ(0);
        setSelectedOpt(null);
        setIsChecking(false);
        setTextInput("");
        setShowTextInputAns(false);
    };

    useEffect(() => {
        resetPracticeState();
        setRevealedExamples({});
    }, [activeUnit, activeSubTab, practiceMode]);

    const currentData = courseData[activeUnit];

    // =========================================================
    // Render Functions 
    // =========================================================

    const renderLearnTab = () => (
        <div className="space-y-6 fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black cinzel-text gold-text drop-shadow-md">
                    {currentData.title}
                </h2>
                <div className="h-1 w-32 gold-gradient mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                {currentData.learn.map((step) => (
                    <div key={step.id} className="glass-card p-6 relative hover:-translate-y-1 transition-transform">
                        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full gold-gradient text-black font-black flex items-center justify-center text-2xl shadow-[0_0_15px_#d4af37]">
                            {step.id}
                        </div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-4 pr-4">{step.title}</h3>
                        
                        <div className="bg-black/50 p-4 rounded-lg mb-4 border border-gray-700" dir="ltr">
                            <p className="en-text text-white font-bold text-lg text-center tracking-wide">{step.rule}</p>
                        </div>
                        
                        <p className="text-gray-300 font-semibold mb-4 text-sm leading-relaxed">📝 {step.notes}</p>
                        
                        <div className="bg-yellow-900/20 border-r-4 border-yellow-500 p-3 rounded-l-lg" dir="ltr">
                            <p className="en-text text-yellow-100 italic">" {step.eg} "</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderExamplesTab = () => (
        <div className="space-y-6 fade-in max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black cinzel-text text-white">Solved Examples</h2>
                <p className="text-yellow-400 mt-2 font-semibold">اضغط على الكارت لإظهار الإجابة والتفسير</p>
            </div>
            {currentData.examples.map((ex, idx) => {
                const isRevealed = !!revealedExamples[idx];
                return (
                    <div 
                        key={idx}
                        onClick={() => setRevealedExamples(prev => ({...prev, [idx]: true}))}
                        className={`glass-card p-6 reveal-card relative overflow-hidden ${isRevealed ? 'gold-border' : 'border-gray-700'}`}
                        dir="ltr"
                    >
                        <div className="absolute top-0 right-0 w-2 h-full gold-gradient"></div>
                        <div className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full gold-gradient text-black font-black flex items-center justify-center text-xl">
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-bold text-white en-text leading-relaxed">{ex.q}</h3>
                                
                                {isRevealed ? (
                                    <div className="mt-5 fade-in">
                                        <div className="bg-green-900/40 border border-green-500/50 p-4 rounded-xl mb-4">
                                            <p className="en-text text-green-400 font-bold text-xl">✅ {ex.a}</p>
                                        </div>
                                        <div className="bg-yellow-900/30 border border-yellow-600/30 p-4 rounded-xl" dir="rtl">
                                            <p className="text-yellow-100 font-bold leading-relaxed flex gap-2">
                                                <span className="text-yellow-400">💡 التفسير:</span> 
                                                {ex.exp}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-4 bg-black/30">
                                        <p className="text-gray-400 font-bold en-text flex items-center gap-2">
                                            <span>👁️</span> Click to reveal the answer & explanation
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderPracticeTab = () => {
        const practiceData = currentData.practice[practiceMode];
        const q = practiceData[currentQ];

        const handleChooseOpt = (idx) => {
            if (isChecking) return;
            setSelectedOpt(idx);
            setIsChecking(true);
            if (idx === q.ans) {
                triggerConfetti();
            }
        };

        const nextQuestion = () => {
            if (currentQ < practiceData.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelectedOpt(null);
                setIsChecking(false);
                setTextInput("");
                setShowTextInputAns(false);
            } else {
                resetPracticeState();
            }
        };

    const handleCheckText = () => {
        if(!textInput.trim() && !showTextInputAns) {
            setShowTextInputAns(true);
            return;
        }
        setShowTextInputAns(true);
        if(textInput.toLowerCase().trim() === q.ans.toLowerCase().trim()) {
            triggerConfetti();
        }
    };

        return (
            <div className="fade-in max-w-3xl mx-auto">
                <div className="flex flex-wrap justify-center gap-3 mb-10" dir="ltr">
                    {['choose', 'correct', 'rewrite'].map(mode => (
                        <button 
                            key={mode}
                            onClick={() => setPracticeMode(mode)}
                            className={`px-6 py-2 rounded-full font-bold en-text capitalize transition-all border ${practiceMode === mode ? 'gold-gradient text-black border-transparent shadow-[0_0_10px_#d4af37]' : 'bg-transparent text-gray-400 border-gray-600 hover:text-yellow-400 hover:border-yellow-400'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-6" dir="ltr">
                    <h3 className="text-xl font-bold text-yellow-400 en-text capitalize flex items-center gap-2">
                        <span>🎯</span> {practiceMode} Mode
                    </h3>
                    <div className="bg-black text-yellow-500 px-4 py-1 rounded-full text-sm font-bold border border-yellow-600">
                        {currentQ + 1} / {practiceData.length}
                    </div>
                </div>

                <div className="glass-card p-8 relative" dir="ltr">
                    <h4 className="text-2xl font-bold text-white en-text mb-8 leading-relaxed">
                        {q.q}
                    </h4>

                    {practiceMode === 'choose' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, idx) => {
                                let btnClass = "py-4 px-6 rounded-xl font-bold text-lg en-text border-2 transition-all ";
                                if (!isChecking) {
                                    btnClass += "bg-black/40 border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 cursor-pointer";
                                } else {
                                    if (idx === q.ans) btnClass += "bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                                    else if (selectedOpt === idx) btnClass += "bg-red-600/20 border-red-500 text-red-400";
                                    else btnClass += "bg-black/20 border-gray-800 text-gray-600 cursor-not-allowed";
                                }
                                return (
                                    <button key={idx} disabled={isChecking} onClick={() => handleChooseOpt(idx)} className={btnClass}>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {(practiceMode === 'correct' || practiceMode === 'rewrite') && (
                        <div className="space-y-6">
                            <input 
                                type="text" 
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                disabled={showTextInputAns}
                                placeholder="Type your answer here..."
                                className={`w-full p-4 rounded-xl text-lg en-text font-bold gold-input ${showTextInputAns && textInput.toLowerCase().trim() === q.ans.toLowerCase().trim() ? '!border-green-500 !text-green-400' : ''}`}
                            />
                            
                            {showTextInputAns && (
                                <div className="bg-green-900/30 border border-green-500 p-4 rounded-xl fade-in flex items-center gap-3">
                                    <span className="text-2xl">✅</span>
                                    <div>
                                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Correct Answer</p>
                                        <p className="text-green-400 font-bold text-xl en-text">{q.ans}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center" dir="ltr">
                    {(practiceMode === 'choose' && isChecking) || ((practiceMode === 'correct' || practiceMode === 'rewrite') && showTextInputAns) ? (
                        <button onClick={nextQuestion} className="px-8 py-3 rounded-full font-black text-lg text-black gold-gradient hover:scale-105 transition-transform shadow-[0_0_15px_#d4af37] en-text flex items-center gap-2">
                            {currentQ === practiceData.length - 1 ? 'Restart Mode 🔄' : 'Next Question ➡️'}
                        </button>
                    ) : (practiceMode === 'correct' || practiceMode === 'rewrite') ? (
                        <button onClick={handleCheckText} className="px-8 py-3 rounded-full font-black text-lg text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-transform en-text shadow-lg flex items-center gap-2">
                            Check Answer 👁️
                        </button>
                    ) : null}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            {/* Ultra-Premium Header */}
            <header className="text-center py-10 mb-8 border-b border-gray-800 fade-in relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 gold-gradient rounded-b-full opacity-50 blur-sm"></div>
                <h1 className="text-4xl md:text-6xl font-black cinzel-text gold-text mb-2 drop-shadow-lg uppercase tracking-wider">
                    Mr. Moheb Mousa
                </h1>
                <h2 className="text-lg md:text-2xl font-bold text-gray-400 en-text tracking-wide mb-4">
                    English & Chess International Teacher
                </h2>
                <div className="inline-flex items-center gap-3 bg-black/50 border border-yellow-600/50 px-6 py-2 rounded-full shadow-lg">
                    <span className="text-yellow-500 text-xl">📞</span>
                    <span className="text-yellow-400 font-black text-xl en-text tracking-widest">01200621226</span>
                </div>
            </header>

            <main>
                {/* Units Navigation Grid */}
                <div className="flex flex-wrap justify-center gap-3 mb-10 fade-in" dir="ltr">
                    {Object.keys(courseData).map(unitKey => (
                        <button 
                            key={unitKey}
                            onClick={() => setActiveUnit(unitKey)}
                            className={`px-5 py-3 rounded-xl font-bold en-text transition-all ${activeUnit === unitKey ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-yellow-500 hover:text-yellow-500'}`}
                        >
                            {unitKey}
                        </button>
                    ))}
                </div>

                {/* App Window */}
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden min-h-[600px] relative">
                    {/* Inner Header / Tabs */}
                    <div className="bg-black/80 border-b border-gray-800 p-4 flex flex-wrap justify-center gap-2 md:gap-6 z-10 relative" dir="ltr">
                        {[
                            { id: 'learn', icon: '🧠', text: "Let's Learn" },
                            { id: 'examples', icon: '💡', text: 'Examples' },
                            { id: 'practice', icon: '✍️', text: "Let's Practice" }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`px-6 py-3 rounded-full font-bold text-sm md:text-base en-text flex items-center gap-2 tab-btn ${activeSubTab === tab.id ? 'active' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            >
                                <span className="text-lg">{tab.icon}</span> {tab.text}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-10 relative z-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-10 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-10 pointer-events-none"></div>
                        
                        {activeSubTab === 'learn' && renderLearnTab()}
                        {activeSubTab === 'examples' && renderExamplesTab()}
                        {activeSubTab === 'practice' && renderPracticeTab()}
                    </div>
                </div>
            </main>
            
            <footer className="mt-12 text-center pb-8 opacity-60">
                <p className="en-text text-sm text-gray-500 uppercase tracking-widest">Premium Educational Tools © 2026</p>
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
