/**
 * SciFiLens - Modern Science Fiction Science Quiz
 * Complete interactive quiz engine with live timer, animated score gauge, and full answer review.
 */

let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; // Array of { selectedIndex, isCorrect, timeTaken }
let quizTimerInterval = null;
let secondsElapsed = 0;
let isAnswerLocked = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const quizData = await fetchJSON('data/quiz-questions.json');
        if (quizData && Array.isArray(quizData.questions)) {
            quizQuestions = quizData.questions;
        } else {
            console.error('Quiz questions could not be loaded.');
        }
    } catch (err) {
        console.error('Failed to initialize quiz data:', err);
    }
    
    setupQuizEventListeners();
});

function setupQuizEventListeners() {
    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }
    
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNextQuestion);
    }

    const retryBtn = document.getElementById('retryQuizBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', restartQuiz);
    }

    const reviewBtn = document.getElementById('reviewAnswersBtn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', toggleReviewSection);
    }

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        const questionScreen = document.getElementById('quizQuestionScreen');
        if (!questionScreen || questionScreen.style.display === 'none') return;

        // Number keys 1-4 or A-D
        if (!isAnswerLocked) {
            const key = e.key.toUpperCase();
            const optionMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
            if (key in optionMap) {
                const optIndex = optionMap[key];
                if (optIndex < 4) {
                    selectOption(optIndex);
                }
            }
        } else {
            // Enter key to advance to next question
            if (e.key === 'Enter') {
                handleNextQuestion();
            }
        }
    });
}

function startQuiz() {
    if (!quizQuestions || quizQuestions.length === 0) {
        alert('Quiz questions are loading, please try again in a moment.');
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    secondsElapsed = 0;
    isAnswerLocked = false;

    // Reset review section
    const reviewSection = document.getElementById('quizReviewSection');
    if (reviewSection) reviewSection.style.display = 'none';

    // Switch screen views
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizQuestionScreen').style.display = 'block';
    document.getElementById('quizResultsScreen').style.display = 'none';

    // Start live timer
    startTimer();

    // Display first question
    displayQuestion();
}

function startTimer() {
    clearInterval(quizTimerInterval);
    secondsElapsed = 0;
    updateTimerDisplay();

    quizTimerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(quizTimerInterval);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('quizTimer');
    if (timerEl) {
        timerEl.textContent = `⏱️ ${formatTime(secondsElapsed)}`;
    }
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function displayQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        endQuiz();
        return;
    }

    isAnswerLocked = false;
    const question = quizQuestions[currentQuestionIndex];
    const total = quizQuestions.length;
    const qNumber = currentQuestionIndex + 1;

    // Update Progress and Meta
    const progressFill = document.getElementById('quizProgressFill');
    if (progressFill) {
        const percentage = ((qNumber - 1) / total) * 100;
        progressFill.style.width = `${Math.max(percentage, 5)}%`;
    }

    const counter = document.getElementById('questionCounter');
    if (counter) counter.textContent = `Question ${qNumber} of ${total}`;

    const diffTag = document.getElementById('questionDifficultyTag');
    if (diffTag) {
        const diff = question.difficulty || 'Intermediate';
        diffTag.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
        diffTag.className = `question-difficulty-tag diff-${diff.toLowerCase()}`;
    }

    const liveScore = document.getElementById('quizLiveScore');
    if (liveScore) liveScore.textContent = `Score: ${score}`;

    // Update Question Text
    const questionText = document.getElementById('questionText');
    if (questionText) questionText.textContent = question.question;

    // Render Options with Letters A, B, C, D
    const optionsContainer = document.getElementById('optionsContainer');
    const letters = ['A', 'B', 'C', 'D'];
    
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <button type="button" class="option" data-index="${index}" onclick="selectOption(${index})">
            <span class="option-badge">${letters[index]}</span>
            <span class="option-text">${option}</span>
            <span class="option-indicator"></span>
        </button>
    `).join('');

    // Hide feedback container smoothly
    const feedback = document.getElementById('feedbackContainer');
    if (feedback) feedback.style.display = 'none';

    // Update Next button label
    const nextBtnText = document.getElementById('nextBtnText');
    if (nextBtnText) {
        nextBtnText.textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'View Final Results 🏆' : 'Next Question';
    }

    // Smooth scroll to top of quiz question
    const questionScreen = document.getElementById('quizQuestionScreen');
    if (questionScreen && window.scrollY > questionScreen.offsetTop) {
        questionScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function selectOption(optionIndex) {
    if (isAnswerLocked) return;
    isAnswerLocked = true;

    const question = quizQuestions[currentQuestionIndex];
    const isCorrect = optionIndex === question.correct;

    if (isCorrect) {
        score++;
    }

    // Save answer record
    userAnswers[currentQuestionIndex] = {
        question: question.question,
        options: question.options,
        selectedIndex: optionIndex,
        correctIndex: question.correct,
        isCorrect: isCorrect,
        explanation: question.explanation,
        movieConnection: question.movieConnection
    };

    // Update Live Score display
    const liveScore = document.getElementById('quizLiveScore');
    if (liveScore) liveScore.textContent = `Score: ${score}`;

    // Highlight options visually
    const optionButtons = document.querySelectorAll('.options-container .option');
    optionButtons.forEach((btn, index) => {
        btn.disabled = true;
        btn.classList.remove('selected', 'correct', 'incorrect');

        if (index === question.correct) {
            btn.classList.add('correct');
        }
        if (index === optionIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
        if (index === optionIndex) {
            btn.classList.add('selected');
        }
    });

    // Show instant detailed feedback
    showFeedback(question, isCorrect);
}

function showFeedback(question, isCorrect) {
    const feedback = document.getElementById('feedbackContainer');
    const badge = document.getElementById('feedbackBadge');
    const icon = document.getElementById('feedbackIcon');
    const title = document.getElementById('feedbackTitle');
    const explanation = document.getElementById('feedbackExplanation');
    const movieBox = document.getElementById('feedbackMovieBox');
    const movieText = document.getElementById('feedbackMovieText');

    if (!feedback) return;

    if (isCorrect) {
        badge.className = 'feedback-badge correct';
        icon.textContent = '✓';
        title.textContent = 'Correct! Spot On 🚀';
    } else {
        badge.className = 'feedback-badge incorrect';
        icon.textContent = '✗';
        title.textContent = 'Not Quite! 🌌';
    }

    if (explanation) {
        explanation.textContent = question.explanation;
    }

    if (question.movieConnection && movieBox && movieText) {
        movieText.textContent = question.movieConnection;
        movieBox.style.display = 'flex';
    } else if (movieBox) {
        movieBox.style.display = 'none';
    }

    feedback.style.display = 'block';

    // Smooth scroll down to feedback if needed on small screens
    if (window.innerWidth < 768) {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function handleNextQuestion() {
    if (!isAnswerLocked) {
        alert('Please select an answer before proceeding.');
        return;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    stopTimer();

    // Fill progress bar to 100%
    const progressFill = document.getElementById('quizProgressFill');
    if (progressFill) progressFill.style.width = '100%';

    // Hide question screen and show results
    document.getElementById('quizQuestionScreen').style.display = 'none';
    const resultsScreen = document.getElementById('quizResultsScreen');
    resultsScreen.style.display = 'block';

    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);
    const incorrect = total - score;

    // Animate Circular Score SVG Gauge
    const circle = document.getElementById('circleProgress');
    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.159

    if (circle) {
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
        
        // Trigger reflow & animate
        setTimeout(() => {
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            circle.style.strokeDashoffset = `${offset}`;

            // Set color based on score
            if (percentage >= 80) {
                circle.style.stroke = '#22c55e'; // Emerald green
            } else if (percentage >= 50) {
                circle.style.stroke = '#06b6d4'; // Cyan
            } else {
                circle.style.stroke = '#f59e0b'; // Amber
            }
        }, 100);
    }

    // Set Text Displays
    document.getElementById('scorePercentage').textContent = `${percentage}%`;
    document.getElementById('scoreFraction').textContent = `${score} / ${total}`;
    document.getElementById('correctCount').textContent = `${score}`;
    document.getElementById('incorrectCount').textContent = `${incorrect}`;
    document.getElementById('timeSpent').textContent = formatTime(secondsElapsed);
    document.getElementById('accuracyRate').textContent = `${percentage}%`;

    // Dynamic Title & Rank Badge
    const rankBadge = document.getElementById('masteryRankBadge');
    const titleEl = document.getElementById('resultsTitle');
    const subtitleEl = document.getElementById('resultsSubtitle');

    if (percentage === 100) {
        rankBadge.textContent = '🌌 Cosmic Mastermind';
        rankBadge.className = 'mastery-rank-badge rank-expert';
        titleEl.textContent = 'Perfection! Absolute Cosmic Mastery!';
        subtitleEl.textContent = 'You distinguished every single nuance of astrophysics and cinema science. You are ready to consult on the next Christopher Nolan sci-fi film!';
    } else if (percentage >= 80) {
        rankBadge.textContent = '⚛️ Theoretical Physicist';
        rankBadge.className = 'mastery-rank-badge rank-expert';
        titleEl.textContent = 'Outstanding Scientific Acumen!';
        subtitleEl.textContent = 'You have a formidable grasp of general relativity, orbital mechanics, and scientific principles behind science fiction masterpieces.';
    } else if (percentage >= 60) {
        rankBadge.textContent = '🚀 Astrophysics Explorer';
        rankBadge.className = 'mastery-rank-badge rank-intermediate';
        titleEl.textContent = 'Great Job! Solid Foundation!';
        subtitleEl.textContent = 'You know your real science from fiction well. A bit more exploration in our Science Concepts Hub will make you an expert.';
    } else {
        rankBadge.textContent = '🔬 Science Cadet';
        rankBadge.className = 'mastery-rank-badge rank-beginner';
        titleEl.textContent = 'Good Effort! Keep Exploring!';
        subtitleEl.textContent = 'Cinema often bends the laws of physics for dramatic effect. Dive into our interactive experiments to discover how real physics works!';
    }

    // Render Answers Review list
    renderReviewList();

    // Scroll to results
    resultsScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderReviewList() {
    const reviewList = document.getElementById('reviewList');
    if (!reviewList) return;

    reviewList.innerHTML = userAnswers.map((ans, idx) => {
        const letters = ['A', 'B', 'C', 'D'];
        const isCorrect = ans.isCorrect;
        const chosenText = ans.options[ans.selectedIndex] || 'None';
        const correctText = ans.options[ans.correctIndex];

        return `
            <div class="review-item ${isCorrect ? 'review-correct' : 'review-incorrect'}">
                <div class="review-item-header">
                    <span class="review-q-num">Q${idx + 1}</span>
                    <span class="review-status-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}">
                        ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                    <h4 class="review-question-title">${ans.question}</h4>
                </div>

                <div class="review-choices">
                    <div class="choice-row ${isCorrect ? 'choice-correct' : 'choice-user-incorrect'}">
                        <span class="choice-label">Your Answer:</span>
                        <span class="choice-value">(${letters[ans.selectedIndex]}) ${chosenText}</span>
                    </div>
                    ${!isCorrect ? `
                        <div class="choice-row choice-correct">
                            <span class="choice-label">Correct Answer:</span>
                            <span class="choice-value">(${letters[ans.correctIndex]}) ${correctText}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="review-explanation-box">
                    <strong>Scientific Principle:</strong> ${ans.explanation}
                    ${ans.movieConnection ? `
                        <div class="review-movie-note">
                            <strong>🎬 Cinema Context:</strong> ${ans.movieConnection}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function toggleReviewSection() {
    const reviewSection = document.getElementById('quizReviewSection');
    const reviewBtn = document.getElementById('reviewAnswersBtn');
    if (!reviewSection) return;

    if (reviewSection.style.display === 'none') {
        reviewSection.style.display = 'block';
        if (reviewBtn) reviewBtn.textContent = 'Hide Answer Review';
        reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        reviewSection.style.display = 'none';
        if (reviewBtn) reviewBtn.textContent = 'Review All Answers';
    }
}

function restartQuiz() {
    startQuiz();
}

// Global exposure for inline handlers
window.selectOption = selectOption;
