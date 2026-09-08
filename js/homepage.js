/**
 * SciFiLens - Homepage
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load featured movies
    const moviesData = await fetchJSON('data/movies.json');
    const scienceData = await fetchJSON('data/science-concepts.json');
    
    if (moviesData) {
        displayFeaturedMovies(moviesData.movies.slice(0, 6));
    }
    
    if (scienceData) {
        displayScienceCategories(scienceData.concepts);
    }
    
    if (moviesData) {
        displayAccuracyRatings(moviesData.movies.slice(0, 4));
    }
});

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
                            `<span class="concept-tag">${concept}</span>`
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
        <div class="category-card" onclick="window.location.href='science.html'">
            <div class="category-icon">${concept.icon}</div>
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
