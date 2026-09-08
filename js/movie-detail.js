/**
 * SciFiLens - Movie Detail Page
 */

let currentMovie = null;
let allMovies = [];

document.addEventListener('DOMContentLoaded', async () => {
    const movieId = getMovieIdFromURL();
    
    const moviesData = await fetchJSON('data/movies.json');
    
    if (moviesData) {
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
            <section class="movie-detail-section" style="text-align: center; padding: 3rem;">
                <h1 style="font-size: 2rem; margin-bottom: 1rem;">Movie Not Found</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    The movie you're looking for doesn't exist.
                </p>
                <a href="movies.html" class="btn btn-primary">Back to Movies</a>
            </section>
        `;
        content.style.display = 'block';
    }
}

function displayMovieDetails() {
    // Hide loading state
    const loading = document.getElementById('loadingState');
    if (loading) loading.style.display = 'none';
    
    // Show content
    const content = document.getElementById('movieContent');
    if (content) content.style.display = 'block';
    
    displayBackdrop();
    displayMovieInfo();
    displayScienceBehind();
    displayComparison();
    displayRelatedMovies();
}

function displayBackdrop() {
    const backdrop = document.getElementById('movieBackdrop');
    if (backdrop) {
        if (currentMovie.posterUrl) {
            backdrop.style.backgroundImage = `linear-gradient(180deg, rgba(10, 14, 39, 0.5) 0%, var(--bg-dark) 100%), url('${currentMovie.posterUrl}')`;
            backdrop.style.backgroundSize = 'cover';
            backdrop.style.backgroundPosition = 'center';
        }
        backdrop.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 8rem; opacity: ${currentMovie.posterUrl ? '0.15' : '0.3'};">
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
            poster.innerHTML = `<img src="${currentMovie.posterUrl}" alt="${currentMovie.title} movie poster" class="movie-poster-image" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'movie-poster-fallback\\'>${currentMovie.poster || '🎬'}</div>';">`;
        } else {
            poster.innerHTML = `<div class="movie-poster-fallback">${currentMovie.poster || '🎬'}</div>`;
        }
    }
    
    // Accuracy Score
    const scoreEl = document.getElementById('accuracyScore');
    if (scoreEl) {
        scoreEl.innerHTML = `
            <div style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">
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
    
    // Concepts
    const conceptsList = document.getElementById('conceptsList');
    if (conceptsList) {
        conceptsList.innerHTML = currentMovie.concepts.map(concept => `
            <span class="concept-tag" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                ${concept}
            </span>
        `).join('');
    }
}

function displayScienceBehind() {
    const container = document.getElementById('scienceConcepts');
    if (!container) return;
    
    container.innerHTML = currentMovie.scientificConcepts.map(concept => `
        <div class="science-concept">
            <h3>${concept.name}</h3>
            <p>${concept.explanation}</p>
        </div>
    `).join('');
}

function displayComparison() {
    const container = document.getElementById('comparisonCards');
    if (!container) return;
    
    const accuracy = currentMovie.accuracy;
    const percentage = accuracy.percentage;
    
    container.innerHTML = `
        <div class="comparison-card">
            <div class="comparison-item movie">
                <h4>Movie Depiction</h4>
                <p>${accuracy.movie}</p>
            </div>
            <div class="comparison-item">
                <h4>Real Science</h4>
                <p>${accuracy.reality}</p>
            </div>
            <div class="accuracy-comparison">
                <div class="accuracy-percentage">${percentage}%</div>
                <p>Scientific Accuracy</p>
                <div class="score-bar">
                    <div class="score-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        </div>
    `;
}

function displayRelatedMovies() {
    const container = document.getElementById('relatedMovies');
    if (!container) return;
    
    const related = allMovies.filter(m => 
        currentMovie.relatedMovies.includes(m.id)
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
