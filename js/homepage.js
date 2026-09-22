/**
 * SciFiLens - Homepage Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load movies, what-if scenarios, and concepts
    const [moviesData, whatIfData, scienceData] = await Promise.all([
        fetchJSON('data/movies.json'),
        fetchJSON('data/what-if.json'),
        fetchJSON('data/science-concepts.json')
    ]);
    
    if (whatIfData && whatIfData.scenarios) {
        displayHomepageWhatIfs(whatIfData.scenarios.slice(0, 3));
    }

    if (moviesData && moviesData.movies) {
        displayFeaturedMovies(moviesData.movies.slice(0, 6));
        displayAccuracyRatings(moviesData.movies.slice(0, 4));
    }
    
    if (scienceData && scienceData.concepts) {
        displayScienceCategories(scienceData.concepts.slice(0, 8));
    }
});

function displayHomepageWhatIfs(scenarios) {
    const container = document.getElementById('homepageWhatIfGrid');
    if (!container) return;

    container.innerHTML = scenarios.map(s => `
        <div class="what-if-card" onclick="window.location.href='what-if.html?scenario=${s.slug || s.id}'">
            <div>
                <div class="what-if-card-header">
                    <div class="what-if-card-icon">${s.icon || '🌍'}</div>
                    <span class="plausibility-badge ${s.classificationLevel || 'theoretical'}">${s.classification}</span>
                </div>
                <div class="what-if-card-category">${s.category}</div>
                <h3 class="what-if-card-title">${s.title}</h3>
                <p class="what-if-card-hook">"${s.hook}"</p>
            </div>
            <div class="what-if-card-footer">
                <span style="font-size: 0.8rem; color: #38bdf8; font-weight: 600;">Explore 7-Stage Breakdown →</span>
            </div>
        </div>
    `).join('');
}

function displayFeaturedMovies(movies) {
    const container = document.getElementById('featuredMovies');
    if (!container) return;
    
    container.innerHTML = movies.map(movie => {
        const posterHtml = movie.posterUrl 
            ? `<img src="${movie.posterUrl}" alt="${movie.title} poster" class="movie-poster-image" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'movie-poster-fallback\\'>${movie.poster || '🎬'}</div>';">`
            : `<div class="movie-poster-fallback">${movie.poster || '🎬'}</div>`;

        return `
            <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
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
                    <div class="concepts-tags">
                        ${movie.concepts.slice(0, 3).map(concept => 
                            `<span class="concept-tag" data-concept="${concept}">${concept}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayScienceCategories(concepts) {
    const container = document.getElementById('scienceCategories');
    if (!container) return;
    
    container.innerHTML = concepts.map(concept => `
        <div class="category-card" onclick="window.location.href='concepts.html?concept=${concept.slug || concept.id}'">
            <div class="category-icon">${concept.icon || '⚛️'}</div>
            <h3 class="category-title">${concept.title}</h3>
            <p class="category-description">${concept.description}</p>
        </div>
    `).join('');
}

function displayAccuracyRatings(movies) {
    const container = document.getElementById('accuracyRatings');
    if (!container) return;
    
    container.innerHTML = movies.map(movie => {
        const scorePercentage = (movie.scientificAccuracy / 5) * 100;
        const posterHtml = movie.posterUrl 
            ? `<img src="${movie.posterUrl}" alt="${movie.title} poster" class="movie-poster-image" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'movie-poster-fallback\\'>${movie.poster || '🎬'}</div>';">`
            : `<div class="movie-poster-fallback">${movie.poster || '🎬'}</div>`;

        return `
            <div class="accuracy-card" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
                <div class="accuracy-card-poster">
                    ${posterHtml}
                </div>
                <div class="accuracy-card-content">
                    <h3 class="accuracy-card-title">${movie.title}</h3>
                    <p class="accuracy-card-year">${movie.year}</p>
                    <div class="accuracy-score-display">
                        <span class="score-number">${movie.scientificAccuracy.toFixed(1)}</span>
                        <div class="score-bar">
                            <div class="score-bar-fill" style="width: ${scorePercentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
