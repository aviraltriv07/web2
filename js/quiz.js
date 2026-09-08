/**
 * SciFiLens - Quiz Page
 */

let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let quizInProgress = false;

document.addEventListener('DOMContentLoaded', async () => {
    const quizData = await fetchJSON('data/quiz-questions.json');
    
    if (quizData) {
        quizQuestions = quizData.questions;
        setupQuizUI();
    }
});

function setupQuizUI() {
    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }
    
    const retakeBtn = document.getElementById('retakeBtn');
    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
            location.reload();
        });
    }
}

function startQuiz() {
    quizInProgress = true;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        endQuiz();
        return;
    }
    
    const question = quizQuestions[currentQuestionIndex];
    const feedback = document.getElementById('answerFeedback');
    
    // Hide feedback
    if (feedback) feedback.style.display = 'none';
    
    // Update progress
    updateProgress();
    
    // Display question
    document.getElementById('questionText').textContent = question.question;
    
    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((option, index) => {
        const isSelected = userAnswers[currentQuestionIndex] === index;
        return `
            <div class="option ${isSelected ? 'selected' : ''}" onclick="selectOption(${index})">
                <div class="option-radio"></div>
                <div class="option-text">${option}</div>
            </div>
        `;
    }).join('');
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
        prevBtn.onclick = goToPrevious;
    }
    
    if (nextBtn) {
        nextBtn.style.display = 'block';
        nextBtn.textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next';
        nextBtn.onclick = goToNext;
    }
}

function selectOption(optionIndex) {
    const question = quizQuestions[currentQuestionIndex];
    const feedback = document.getElementById('answerFeedback');
    
    // Store answer
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update UI
    document.querySelectorAll('.option').forEach((opt, index) => {
        opt.classList.remove('selected', 'correct', 'incorrect');
        if (index === optionIndex) {
            opt.classList.add('selected');
        }
        
        // Show correct/incorrect after selection
        if (index === question.correct) {
            opt.classList.add('correct');
        } else if (index === optionIndex && index !== question.correct) {
            opt.classList.add('incorrect');
        }
    });
    
    // Update score and show feedback
    const isCorrect = optionIndex === question.correct;
    if (isCorrect) score++;
    
    showFeedback(question, isCorrect);
}

function showFeedback(question, isCorrect) {
    const feedback = document.getElementById('answerFeedback');
    const feedbackIcon = document.getElementById('feedbackIcon');
    const feedbackTitle = document.getElementById('feedbackTitle');
    const feedbackText = document.getElementById('feedbackText');
    const feedbackMovie = document.getElementById('feedbackMovie');
    const feedbackMovieText = document.getElementById('feedbackMovieText');
    
    feedbackIcon.textContent = isCorrect ? '✓' : '✗';
    feedbackIcon.style.color = isCorrect ? '#22c55e' : '#ef4444';
    
    feedbackTitle.textContent = isCorrect ? 'Correct!' : 'Incorrect';
    feedbackTitle.style.color = isCorrect ? '#22c55e' : '#ef4444';
    
    feedbackText.textContent = question.explanation;
    
    if (question.movieConnection) {
        feedbackMovie.style.display = 'block';
        feedbackMovieText.textContent = question.movieConnection;
    } else {
        feedbackMovie.style.display = 'none';
    }
    
    feedback.style.display = 'flex';
}

function updateProgress() {
    const questionNumber = currentQuestionIndex + 1;
    const total = quizQuestions.length;
    
    document.getElementById('questionNumber').textContent = `Question ${questionNumber} of ${total}`;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
    
    const progressPercentage = (questionNumber / total) * 100;
    document.getElementById('progressFill').style.width = progressPercentage + '%';
}

function goToPrevious() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        const feedback = document.getElementById('answerFeedback');
        if (feedback) feedback.style.display = 'none';
        displayQuestion();
    }
}

function goToNext() {
    if (userAnswers[currentQuestionIndex] === undefined) {
        alert('Please select an answer before proceeding');
        return;
    }
    
    currentQuestionIndex++;
    displayQuestion();
}

function endQuiz() {
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    // Calculate final score percentage
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    // Display score
    document.getElementById('finalScore').textContent = `${score}/${quizQuestions.length}`;
    
    // Display message based on score
    let message = '';
    if (percentage >= 90) {
        message = "Outstanding! You're a true science fiction expert with excellent knowledge of real science!";
    } else if (percentage >= 80) {
        message = "Excellent work! You have a strong understanding of the science behind science fiction.";
    } else if (percentage >= 70) {
        message = "Good job! You understand many of the scientific concepts featured in sci-fi films.";
    } else if (percentage >= 60) {
        message = "Not bad! Keep exploring to deepen your understanding of science and sci-fi.";
    } else {
        message = "Keep learning! Explore our science library and movie details to expand your knowledge.";
    }
    
    document.getElementById('resultMessage').textContent = message;
    
    // Display breakdown
    const breakdown = document.getElementById('resultsBreakdown');
    if (breakdown) {
        breakdown.innerHTML = `
            <div class="breakdown-item">
                <span class="breakdown-label">Correct Answers</span>
                <span class="breakdown-value">${score}/${quizQuestions.length}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Percentage</span>
                <span class="breakdown-value">${percentage}%</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Difficulty</span>
                <span class="breakdown-value">${calculateAverageDifficulty()}</span>
            </div>
        `;
    }
}

function calculateAverageDifficulty() {
    const difficulties = { easy: 1, intermediate: 2, advanced: 3 };
    const avg = quizQuestions.reduce((sum, q) => sum + (difficulties[q.difficulty] || 0), 0) / quizQuestions.length;
    
    if (avg <= 1.5) return 'Easy';
    if (avg <= 2.5) return 'Intermediate';
    return 'Advanced';
}
