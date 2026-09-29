/**
 * SciFiLens - Likes & Favorites Manager
 * Handles movie likes and science concept likes with Supabase synchronization,
 * optimistic UI updates, and guest prompt alerts.
 */

// In-memory sets of liked IDs
const userMovieLikesSet = new Set();
const userConceptLikesSet = new Set();
let isLikesInitialized = false;

/**
 * Initialize user likes from Supabase
 */
async function initLikesSystem() {
    if (isLikesInitialized) return;

    // Load from local storage cache for instant rendering
    try {
        const cachedMovies = JSON.parse(localStorage.getItem('scifilens_cached_movie_likes') || '[]');
        cachedMovies.forEach(id => userMovieLikesSet.add(String(id)));

        const cachedConcepts = JSON.parse(localStorage.getItem('scifilens_cached_concept_likes') || '[]');
        cachedConcepts.forEach(id => userConceptLikesSet.add(String(id)));
    } catch (e) {}

    // Update UI immediately with cached data
    syncAllLikeButtons();

    // If user is logged in, fetch authoritative likes from Supabase
    if (window.SciFiLensSupabase) {
        try {
            const user = await window.SciFiLensSupabase.getCurrentUser();
            if (user) {
                const [mResult, cResult] = await Promise.all([
                    window.SciFiLensSupabase.fetchUserMovieLikes(user.id),
                    window.SciFiLensSupabase.fetchUserConceptLikes(user.id)
                ]);

                userMovieLikesSet.clear();
                (mResult || []).forEach(item => userMovieLikesSet.add(String(item.movie_id)));
                localStorage.setItem('scifilens_cached_movie_likes', JSON.stringify([...userMovieLikesSet]));

                userConceptLikesSet.clear();
                (cResult || []).forEach(item => userConceptLikesSet.add(String(item.concept_id)));
                localStorage.setItem('scifilens_cached_concept_likes', JSON.stringify([...userConceptLikesSet]));

                syncAllLikeButtons();
            } else {
                userMovieLikesSet.clear();
                userConceptLikesSet.clear();
                localStorage.removeItem('scifilens_cached_movie_likes');
                localStorage.removeItem('scifilens_cached_concept_likes');
                syncAllLikeButtons();
            }
        } catch (err) {
            console.warn('Likes synchronization note:', err.message);
        }
    }

    isLikesInitialized = true;
}

/**
 * Helper to generate HTML markup for a movie like button
 */
function renderMovieLikeButton(movieId, label = 'Like', className = '') {
    const mIdStr = String(movieId);
    const isLiked = userMovieLikesSet.has(mIdStr);
    return `
        <button 
            type="button" 
            class="like-btn movie-like-btn ${isLiked ? 'liked' : ''} ${className}" 
            data-movie-id="${mIdStr}" 
            title="${isLiked ? 'Remove from Liked Movies' : 'Save to Liked Movies'}"
            onclick="handleMovieLikeClick(event, '${mIdStr}')"
        >
            <span class="like-heart-icon">${isLiked ? '♥' : '♡'}</span>
            <span class="like-btn-label">${isLiked ? 'Liked' : label}</span>
        </button>
    `;
}

/**
 * Helper to generate HTML markup for a concept like button
 */
function renderConceptLikeButton(conceptId, label = 'Like Concept', className = '') {
    const cIdStr = String(conceptId);
    const isLiked = userConceptLikesSet.has(cIdStr);
    return `
        <button 
            type="button" 
            class="like-btn concept-like-btn ${isLiked ? 'liked' : ''} ${className}" 
            data-concept-id="${cIdStr}" 
            title="${isLiked ? 'Remove from Liked Concepts' : 'Save to Liked Concepts'}"
            onclick="handleConceptLikeClick(event, '${cIdStr}')"
        >
            <span class="like-heart-icon">${isLiked ? '♥' : '♡'}</span>
            <span class="like-btn-label">${isLiked ? 'Liked' : label}</span>
        </button>
    `;
}

/**
 * Handle movie like button click
 */
async function handleMovieLikeClick(event, movieId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const mIdStr = String(movieId);

    // 1. Check user login status
    let user = null;
    if (window.SciFiLensSupabase) {
        user = await window.SciFiLensSupabase.getCurrentUser();
    }

    if (!user) {
        // Unauthenticated guest prompt
        if (typeof showToast === 'function') {
            showToast(
                'Please log in to save movies to your SciFiLens profile.',
                'info',
                { text: 'Log In', url: 'login.html' }
            );
        } else {
            alert('Please log in to save movies to your SciFiLens profile.');
            window.location.href = 'login.html';
        }
        return;
    }

    // 2. Optimistic UI toggle
    const currentlyLiked = userMovieLikesSet.has(mIdStr);
    const nextState = !currentlyLiked;

    if (nextState) {
        userMovieLikesSet.add(mIdStr);
    } else {
        userMovieLikesSet.delete(mIdStr);
    }

    localStorage.setItem('scifilens_cached_movie_likes', JSON.stringify([...userMovieLikesSet]));
    updateMovieLikeButtonsInDOM(mIdStr, nextState);

    // 3. Sync to Supabase
    try {
        const result = await window.SciFiLensSupabase.toggleMovieLikeDb(user.id, mIdStr);
        if (result.liked) {
            if (typeof showToast === 'function') {
                showToast('Movie added to your SciFiLens favorites! ♥', 'success');
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Movie removed from your favorites.', 'info');
            }
        }
    } catch (err) {
        console.error('Failed to toggle movie like:', err);
        // Revert optimistic update
        if (currentlyLiked) {
            userMovieLikesSet.add(mIdStr);
        } else {
            userMovieLikesSet.delete(mIdStr);
        }
        localStorage.setItem('scifilens_cached_movie_likes', JSON.stringify([...userMovieLikesSet]));
        updateMovieLikeButtonsInDOM(mIdStr, currentlyLiked);

        if (typeof showToast === 'function') {
            showToast('Unable to update like. Please try again.', 'error');
        }
    }
}

/**
 * Handle science concept like button click
 */
async function handleConceptLikeClick(event, conceptId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const cIdStr = String(conceptId);

    // 1. Check user login status
    let user = null;
    if (window.SciFiLensSupabase) {
        user = await window.SciFiLensSupabase.getCurrentUser();
    }

    if (!user) {
        // Unauthenticated guest prompt
        if (typeof showToast === 'function') {
            showToast(
                'Please log in to save science concepts to your SciFiLens profile.',
                'info',
                { text: 'Log In', url: 'login.html' }
            );
        } else {
            alert('Please log in to save science concepts to your SciFiLens profile.');
            window.location.href = 'login.html';
        }
        return;
    }

    // 2. Optimistic UI toggle
    const currentlyLiked = userConceptLikesSet.has(cIdStr);
    const nextState = !currentlyLiked;

    if (nextState) {
        userConceptLikesSet.add(cIdStr);
    } else {
        userConceptLikesSet.delete(cIdStr);
    }

    localStorage.setItem('scifilens_cached_concept_likes', JSON.stringify([...userConceptLikesSet]));
    updateConceptLikeButtonsInDOM(cIdStr, nextState);

    // 3. Sync to Supabase
    try {
        const result = await window.SciFiLensSupabase.toggleConceptLikeDb(user.id, cIdStr);
        if (result.liked) {
            if (typeof showToast === 'function') {
                showToast('Concept saved to your SciFiLens profile! ⚛️♥', 'success');
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Concept removed from your profile.', 'info');
            }
        }
    } catch (err) {
        console.error('Failed to toggle concept like:', err);
        // Revert optimistic update
        if (currentlyLiked) {
            userConceptLikesSet.add(cIdStr);
        } else {
            userConceptLikesSet.delete(cIdStr);
        }
        localStorage.setItem('scifilens_cached_concept_likes', JSON.stringify([...userConceptLikesSet]));
        updateConceptLikeButtonsInDOM(cIdStr, currentlyLiked);

        if (typeof showToast === 'function') {
            showToast('Unable to update like. Please try again.', 'error');
        }
    }
}

/**
 * Update DOM elements for a given movie ID
 */
function updateMovieLikeButtonsInDOM(movieId, isLiked) {
    const buttons = document.querySelectorAll(`.movie-like-btn[data-movie-id="${movieId}"]`);
    buttons.forEach(btn => {
        btn.classList.toggle('liked', isLiked);
        const icon = btn.querySelector('.like-heart-icon');
        const label = btn.querySelector('.like-btn-label');
        if (icon) icon.textContent = isLiked ? '♥' : '♡';
        if (label) label.textContent = isLiked ? 'Liked' : 'Like';
        btn.title = isLiked ? 'Remove from Liked Movies' : 'Save to Liked Movies';

        // Add pop animation
        btn.classList.remove('like-pop');
        void btn.offsetWidth; // Trigger reflow
        btn.classList.add('like-pop');
    });
}

/**
 * Update DOM elements for a given concept ID
 */
function updateConceptLikeButtonsInDOM(conceptId, isLiked) {
    const buttons = document.querySelectorAll(`.concept-like-btn[data-concept-id="${conceptId}"]`);
    buttons.forEach(btn => {
        btn.classList.toggle('liked', isLiked);
        const icon = btn.querySelector('.like-heart-icon');
        const label = btn.querySelector('.like-btn-label');
        if (icon) icon.textContent = isLiked ? '♥' : '♡';
        if (label) label.textContent = isLiked ? 'Liked' : 'Like Concept';
        btn.title = isLiked ? 'Remove from Liked Concepts' : 'Save to Liked Concepts';

        btn.classList.remove('like-pop');
        void btn.offsetWidth;
        btn.classList.add('like-pop');
    });
}

/**
 * Synchronize all like buttons currently rendered on the page
 */
function syncAllLikeButtons() {
    document.querySelectorAll('.movie-like-btn').forEach(btn => {
        const id = btn.dataset.movieId;
        if (id) {
            const isLiked = userMovieLikesSet.has(String(id));
            btn.classList.toggle('liked', isLiked);
            const icon = btn.querySelector('.like-heart-icon');
            const label = btn.querySelector('.like-btn-label');
            if (icon) icon.textContent = isLiked ? '♥' : '♡';
            if (label) label.textContent = isLiked ? 'Liked' : 'Like';
        }
    });

    document.querySelectorAll('.concept-like-btn').forEach(btn => {
        const id = btn.dataset.conceptId;
        if (id) {
            const isLiked = userConceptLikesSet.has(String(id));
            btn.classList.toggle('liked', isLiked);
            const icon = btn.querySelector('.like-heart-icon');
            const label = btn.querySelector('.like-btn-label');
            if (icon) icon.textContent = isLiked ? '♥' : '♡';
            if (label) label.textContent = isLiked ? 'Liked' : 'Like Concept';
        }
    });
}

// Window attachments
window.initLikesSystem = initLikesSystem;
window.renderMovieLikeButton = renderMovieLikeButton;
window.renderConceptLikeButton = renderConceptLikeButton;
window.handleMovieLikeClick = handleMovieLikeClick;
window.handleConceptLikeClick = handleConceptLikeClick;
window.syncAllLikeButtons = syncAllLikeButtons;
window.userMovieLikesSet = userMovieLikesSet;
window.userConceptLikesSet = userConceptLikesSet;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initLikesSystem();
});
