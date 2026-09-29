/**
 * SciFiLens - Enhanced Movie Detail Page Logic
 */

let currentMovie = null;
let allMovies = [];
let allWhatIfs = [];
let allConcepts = [];

document.addEventListener('DOMContentLoaded', async () => {
    const movieId = getMovieIdFromURL();
    
    const [moviesData, whatIfData, conceptsData] = await Promise.all([
        fetchJSON('data/movies.json'),
        fetchJSON('data/what-if.json'),
        fetchJSON('data/science-concepts.json')
    ]);
    
    if (whatIfData && whatIfData.scenarios) allWhatIfs = whatIfData.scenarios;
    if (conceptsData && conceptsData.concepts) allConcepts = conceptsData.concepts;

    if (moviesData && moviesData.movies) {
        allMovies = moviesData.movies;
        currentMovie = allMovies.find(m => m.id === movieId);
        
        if (currentMovie) {
            displayMovieDetails();
        } else {
            showErrorState();
        }
    }
});

function getMovieIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id')) || 1;
}

function showErrorState() {
    const content = document.getElementById('movieContent');
    const loading = document.getElementById('loadingState');
    
    if (loading) loading.style.display = 'none';
    
    if (content) {
        content.innerHTML = `
            <section class="movie-detail-section" style="text-align: center; padding: 4rem 1rem;">
                <h1 style="font-size: 2.2rem; margin-bottom: 1rem; color: #ffffff;">Movie Not Found</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    The movie you're looking for doesn't exist in our science database.
                </p>
                <a href="movies.html" class="btn btn-primary">Back to Movie Library</a>
            </section>
        `;
        content.style.display = 'block';
    }
}

function displayMovieDetails() {
    const loading = document.getElementById('loadingState');
    if (loading) loading.style.display = 'none';
    
    const content = document.getElementById('movieContent');
    if (content) content.style.display = 'block';
    
    displayBackdrop();
    displayMovieInfo();
    displayScienceBehind();
    displayComparison();
    displayMovieWhatIfs();
    displayRelatedMovies();
}

function displayBackdrop() {
    const backdrop = document.getElementById('movieBackdrop');
    if (backdrop) {
        if (currentMovie.posterUrl) {
            backdrop.style.backgroundImage = `linear-gradient(180deg, rgba(10, 14, 39, 0.6) 0%, var(--bg-dark) 100%), url('${currentMovie.posterUrl}')`;
            backdrop.style.backgroundSize = 'cover';
            backdrop.style.backgroundPosition = 'center';
        }
        backdrop.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 8rem; opacity: ${currentMovie.posterUrl ? '0.12' : '0.25'};">
                ${currentMovie.backdrop || '🌌'}
            </div>
        `;
    }
}

function displayMovieInfo() {
    // Title
    const title = document.getElementById('movieTitle');
    if (title) title.textContent = currentMovie.title;
    
    // Genre
    const genre = document.getElementById('movieGenre');
    if (genre) genre.textContent = currentMovie.genre;
    
    // Year
    const year = document.getElementById('movieYear');
    if (year) year.textContent = currentMovie.year;
    
    // Director
    const director = document.getElementById('movieDirector');
    if (director) director.textContent = currentMovie.director;
    
    // Runtime
    const runtime = document.getElementById('movieRuntime');
    if (runtime) runtime.textContent = currentMovie.runtime;
    
    // Poster
    const poster = document.getElementById('moviePoster');
    if (poster) {
        if (currentMovie.posterUrl) {
            poster.innerHTML = `<img src="${currentMovie.posterUrl}" alt="${currentMovie.title} poster" class="movie-poster-image" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'movie-poster-fallback\\'>${currentMovie.poster || '🎬'}</div>';">`;
        } else {
            poster.innerHTML = `<div class="movie-poster-fallback">${currentMovie.poster || '🎬'}</div>`;
        }
    }
    
    // Accuracy Score
    const scoreEl = document.getElementById('accuracyScore');
    if (scoreEl) {
        scoreEl.innerHTML = `
            <div style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.25rem;">
                ${currentMovie.scientificAccuracy.toFixed(1)}<span style="font-size: 1.5rem; opacity: 0.7;">/5</span>
            </div>
            <div class="accuracy-stars" style="display: flex; justify-content: center; gap: 4px;">
                ${generateStarRating(currentMovie.scientificAccuracy)}
            </div>
        `;
    }
    
    // Description
    const description = document.getElementById('movieDescription');
    if (description) description.textContent = currentMovie.description;
    
    // Like Button
    const likeContainer = document.getElementById('movieDetailLikeContainer');
    if (likeContainer) {
        likeContainer.innerHTML = typeof renderMovieLikeButton === 'function'
            ? renderMovieLikeButton(currentMovie.id, 'Like Movie', 'detail-like-btn')
            : `<button class="like-btn movie-like-btn detail-like-btn" data-movie-id="${currentMovie.id}" onclick="handleMovieLikeClick(event, '${currentMovie.id}')"><span class="like-heart-icon">♡</span> <span class="like-btn-label">Like Movie</span></button>`;
    }

    // Concepts
    const conceptsList = document.getElementById('conceptsList');
    if (conceptsList) {
        conceptsList.innerHTML = (currentMovie.concepts || []).map(concept => `
            <button class="concept-tag" data-concept="${concept}" style="border: 1px solid rgba(0, 102, 255, 0.4); background: rgba(0, 102, 255, 0.15); color: #60a5fa; cursor: pointer; padding: 0.4rem 0.9rem; font-size: 0.85rem;">
                ⚛️ ${concept}
            </button>
        `).join('');
    }

    if (typeof syncAllLikeButtons === 'function') {
        syncAllLikeButtons();
    }
}

function displayScienceBehind() {
    const container = document.getElementById('scienceConcepts');
    if (!container) return;
    
    const concepts = currentMovie.scientificConcepts || [];
    
    container.innerHTML = concepts.map((concept, idx) => {
        // Derive 3-level depth for concept
        const beginnerText = concept.explanation;
        const explorerText = `${concept.explanation} In physical reality, this phenomenon involves specific conservation laws and observable parameters governing real-world astrophysics and thermodynamics.`;
        const deepScienceText = `${concept.explanation} Governed by mathematical invariants and relativistic/quantum field constraints. In astrophysical literature, deviations from standard modeling are strictly bounded by experimental observation.`;

        return `
            <div class="science-concept" style="position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <h3 style="font-size: 1.35rem; color: #ffffff; margin: 0;">${concept.name}</h3>
                    <button class="concept-tag" data-concept="${concept.name}" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;">
                        View Concept Formula →
                    </button>
                </div>
                
                <!-- 3-Tier Explanation Depth Switcher -->
                <div class="level-switcher" id="movieConceptSwitcher_${idx}">
                    <button class="level-btn active" data-level="beginner">🟢 Beginner</button>
                    <button class="level-btn" data-level="explorer">🟡 Explorer</button>
                    <button class="level-btn" data-level="deepScience">🔴 Deep Science</button>
                </div>

                <div class="level-content-box beginner" id="movieConceptBox_${idx}">
                    ${beginnerText}
                </div>
            </div>
        `;
    }).join('');

    // Attach level switcher events
    concepts.forEach((concept, idx) => {
        const switcher = document.getElementById(`movieConceptSwitcher_${idx}`);
        const contentBox = document.getElementById(`movieConceptBox_${idx}`);
        if (switcher && contentBox) {
            switcher.querySelectorAll('.level-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    switcher.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const level = btn.dataset.level;
                    contentBox.className = `level-content-box ${level}`;
                    if (level === 'beginner') {
                        contentBox.textContent = concept.explanation;
                    } else if (level === 'explorer') {
                        contentBox.textContent = `${concept.explanation} Real-world physical models require satisfying energy conservation and dynamical stability conditions.`;
                    } else {
                        contentBox.textContent = `${concept.explanation} Under rigorous mathematical modeling, general relativistic field equations and thermodynamic limits dictate precise constraints on the physical parameters.`;
                    }
                });
            });
        }
    });
}

function displayComparison() {
    const container = document.getElementById('comparisonCards');
    if (!container) return;
    
    const accuracy = currentMovie.accuracy || {};
    const percentage = accuracy.percentage || Math.round(currentMovie.scientificAccuracy * 20);

    // Determine verdict & confidence label
    let verdict = "Possible with known physics";
    let confidence = "Established Science";
    let verdictClass = "plausible";

    if (percentage >= 85) {
        verdict = "Scientifically Plausible / Grounded in Real Physics";
        confidence = "Established Science";
        verdictClass = "plausible";
    } else if (percentage >= 70) {
        verdict = "Theoretically Possible with Minor Cinematic Liberties";
        confidence = "Strong Theoretical Basis";
        verdictClass = "theoretical";
    } else if (percentage >= 50) {
        verdict = "Highly Speculative / Creative Interpretation";
        confidence = "Active Research & Speculation";
        verdictClass = "unlikely";
    } else {
        verdict = "Impossible with Current Physics / Pure Science Fiction";
        confidence = "Violates Known Physics";
        verdictClass = "impossible";
    }

    const whyText = accuracy.why || (percentage >= 80 
        ? "The film consulted prominent astrophysicists and accurately adhered to General Relativity and orbital dynamics, with minor dramatizations for cinematic pacing." 
        : "While inspired by real scientific concepts, the film takes significant liberties with scale, timing, and physiological constraints for dramatic effect.");

    container.innerHTML = `
        <div class="movie-reality-pipeline">
            
            <!-- Step 1: MOVIE CLAIM -->
            <div class="pipeline-step claim">
                <div class="pipeline-step-badge">
                    <span>🎬</span> 01 — MOVIE CLAIM (What the Film Depicts)
                </div>
                <div class="pipeline-step-content">
                    <p>${accuracy.movie || currentMovie.description}</p>
                </div>
            </div>

            <!-- Step 2: REAL SCIENCE -->
            <div class="pipeline-step reality">
                <div class="pipeline-step-badge">
                    <span>🔬</span> 02 — REAL SCIENCE (What Established Physics Predicts)
                </div>
                <div class="pipeline-step-content">
                    <p>${accuracy.reality || 'Real-world science confirms that while theoretical mechanisms exist under general relativity, practical constraints and extreme environmental conditions present immense physical barriers.'}</p>
                </div>
            </div>

            <!-- Step 3: THE PHYSICS -->
            <div class="pipeline-step physics">
                <div class="pipeline-step-badge">
                    <span>⚡</span> 03 — THE UNDERLYING PHYSICS
                </div>
                <div class="pipeline-step-content">
                    <p>${accuracy.physics || 'Governed by general relativity, orbital mechanics, and thermodynamic energy conservation laws. Spacetime curvature and gravitational gradients dictate the physical behavior.'}</p>
                </div>
            </div>

            <!-- Step 4: VERDICT & ACCURACY RATING -->
            <div class="pipeline-step verdict">
                <div class="pipeline-step-badge">
                    <span>⚖️</span> 04 — SCIENTIFIC VERDICT & ACCURACY ANALYSIS
                </div>
                <div class="pipeline-step-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <span class="plausibility-badge ${verdictClass}" style="margin-bottom: 0.5rem;">${verdict}</span>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                Scientific Confidence: <strong style="color: #38bdf8;">${confidence}</strong>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 2.2rem; font-weight: 900; color: #38bdf8; font-family: var(--font-mono);">${percentage}%</div>
                            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.5px;">Scientific Accuracy Score</div>
                        </div>
                    </div>

                    <div class="score-bar" style="margin-bottom: 1rem;">
                        <div class="score-bar-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #0066ff, #06b6d4, #22c55e);"></div>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid #06b6d4; margin-top: 0.75rem;">
                        <strong style="color: #38bdf8; font-size: 0.9rem;">WHY THIS SCORE?</strong>
                        <p style="font-size: 0.9rem; color: #cbd5e1; margin-top: 0.35rem; line-height: 1.5;">${whyText}</p>
                    </div>

                    <p class="accuracy-disclaimer">
                        * Note: Scientific Accuracy % is an educational estimate based on scientific literature and consensus analysis, not an experimentally measured physical quantity.
                    </p>
                </div>
            </div>

        </div>
    `;
}

function displayMovieWhatIfs() {
    const container = document.getElementById('movieWhatIfGrid');
    const section = document.getElementById('movieWhatIfSection');
    if (!container || !section) return;

    // Find what-if scenarios that link to this movie or match movie concepts
    const movieConcepts = (currentMovie.concepts || []).map(c => c.toLowerCase());
    const matchedWhatIfs = allWhatIfs.filter(w => 
        (w.relatedMovies && w.relatedMovies.includes(currentMovie.id)) ||
        (w.relatedMovieTitles && w.relatedMovieTitles.includes(currentMovie.title)) ||
        (w.keyConcepts && w.keyConcepts.some(kc => movieConcepts.includes(kc.name.toLowerCase())))
    ).slice(0, 3);

    if (matchedWhatIfs.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = matchedWhatIfs.map(w => `
        <div class="what-if-card" onclick="window.location.href='what-if.html?scenario=${w.slug || w.id}'">
            <div>
                <div class="what-if-card-header">
                    <div class="what-if-card-icon">${w.icon || '🌍'}</div>
                    <span class="plausibility-badge ${w.classificationLevel || 'theoretical'}">${w.classification}</span>
                </div>
                <div class="what-if-card-category">${w.category}</div>
                <h3 class="what-if-card-title">${w.title}</h3>
                <p class="what-if-card-hook">"${w.hook}"</p>
            </div>
            <div class="what-if-card-footer">
                <span style="font-size: 0.8rem; color: #c084fc; font-weight: 600;">Explore Theoretical Scenario →</span>
            </div>
        </div>
    `).join('');
}

function displayRelatedMovies() {
    const container = document.getElementById('relatedMovies');
    if (!container) return;
    
    const related = allMovies.filter(m => 
        (currentMovie.relatedMovies || []).includes(m.id)
    );
    
    if (related.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No related movies found</p>';
        return;
    }
    
    container.innerHTML = related.map(movie => {
        const posterHtml = movie.posterUrl
            ? `<img src="${movie.posterUrl}" alt="${movie.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'movie-poster-fallback\\'>${movie.poster || '🎬'}</div>';">`
            : `<div class="movie-poster-fallback">${movie.poster || '🎬'}</div>`;

        return `
            <div class="related-movie-card" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
                <div class="related-movie-poster">${posterHtml}</div>
                <div class="related-movie-info">
                    <div class="related-movie-title">${movie.title}</div>
                    <div class="related-movie-year">${movie.year}</div>
                    <div class="accuracy-rating" style="margin-top: 0.5rem;">
                        <span style="font-weight: 600;">${movie.scientificAccuracy.toFixed(1)}</span>
                        <div class="accuracy-stars" style="display: flex; gap: 2px;">
                            ${generateStarRating(movie.scientificAccuracy, 5)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
