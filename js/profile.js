/**
 * SciFiLens - User Profile & Dashboard Controller
 * Loads user profile, quiz score history, liked movies, and liked science concepts
 */

let currentUser = null;
let currentProfile = null;
let cachedCatalogMovies = [];
let cachedCatalogConcepts = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfileDashboard();
});

/**
 * Main dashboard data loader
 */
async function loadUserProfileDashboard() {
    const loadingEl = document.getElementById('profileLoading');
    const contentEl = document.getElementById('profileContent');
    const guestGateEl = document.getElementById('guestGate');

    if (!window.SciFiLensSupabase) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (guestGateEl) guestGateEl.style.display = 'block';
        return;
    }

    try {
        currentUser = await window.SciFiLensSupabase.getCurrentUser();

        if (!currentUser) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'none';
            if (guestGateEl) guestGateEl.style.display = 'block';
            return;
        }

        // Fetch profile, quiz attempts, movie catalog, concept catalog concurrently
        const [profileData, quizAttempts, moviesCatalogData, conceptsCatalogData] = await Promise.all([
            window.SciFiLensSupabase.getUserProfile(currentUser.id),
            window.SciFiLensSupabase.fetchUserQuizAttempts(currentUser.id),
            fetchJSON('data/movies.json'),
            fetchJSON('data/science-concepts.json')
        ]);

        currentProfile = profileData;
        if (moviesCatalogData && moviesCatalogData.movies) {
            cachedCatalogMovies = moviesCatalogData.movies;
        }
        if (conceptsCatalogData && conceptsCatalogData.concepts) {
            cachedCatalogConcepts = conceptsCatalogData.concepts;
        }

        // Render sections
        renderUserHero(currentUser, currentProfile);
        renderQuizHistory(quizAttempts || []);
        await renderLikedMoviesSection();
        await renderLikedConceptsSection();

        // Update overall summary stats
        updateDashboardSummaryMetrics(quizAttempts || []);

        // Show dashboard content
        if (loadingEl) loadingEl.style.display = 'none';
        if (guestGateEl) guestGateEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'block';
    } catch (err) {
        console.error('Error loading dashboard:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (guestGateEl) guestGateEl.style.display = 'block';
    }
}

/**
 * Render Profile Hero Header
 */
function renderUserHero(user, profile) {
    const nameText = document.getElementById('userNameText');
    const emailText = document.getElementById('userEmailText');
    const memberTag = document.getElementById('memberSinceTag');
    const avatarImg = document.getElementById('avatarImage');
    const avatarFallback = document.getElementById('avatarFallback');

    const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Cosmic Explorer';
    const email = user.email || 'user@example.com';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;

    if (nameText) nameText.textContent = displayName;
    if (emailText) emailText.textContent = email;

    if (memberTag && user.created_at) {
        const createdDate = new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        memberTag.textContent = `📅 Member since ${createdDate}`;
    }

    if (avatarImg && avatarFallback) {
        if (avatarUrl) {
            avatarImg.src = avatarUrl;
            avatarImg.style.display = 'block';
            avatarFallback.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            avatarFallback.style.display = 'flex';
            avatarFallback.textContent = displayName.charAt(0).toUpperCase();
        }
    }
}

/**
 * Prompt User to update their full name
 */
async function promptEditName() {
    if (!currentUser) return;
    const currentName = currentProfile?.full_name || currentUser.user_metadata?.full_name || '';
    const newName = prompt('Enter your full name:', currentName);

    if (newName !== null && newName.trim() !== '' && newName.trim() !== currentName) {
        try {
            await window.SciFiLensSupabase.upsertUserProfile(currentUser.id, {
                full_name: newName.trim()
            });

            const nameText = document.getElementById('userNameText');
            if (nameText) nameText.textContent = newName.trim();
            if (currentProfile) currentProfile.full_name = newName.trim();

            if (typeof updateNavbarAuthState === 'function') {
                updateNavbarAuthState();
            }

            if (typeof showToast === 'function') {
                showToast('Profile name updated successfully!', 'success');
            }
        } catch (err) {
            console.error('Failed to update name:', err);
            if (typeof showToast === 'function') {
                showToast('Unable to update name. Please try again.', 'error');
            }
        }
    }
}

/**
 * Handle Avatar File Upload to Supabase Storage
 */
async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
        if (typeof showToast === 'function') {
            showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
        }
        return;
    }

    if (file.size > 3 * 1024 * 1024) {
        if (typeof showToast === 'function') {
            showToast('Image size must be less than 3MB.', 'warning');
        }
        return;
    }

    if (typeof showToast === 'function') {
        showToast('Uploading avatar to Supabase Storage...', 'info');
    }

    try {
        const publicUrl = await window.SciFiLensSupabase.uploadUserAvatar(currentUser.id, file);

        const avatarImg = document.getElementById('avatarImage');
        const avatarFallback = document.getElementById('avatarFallback');

        if (avatarImg) {
            avatarImg.src = publicUrl;
            avatarImg.style.display = 'block';
            if (avatarFallback) avatarFallback.style.display = 'none';
        }

        if (typeof updateNavbarAuthState === 'function') {
            updateNavbarAuthState();
        }

        if (typeof showToast === 'function') {
            showToast('Avatar updated successfully! ✨', 'success');
        }
    } catch (err) {
        console.error('Avatar upload failed:', err);
        if (typeof showToast === 'function') {
            showToast(`Upload failed: ${err.message}. Ensure 'avatars' bucket exists in Supabase Storage.`, 'error');
        }
    }
}

/**
 * Render Quiz Attempt History
 */
function renderQuizHistory(attempts) {
    const listEl = document.getElementById('quizHistoryList');
    const badgeEl = document.getElementById('tabQuizBadge');

    if (badgeEl) badgeEl.textContent = attempts.length;

    if (!listEl) return;

    if (attempts.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state-box">
                <div class="empty-state-icon">🧠</div>
                <h3 class="empty-state-title">No Quiz Attempts Saved Yet</h3>
                <p class="empty-state-desc">
                    You haven't completed any saved quizzes yet. Test your movie physics knowledge or discover your scientist archetype!
                </p>
                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <a href="quiz.html?mode=trivia" class="btn btn-primary" style="padding: 0.65rem 1.4rem;">
                        <span>Take Movie Science Trivia</span>
                    </a>
                    <a href="quiz.html?mode=scientist" class="btn btn-secondary" style="padding: 0.65rem 1.4rem;">
                        <span>Scientist Archetype Quiz</span>
                    </a>
                </div>
            </div>
        `;
        return;
    }

    listEl.innerHTML = attempts.map(attempt => {
        const dateStr = new Date(attempt.completed_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const pct = attempt.percentage;
        let pctClass = 'pct-low';
        if (pct >= 80) pctClass = 'pct-high';
        else if (pct >= 60) pctClass = 'pct-medium';

        const isScientistArchetype = attempt.quiz_id === 'scientist-archetype';
        const icon = isScientistArchetype ? '🔬' : '🎬';

        return `
            <div class="quiz-attempt-card">
                <div class="quiz-attempt-info">
                    <div class="quiz-attempt-icon">${icon}</div>
                    <div>
                        <div class="quiz-attempt-title">${attempt.quiz_name}</div>
                        <div class="quiz-attempt-date">📅 ${dateStr}</div>
                    </div>
                </div>
                <div class="quiz-attempt-scores">
                    <div class="quiz-score-display">
                        <div class="quiz-score-number">${attempt.score} / ${attempt.total_questions}</div>
                        <div style="font-size: 0.78rem; color: var(--text-secondary);">Score</div>
                    </div>
                    <div class="quiz-score-pct-badge ${pctClass}">
                        ${pct}% Accuracy
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render Liked Movies Section
 */
async function renderLikedMoviesSection() {
    const gridEl = document.getElementById('likedMoviesGrid');
    const badgeEl = document.getElementById('tabMovieBadge');
    if (!gridEl || !currentUser) return;

    const likes = await window.SciFiLensSupabase.fetchUserMovieLikes(currentUser.id);
    const likedIds = new Set(likes.map(l => String(l.movie_id)));

    if (badgeEl) badgeEl.textContent = likedIds.size;

    const likedMovies = cachedCatalogMovies.filter(m => likedIds.has(String(m.id)));

    if (likedMovies.length === 0) {
        gridEl.innerHTML = `
            <div style="grid-column: 1 / -1;" class="empty-state-box">
                <div class="empty-state-icon">🎬</div>
                <h3 class="empty-state-title">No Liked Movies Yet</h3>
                <p class="empty-state-desc">
                    You haven't liked any movies yet. Explore SciFiLens and save your favourites here.
                </p>
                <a href="movies.html" class="btn btn-primary" style="padding: 0.65rem 1.4rem;">
                    <span>Explore Movie Library</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </div>
        `;
        return;
    }

    gridEl.innerHTML = likedMovies.map(movie => {
        const scorePercentage = (movie.scientificAccuracy / 5) * 100;
        const posterHtml = movie.posterUrl 
            ? `<img src="${movie.posterUrl}" alt="${movie.title} poster" class="movie-poster-image" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'movie-poster-fallback\\'>${movie.poster || '🎬'}</div>';">`
            : `<div class="movie-poster-fallback">${movie.poster || '🎬'}</div>`;

        return `
            <div class="movie-card" style="position: relative;" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
                <div class="movie-card-like-badge" onclick="event.stopPropagation()">
                    ${renderMovieLikeButton(movie.id, 'Liked', 'liked')}
                </div>
                <div class="movie-poster">
                    ${posterHtml}
                </div>
                <div class="movie-card-content">
                    <h3 class="movie-card-title">${movie.title}</h3>
                    <div class="movie-card-meta">
                        <span class="movie-year">${movie.year}</span>
                        <span class="movie-genre">${movie.genre.split(',')[0]}</span>
                    </div>
                    <div class="accuracy-rating">
                        <span>${movie.scientificAccuracy.toFixed(1)}</span>
                        <div class="accuracy-stars">
                            ${generateStarRating(movie.scientificAccuracy)}
                        </div>
                    </div>
                    <div class="score-bar" style="margin-top: 0.5rem;">
                        <div class="score-bar-fill" style="width: ${scorePercentage}%"></div>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.75rem; line-height: 1.4;">
                        ${movie.description ? movie.description.slice(0, 95) + '...' : ''}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render Liked Concepts Section
 */
async function renderLikedConceptsSection() {
    const gridEl = document.getElementById('likedConceptsGrid');
    const badgeEl = document.getElementById('tabConceptBadge');
    if (!gridEl || !currentUser) return;

    const likes = await window.SciFiLensSupabase.fetchUserConceptLikes(currentUser.id);
    const likedIds = new Set(likes.map(l => String(l.concept_id)));

    if (badgeEl) badgeEl.textContent = likedIds.size;

    const likedConcepts = cachedCatalogConcepts.filter(c => 
        likedIds.has(String(c.id)) || (c.slug && likedIds.has(String(c.slug)))
    );

    if (likedConcepts.length === 0) {
        gridEl.innerHTML = `
            <div style="grid-column: 1 / -1;" class="empty-state-box">
                <div class="empty-state-icon">⚛️</div>
                <h3 class="empty-state-title">No Science Concepts Saved Yet</h3>
                <p class="empty-state-desc">
                    You haven't saved any science concepts yet. Discover fascinating physics, astronomy, and relativistic concepts!
                </p>
                <a href="concepts.html" class="btn btn-primary" style="padding: 0.65rem 1.4rem;">
                    <span>Explore Science Concepts Hub</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </div>
        `;
        return;
    }

    gridEl.innerHTML = likedConcepts.map(c => `
        <div class="science-card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="science-card-icon">${c.icon || '⚛️'}</div>
                        <span class="confidence-badge ${getConfidenceClass(c.confidenceLabel || 'Established Science')}">
                            ${c.confidenceLabel || 'Established Science'}
                        </span>
                    </div>
                    <div onclick="event.stopPropagation()">
                        ${renderConceptLikeButton(c.id, 'Liked', 'liked')}
                    </div>
                </div>
                <h3 class="science-card-title">${c.title}</h3>
                <p class="science-card-description">${c.description}</p>
                ${c.formula ? `
                    <div style="font-family: 'Cambria Math', serif; color: #38bdf8; background: rgba(0,0,0,0.3); padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.9rem; margin: 0.75rem 0; border: 1px dashed rgba(6,182,212,0.3); text-align: center;">
                        ${c.formula}
                    </div>
                ` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06);">
                <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">${c.category}</span>
                <a href="concepts.html?concept=${c.slug || c.id}" class="btn btn-secondary" style="padding: 0.3rem 0.75rem; font-size: 0.75rem;">
                    Inspect Concept →
                </a>
            </div>
        </div>
    `).join('');
}

/**
 * Update Dashboard Summary Metrics
 */
function updateDashboardSummaryMetrics(attempts) {
    const countEl = document.getElementById('statQuizCount');
    const avgEl = document.getElementById('statAvgScore');
    const movieCountEl = document.getElementById('statMoviesCount');
    const conceptCountEl = document.getElementById('statConceptsCount');

    if (countEl) countEl.textContent = attempts.length;

    if (avgEl) {
        if (attempts.length === 0) {
            avgEl.textContent = '0%';
        } else {
            const sum = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
            const avg = Math.round(sum / attempts.length);
            avgEl.textContent = `${avg}%`;
        }
    }

    if (movieCountEl) {
        const count = window.userMovieLikesSet ? window.userMovieLikesSet.size : 0;
        movieCountEl.textContent = count;
    }

    if (conceptCountEl) {
        const count = window.userConceptLikesSet ? window.userConceptLikesSet.size : 0;
        conceptCountEl.textContent = count;
    }
}

/**
 * Switch profile section tabs
 */
function switchProfileTab(tabKey) {
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    const paneQuizzes = document.getElementById('paneQuizzes');
    const paneMovies = document.getElementById('paneMovies');
    const paneConcepts = document.getElementById('paneConcepts');

    if (paneQuizzes) paneQuizzes.classList.toggle('active', tabKey === 'quizzes');
    if (paneMovies) paneMovies.classList.toggle('active', tabKey === 'movies');
    if (paneConcepts) paneConcepts.classList.toggle('active', tabKey === 'concepts');
}

// Window attachments
window.switchProfileTab = switchProfileTab;
window.promptEditName = promptEditName;
window.handleAvatarUpload = handleAvatarUpload;
