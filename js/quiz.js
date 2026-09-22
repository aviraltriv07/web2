/**
 * SciFiLens - Interactive Quiz Controller
 * Features dual modes:
 * 1. Which Scientist Are You? (Archetype matching, 5-trait breakdown, cinematic twin)
 * 2. Movie Science IQ (Fact vs. Fiction movie trivia)
 */

// Quiz Modes
const MODE_SCIENTIST = 'scientist';
const MODE_TRIVIA = 'trivia';

// Global State
let currentMode = MODE_SCIENTIST;
let scientistConfig = null;
let triviaQuestions = [];
let moviesCatalog = [];
let experimentsCatalog = [];

// Scientist Quiz State
let scientistCurrentIndex = 0;
let scientistUserAnswers = []; // array of option indices

// Trivia Quiz State
let triviaCurrentIndex = 0;
let triviaScore = 0;
let triviaUserAnswers = [];

// Cache of last calculated scientist result for clipboard sharing
let lastScientistResult = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch all necessary data concurrently
    const [configData, triviaData, moviesData, expData] = await Promise.all([
        fetchJSON('data/quiz-config.json'),
        fetchJSON('data/quiz-questions.json'),
        fetchJSON('data/movies.json'),
        fetchJSON('data/experiments.json')
    ]);

    if (configData) scientistConfig = configData;
    if (triviaData && triviaData.questions) triviaQuestions = triviaData.questions;
    if (moviesData && moviesData.movies) moviesCatalog = moviesData.movies;
    if (expData && expData.experiments) experimentsCatalog = expData.experiments;

    setupUIEventListeners();

    // Check URL search parameters for initial mode
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode') || urlParams.get('type');
    if (modeParam === 'trivia') {
        switchQuizMode(MODE_TRIVIA, false);
    } else {
        switchQuizMode(MODE_SCIENTIST, false);
    }
});

/**
 * Setup Button & Event Listeners
 */
function setupUIEventListeners() {
    // Start Buttons
    const startScientistBtn = document.getElementById('startScientistQuizBtn');
    if (startScientistBtn) {
        startScientistBtn.addEventListener('click', startScientistQuiz);
    }

    const startTriviaBtn = document.getElementById('startTriviaQuizBtn');
    if (startTriviaBtn) {
        startTriviaBtn.addEventListener('click', startTriviaQuiz);
    }

    // Trivia Retake
    const retakeTriviaBtn = document.getElementById('retakeTriviaBtn');
    if (retakeTriviaBtn) {
        retakeTriviaBtn.addEventListener('click', startTriviaQuiz);
    }
}

/**
 * Switch between Scientist Match and Trivia Quizzes
 */
function switchQuizMode(mode, updateUrl = true) {
    currentMode = mode;

    // Update Tab Classes and ARIA
    const tabScientist = document.getElementById('tabScientistMode');
    const tabTrivia = document.getElementById('tabTriviaMode');

    if (tabScientist && tabTrivia) {
        const isScientist = mode === MODE_SCIENTIST;
        tabScientist.classList.toggle('active', isScientist);
        tabScientist.setAttribute('aria-selected', isScientist ? 'true' : 'false');

        tabTrivia.classList.toggle('active', !isScientist);
        tabTrivia.setAttribute('aria-selected', !isScientist ? 'true' : 'false');
    }

    // Hide active screens and results
    const quizScreen = document.getElementById('quizScreen');
    const scientistResults = document.getElementById('scientistResults');
    const triviaResults = document.getElementById('triviaResults');
    const answerFeedback = document.getElementById('answerFeedback');

    if (quizScreen) quizScreen.style.display = 'none';
    if (scientistResults) scientistResults.style.display = 'none';
    if (triviaResults) triviaResults.style.display = 'none';
    if (answerFeedback) answerFeedback.style.display = 'none';

    // Show appropriate start screen
    const scientistStart = document.getElementById('scientistStart');
    const triviaStart = document.getElementById('triviaStart');

    if (mode === MODE_SCIENTIST) {
        if (scientistStart) scientistStart.style.display = 'flex';
        if (triviaStart) triviaStart.style.display = 'none';
    } else {
        if (scientistStart) scientistStart.style.display = 'none';
        if (triviaStart) triviaStart.style.display = 'flex';
    }

    if (updateUrl) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('mode', mode);
        window.history.replaceState({}, '', newUrl);
    }
}

/* ============================================================
   1. SCIENTIST PERSONALITY QUIZ FLOW
   ============================================================ */

function startScientistQuiz() {
    if (!scientistConfig || !scientistConfig.questions) {
        console.error('Scientist quiz config not loaded');
        return;
    }

    scientistCurrentIndex = 0;
    scientistUserAnswers = [];

    document.getElementById('scientistStart').style.display = 'none';
    document.getElementById('triviaStart').style.display = 'none';
    document.getElementById('scientistResults').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';

    displayScientistQuestion();
}

function displayScientistQuestion() {
    const questions = scientistConfig.questions;
    if (scientistCurrentIndex >= questions.length) {
        finishScientistQuiz();
        return;
    }

    const question = questions[scientistCurrentIndex];
    const total = questions.length;

    // Progress Bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const progressPct = ((scientistCurrentIndex + 1) / total) * 100;
        progressFill.style.width = `${progressPct}%`;
    }

    // Progress Text
    const questionNumber = document.getElementById('questionNumber');
    if (questionNumber) {
        questionNumber.textContent = `Scenario ${scientistCurrentIndex + 1} of ${total}`;
    }

    const statusIndicator = document.getElementById('quizStatusIndicator');
    if (statusIndicator) {
        const isAnswered = scientistUserAnswers[scientistCurrentIndex] !== undefined;
        statusIndicator.textContent = isAnswered ? 'Answer chosen' : 'Choose your approach';
        statusIndicator.style.color = isAnswered ? '#22c55e' : 'var(--accent-cyan)';
    }

    // Category Badge
    const categoryBadge = document.getElementById('questionCategory');
    if (categoryBadge) {
        if (question.category) {
            categoryBadge.textContent = question.category;
            categoryBadge.style.display = 'inline-block';
        } else {
            categoryBadge.style.display = 'none';
        }
    }

    // Question Text
    const questionText = document.getElementById('questionText');
    if (questionText) {
        questionText.textContent = question.text;
    }

    // Options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((opt, idx) => {
        const isSelected = scientistUserAnswers[scientistCurrentIndex] === idx;
        return `
            <div class="option ${isSelected ? 'selected' : ''}" onclick="selectScientistOption(${idx})">
                <div class="option-radio"></div>
                <div class="option-text">${opt.text}</div>
            </div>
        `;
    }).join('');

    // Navigation Buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.style.display = scientistCurrentIndex > 0 ? 'inline-flex' : 'none';
        prevBtn.onclick = goToScientistPrevious;
    }

    if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        nextBtn.textContent = scientistCurrentIndex === total - 1 ? 'Analyze My Scientist Match ✨' : 'Next Question →';
        nextBtn.onclick = goToScientistNext;
    }

    // Hide trivia feedback
    const feedback = document.getElementById('answerFeedback');
    if (feedback) feedback.style.display = 'none';
}

function selectScientistOption(optionIndex) {
    scientistUserAnswers[scientistCurrentIndex] = optionIndex;

    // Update option selection styling
    const optionElements = document.querySelectorAll('#optionsContainer .option');
    optionElements.forEach((el, idx) => {
        el.classList.toggle('selected', idx === optionIndex);
    });

    const statusIndicator = document.getElementById('quizStatusIndicator');
    if (statusIndicator) {
        statusIndicator.textContent = 'Answer chosen';
        statusIndicator.style.color = '#22c55e';
    }
}

function goToScientistPrevious() {
    if (scientistCurrentIndex > 0) {
        scientistCurrentIndex--;
        displayScientistQuestion();
    }
}

function goToScientistNext() {
    if (scientistUserAnswers[scientistCurrentIndex] === undefined) {
        showToast('Please select an approach before continuing');
        return;
    }

    scientistCurrentIndex++;
    if (scientistCurrentIndex >= scientistConfig.questions.length) {
        finishScientistQuiz();
    } else {
        displayScientistQuestion();
    }
}

/**
 * Score calculation and archetype matching
 */
function finishScientistQuiz() {
    document.getElementById('quizScreen').style.display = 'none';
    const resultsContainer = document.getElementById('scientistResults');
    resultsContainer.style.display = 'block';

    const traitKeys = ['Analytical', 'Creative', 'Practical', 'Collaborative', 'Risk'];

    // 1. Tally raw user trait points
    const userRawTraits = { Analytical: 0, Creative: 0, Practical: 0, Collaborative: 0, Risk: 0 };

    scientistUserAnswers.forEach((ansIndex, qIndex) => {
        const question = scientistConfig.questions[qIndex];
        if (question && question.options[ansIndex] && question.options[ansIndex].weights) {
            const weights = question.options[ansIndex].weights;
            for (const [trait, val] of Object.entries(weights)) {
                if (userRawTraits[trait] !== undefined) {
                    userRawTraits[trait] += val;
                }
            }
        }
    });

    // 2. Calculate maximum possible trait scores across all questions for scaling
    const maxPossibleTraits = { Analytical: 0, Creative: 0, Practical: 0, Collaborative: 0, Risk: 0 };
    scientistConfig.questions.forEach(q => {
        traitKeys.forEach(trait => {
            const maxValInQ = Math.max(...q.options.map(opt => (opt.weights && opt.weights[trait]) || 0));
            maxPossibleTraits[trait] += maxValInQ;
        });
    });

    // 3. User normalized trait vector (0.0 to 1.0) and display percentages (15% to 98%)
    const userVector = {};
    const userTraitsPct = {};

    traitKeys.forEach(trait => {
        const maxVal = Math.max(maxPossibleTraits[trait], 1);
        const ratio = userRawTraits[trait] / maxVal;
        // Bound normalized vector
        userVector[trait] = Math.max(0.1, Math.min(1.0, ratio));
        // Display percentage for visual progress bars
        userTraitsPct[trait] = Math.max(15, Math.min(98, Math.round(ratio * 100)));
    });

    // 4. Calculate similarity against all scientist archetypes
    const rankedScientists = scientistConfig.scientists.map(scientist => {
        const sVector = scientist.vector;

        // Vector dot product & norms for Cosine Similarity
        let dotProduct = 0;
        let normUser = 0;
        let normScientist = 0;
        let euclideanDistSq = 0;

        traitKeys.forEach(t => {
            const u = userVector[t];
            const s = sVector[t] || 0.5;

            dotProduct += u * s;
            normUser += u * u;
            normScientist += s * s;
            euclideanDistSq += (u - s) * (u - s);
        });

        const cosineSim = dotProduct / (Math.sqrt(normUser) * Math.sqrt(normScientist));
        const euclideanDist = Math.sqrt(euclideanDistSq);
        const maxDist = Math.sqrt(traitKeys.length); // sqrt(5) ≈ 2.236
        const proximity = Math.max(0, 1 - (euclideanDist / maxDist));

        // Combined blend score scaled to 76% - 98%
        const rawScore = (cosineSim * 0.65 + proximity * 0.35);
        const matchPct = Math.round(75 + (rawScore * 23));

        return {
            scientist,
            score: Math.min(98, Math.max(76, matchPct))
        };
    });

    // Sort descending
    rankedScientists.sort((a, b) => b.score - a.score);

    const primaryMatch = rankedScientists[0];
    const secondaryMatch = rankedScientists[1];

    // Store for sharing
    lastScientistResult = {
        primary: primaryMatch,
        secondary: secondaryMatch,
        traitsPct: userTraitsPct
    };

    // Render results view
    renderScientistResults(primaryMatch, secondaryMatch, userTraitsPct);

    // Scroll to results
    window.scrollTo({ top: resultsContainer.offsetTop - 80, behavior: 'smooth' });
}

/**
 * Render the Holographic Scientist Results Screen
 */
function renderScientistResults(primaryMatch, secondaryMatch, userTraitsPct) {
    const container = document.getElementById('scientistResultsInner');
    if (!container) return;

    const s = primaryMatch.scientist;
    const twin = s.cinematicTwin;

    // Lookup movie poster from catalog if available
    let twinPosterUrl = 'images/posters/1-interstellar.jpg';
    if (twin && twin.movieId) {
        const matchedMovie = moviesCatalog.find(m => m.id === twin.movieId);
        if (matchedMovie && matchedMovie.posterUrl) {
            twinPosterUrl = matchedMovie.posterUrl;
        }
    }

    // Lookup curated recommendation movies
    const recMovies = (s.recommendedMovies || []).map(id => {
        return moviesCatalog.find(m => m.id === id);
    }).filter(Boolean);

    // Lookup experiment
    let expDetails = null;
    if (s.recommendedExperiment && s.recommendedExperiment.id) {
        expDetails = experimentsCatalog.find(e => e.id === s.recommendedExperiment.id);
    }

    const traitKeys = ['Analytical', 'Creative', 'Practical', 'Collaborative', 'Risk'];

    container.innerHTML = `
        <!-- HERO CARD -->
        <div class="scientist-hero-card">
            <div class="scientist-hero-glow"></div>
            <div class="scientist-avatar-wrap">
                <span>${s.icon}</span>
            </div>
            <div class="match-percentage-badge">
                <span class="match-dot"></span>
                <span>${primaryMatch.score}% Scientific Archetype Match</span>
            </div>
            <h1 class="scientist-name">${s.name}</h1>
            <div class="scientist-title">${s.title}</div>
            <div class="scientist-tagline">"${s.tagline}"</div>
            <p class="scientist-bio">${s.bio}</p>

            <div class="scientist-quote-box">
                <div class="scientist-quote-text">"${s.quote}"</div>
                <div class="scientist-quote-author">— ${s.name}</div>
            </div>
        </div>

        <!-- TWO COLUMN BREAKDOWN -->
        <div class="results-grid-two-col">
            <!-- Col 1: Traits Fingerprint -->
            <div class="results-panel-card traits-analysis-card">
                <h3 class="card-section-title">
                    <span>🧠</span> Your Cognitive Trait Fingerprint
                </h3>
                <p class="card-section-desc">
                    Your answers mapped across 5 core dimensions of scientific inquiry and problem solving:
                </p>
                <div class="trait-bars-list">
                    ${traitKeys.map(key => {
                        const meta = (scientistConfig.traits && scientistConfig.traits[key]) || { name: key, icon: '•', description: '' };
                        const score = userTraitsPct[key] || 50;
                        return `
                            <div class="trait-item">
                                <div class="trait-meta">
                                    <div class="trait-title-wrap">
                                        <span class="trait-icon">${meta.icon}</span>
                                        <span class="trait-name">${meta.name}</span>
                                    </div>
                                    <span class="trait-score-val">${score}%</span>
                                </div>
                                <div class="trait-progress-track">
                                    <div class="trait-progress-bar" style="width: ${score}%;"></div>
                                </div>
                                <div class="trait-desc">${meta.description}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Col 2: Cinematic Movie Twin -->
            <div class="results-panel-card cinematic-twin-card">
                <h3 class="card-section-title">
                    <span>🎬</span> Your Sci-Fi Cinema Twin
                </h3>
                <p class="card-section-desc">
                    The science-fiction movie character who mirrors your exact problem-solving mindset:
                </p>
                
                <div class="twin-spotlight">
                    <img class="twin-poster-thumb" src="${twinPosterUrl}" alt="${twin ? twin.movie : 'Movie'}" onerror="this.src='images/posters/1-interstellar.jpg'">
                    <div class="twin-info">
                        <div class="twin-character-name">${twin ? twin.character : 'Science Explorer'}</div>
                        <div class="twin-movie-title">${twin ? twin.movie : ''}</div>
                        <p class="twin-desc">${twin ? twin.description : ''}</p>
                    </div>
                </div>

                <!-- Secondary Affinity Banner -->
                ${secondaryMatch ? `
                    <div class="secondary-affinity-card">
                        <span class="secondary-icon">${secondaryMatch.scientist.icon}</span>
                        <div class="secondary-text">
                            <h4>Secondary Scientific Affinity: ${secondaryMatch.scientist.name}</h4>
                            <p>${secondaryMatch.score}% Affinity • ${secondaryMatch.scientist.title}</p>
                        </div>
                    </div>
                ` : ''}

                ${twin && twin.movieId ? `
                    <div class="twin-action-btn" style="margin-top: 1.25rem;">
                        <a href="movie-detail.html?id=${twin.movieId}" class="btn btn-secondary" style="width: 100%; text-align: center;">
                            <span>Explore the Science of ${twin.movie}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- CURATED RECOMMENDATIONS -->
        <div class="curated-recommendations">
            <h3 class="card-section-title">
                <span>🍿</span> Curated For Your Scientific Mind
            </h3>
            <p class="card-section-desc">
                Films and physics experiments aligned with the ${s.title} archetype:
            </p>

            <div class="rec-grid">
                ${recMovies.map(movie => `
                    <a href="movie-detail.html?id=${movie.id}" class="rec-card">
                        <div class="rec-card-header">
                            <span class="rec-type-badge">Featured Movie</span>
                            <span class="rec-accuracy-badge">${movie.accuracy?.percentage || 85}% Accurate</span>
                        </div>
                        <h4>${movie.title} (${movie.year})</h4>
                        <p>${movie.description ? movie.description.slice(0, 105) + '...' : 'Explore real science in cinema.'}</p>
                        <span class="rec-card-link">View Scientific Accuracy →</span>
                    </a>
                `).join('')}

                ${expDetails ? `
                    <a href="experiments.html" class="rec-card" style="border-color: rgba(6, 182, 212, 0.4); background: rgba(6, 182, 212, 0.05);">
                        <div class="rec-card-header">
                            <span class="rec-type-badge" style="color: #4ade80;">Physics Lab</span>
                            <span class="rec-accuracy-badge" style="color: #38bdf8; background: rgba(56, 189, 248, 0.15);">Interactive</span>
                        </div>
                        <h4>${expDetails.title}</h4>
                        <p>${expDetails.description ? expDetails.description.slice(0, 105) + '...' : 'Interactive simulation grounded in real physics.'}</p>
                        <span class="rec-card-link">Launch Experiment Calculator →</span>
                    </a>
                ` : ''}
            </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="results-actions-wrap">
            <button class="btn btn-primary" id="copyResultsBtn" onclick="copyScientistProfile()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Share / Copy Scientist Card</span>
            </button>
            <button class="btn btn-secondary" onclick="startScientistQuiz()">
                <span>Retake Discovery Quiz</span>
            </button>
            <button class="btn btn-secondary" onclick="switchQuizMode('trivia')">
                <span>Test Movie Science IQ</span>
            </button>
            <a href="index.html" class="btn btn-secondary">
                <span>Back to Home</span>
            </a>
        </div>
    `;
}

/**
 * Copy formatted scientist archetype result to clipboard
 */
function copyScientistProfile() {
    if (!lastScientistResult) return;

    const { primary, traitsPct } = lastScientistResult;
    const s = primary.scientist;
    const twin = s.cinematicTwin;

    const shareText = 
`🔬 My SciFiLens Scientist Match: ${s.name} (${s.title}) — ${primary.score}% Affinity!
🎬 Sci-Fi Cinema Twin: ${twin.character} in '${twin.movie}'
🧠 Cognitive DNA:
• Analytical Rigor: ${traitsPct.Analytical}%
• Creative Intuition: ${traitsPct.Creative}%
• Practical Engineering: ${traitsPct.Practical}%
• Collaboration & Empathy: ${traitsPct.Collaborative}%
• Scientific Audacity: ${traitsPct.Risk}%

Discover which scientist and sci-fi twin you are on SciFiLens!`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Scientist Card copied to clipboard!');
        }).catch(() => {
            fallbackCopyText(shareText);
        });
    } else {
        fallbackCopyText(shareText);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('Scientist Card copied to clipboard!');
    } catch (err) {
        console.error('Copy failed:', err);
    }
    document.body.removeChild(textArea);
}

/**
 * Toast Notification Utility
 */
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');

    if (toast && toastMsg) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }
}

/* ============================================================
   2. MOVIE SCIENCE TRIVIA QUIZ FLOW (Preserved & Enhanced)
   ============================================================ */

function startTriviaQuiz() {
    triviaCurrentIndex = 0;
    triviaScore = 0;
    triviaUserAnswers = [];

    document.getElementById('scientistStart').style.display = 'none';
    document.getElementById('triviaStart').style.display = 'none';
    document.getElementById('triviaResults').style.display = 'none';
    document.getElementById('scientistResults').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';

    displayTriviaQuestion();
}

function displayTriviaQuestion() {
    if (triviaCurrentIndex >= triviaQuestions.length) {
        endTriviaQuiz();
        return;
    }

    const question = triviaQuestions[triviaCurrentIndex];
    const total = triviaQuestions.length;

    // Hide feedback from previous step
    const feedback = document.getElementById('answerFeedback');
    if (feedback) feedback.style.display = 'none';

    // Progress
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${((triviaCurrentIndex + 1) / total) * 100}%`;
    }

    const questionNumber = document.getElementById('questionNumber');
    if (questionNumber) {
        questionNumber.textContent = `Question ${triviaCurrentIndex + 1} of ${total}`;
    }

    const statusIndicator = document.getElementById('quizStatusIndicator');
    if (statusIndicator) {
        statusIndicator.textContent = `Score: ${triviaScore}`;
        statusIndicator.style.color = 'var(--accent-cyan)';
    }

    // Category
    const categoryBadge = document.getElementById('questionCategory');
    if (categoryBadge) {
        categoryBadge.textContent = question.difficulty ? `Difficulty: ${question.difficulty}` : 'Movie Trivia';
        categoryBadge.style.display = 'inline-block';
    }

    // Question Text
    const questionText = document.getElementById('questionText');
    if (questionText) {
        questionText.textContent = question.question;
    }

    // Options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((opt, idx) => {
        const isSelected = triviaUserAnswers[triviaCurrentIndex] === idx;
        return `
            <div class="option ${isSelected ? 'selected' : ''}" onclick="selectTriviaOption(${idx})">
                <div class="option-radio"></div>
                <div class="option-text">${opt}</div>
            </div>
        `;
    }).join('');

    // Navigation Buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.style.display = triviaCurrentIndex > 0 ? 'inline-flex' : 'none';
        prevBtn.onclick = goToTriviaPrevious;
    }

    if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        nextBtn.textContent = triviaCurrentIndex === total - 1 ? 'Finish Trivia' : 'Next Question →';
        nextBtn.onclick = goToTriviaNext;
    }
}

function selectTriviaOption(optionIndex) {
    const question = triviaQuestions[triviaCurrentIndex];
    triviaUserAnswers[triviaCurrentIndex] = optionIndex;

    const isCorrect = optionIndex === question.correct;
    if (isCorrect && !question._scored) {
        triviaScore++;
        question._scored = true;
    }

    // Update UI
    document.querySelectorAll('#optionsContainer .option').forEach((opt, idx) => {
        opt.classList.remove('selected', 'correct', 'incorrect');
        if (idx === optionIndex) {
            opt.classList.add('selected');
        }
        if (idx === question.correct) {
            opt.classList.add('correct');
        } else if (idx === optionIndex && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });

    const statusIndicator = document.getElementById('quizStatusIndicator');
    if (statusIndicator) {
        statusIndicator.textContent = `Score: ${triviaScore}`;
    }

    showTriviaFeedback(question, isCorrect);
}

function showTriviaFeedback(question, isCorrect) {
    const feedback = document.getElementById('answerFeedback');
    const feedbackIcon = document.getElementById('feedbackIcon');
    const feedbackTitle = document.getElementById('feedbackTitle');
    const feedbackText = document.getElementById('feedbackText');
    const feedbackMovie = document.getElementById('feedbackMovie');
    const feedbackMovieText = document.getElementById('feedbackMovieText');

    if (!feedback) return;

    if (feedbackIcon) {
        feedbackIcon.textContent = isCorrect ? '✓' : '✗';
        feedbackIcon.style.color = isCorrect ? '#22c55e' : '#ef4444';
    }

    if (feedbackTitle) {
        feedbackTitle.textContent = isCorrect ? 'Correct!' : 'Incorrect';
        feedbackTitle.style.color = isCorrect ? '#22c55e' : '#ef4444';
    }

    if (feedbackText) {
        feedbackText.textContent = question.explanation;
    }

    if (feedbackMovie && feedbackMovieText) {
        if (question.movieConnection) {
            feedbackMovie.style.display = 'block';
            feedbackMovieText.textContent = question.movieConnection;
        } else {
            feedbackMovie.style.display = 'none';
        }
    }

    feedback.style.display = 'block';
}

function goToTriviaPrevious() {
    if (triviaCurrentIndex > 0) {
        triviaCurrentIndex--;
        displayTriviaQuestion();
    }
}

function goToTriviaNext() {
    if (triviaUserAnswers[triviaCurrentIndex] === undefined) {
        showToast('Please select an answer before proceeding');
        return;
    }

    triviaCurrentIndex++;
    if (triviaCurrentIndex >= triviaQuestions.length) {
        endTriviaQuiz();
    } else {
        displayTriviaQuestion();
    }
}

function endTriviaQuiz() {
    document.getElementById('quizScreen').style.display = 'none';
    const feedback = document.getElementById('answerFeedback');
    if (feedback) feedback.style.display = 'none';

    document.getElementById('triviaResults').style.display = 'block';

    const total = triviaQuestions.length;
    const percentage = Math.round((triviaScore / total) * 100);

    const finalScoreEl = document.getElementById('finalScore');
    if (finalScoreEl) finalScoreEl.textContent = `${triviaScore}/${total}`;

    let message = '';
    if (percentage >= 90) {
        message = "Outstanding! You're a true sci-fi physics virtuoso with an acute eye for real scientific principles!";
    } else if (percentage >= 80) {
        message = "Excellent work! You have a strong grasp of the science behind cinematic science fiction.";
    } else if (percentage >= 70) {
        message = "Good job! You easily navigate between Hollywood dramatization and empirical reality.";
    } else if (percentage >= 60) {
        message = "Not bad! Explore our movie analyses and interactive physics labs to elevate your knowledge.";
    } else {
        message = "Keep learning! Check out our movie library to discover where cinema meets real physics.";
    }

    const resultMessageEl = document.getElementById('resultMessage');
    if (resultMessageEl) resultMessageEl.textContent = message;

    const breakdown = document.getElementById('resultsBreakdown');
    if (breakdown) {
        breakdown.innerHTML = `
            <div class="breakdown-item">
                <span class="breakdown-label">Correct Answers</span>
                <span class="breakdown-value">${triviaScore}/${total}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Accuracy Score</span>
                <span class="breakdown-value">${percentage}%</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Evaluation Difficulty</span>
                <span class="breakdown-value">Intermediate to Advanced</span>
            </div>
        `;
    }
}
