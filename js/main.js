/**
 * SciFiLens - Main JavaScript
 * Shared functionality across all pages
 */

// Navigation active state
function updateNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (currentPath.includes(href) || (href === 'index.html' && currentPath.endsWith('/'))) {
            link.classList.add('active');
        }
    });
}

// Mobile hamburger menu
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.style.display = 'none';
            });
        });
    }
}

// Modal functionality
function setupModal(modalSelector) {
    const modal = document.querySelector(modalSelector);
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Smooth scroll for internal links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    setupHamburgerMenu();
    setupSmoothScroll();
    setupModal('.modal');
    setupModal('.experiment-modal');
});

// Utility functions for data fetching
async function fetchJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return null;
    }
}

// Debounce helper
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Throttle helper
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Generate star rating HTML
function generateStarRating(rating, maxRating = 5) {
    let stars = '';
    for (let i = 0; i < maxRating; i++) {
        const filled = i < Math.floor(rating);
        const partial = i < rating && !filled;
        stars += `<span class="accuracy-star ${!filled && !partial ? 'empty' : ''}" title="${rating}">★</span>`;
    }
    return stars;
}

// Format numbers
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// Get score color
function getScoreColor(score) {
    if (score >= 4.5) return '#22c55e'; // Green
    if (score >= 3.5) return '#f59e0b'; // Amber
    if (score >= 2.5) return '#ef4444'; // Red
    return '#ef4444';
}

// Page transition effect
function setupPageTransition() {
    // Add fade-in animation to body
    document.body.style.animation = 'fadeIn 0.5s ease-out';
}

// Initialize page transitions
setupPageTransition();
