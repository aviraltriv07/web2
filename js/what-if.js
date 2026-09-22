/**
 * SciFiLens - WHAT IF? Theoretical Science Logic
 */

let allScenarios = [];
let filteredScenarios = [];
let activeCategory = 'all';
let activePlausibility = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchJSON('data/what-if.json');
    if (data && data.scenarios) {
        allScenarios = data.scenarios;
        filteredScenarios = [...allScenarios];

        setupCategoryTabs();
        setupSearchAndFilters();
        displayScenarios();
        checkURLParams();
    }
});

function setupCategoryTabs() {
    const totalCountEl = document.getElementById('totalScenariosCount');
    if (totalCountEl) totalCountEl.textContent = allScenarios.length;

    const tabsContainer = document.getElementById('whatIfCategoryTabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-tab-btn');
        if (!btn) return;

        tabsContainer.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeCategory = btn.dataset.category || 'all';
        applyFilters();
    });
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('whatIfSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            applyFilters();
        }, 200));
    }

    const plausibilitySelect = document.getElementById('plausibilityFilter');
    if (plausibilitySelect) {
        plausibilitySelect.addEventListener('change', (e) => {
            activePlausibility = e.target.value;
            applyFilters();
        });
    }
}

function applyFilters() {
    filteredScenarios = allScenarios.filter(s => {
        // Category filter
        if (activeCategory !== 'all' && s.category !== activeCategory) {
            return false;
        }

        // Plausibility filter
        if (activePlausibility !== 'all' && s.classificationLevel !== activePlausibility) {
            return false;
        }

        // Search query filter
        if (searchQuery) {
            const matchTitle = s.title.toLowerCase().includes(searchQuery);
            const matchHook = s.hook.toLowerCase().includes(searchQuery);
            const matchCategory = s.category.toLowerCase().includes(searchQuery);
            const matchConcepts = s.keyConcepts && s.keyConcepts.some(c => c.name.toLowerCase().includes(searchQuery));
            if (!matchTitle && !matchHook && !matchCategory && !matchConcepts) {
                return false;
            }
        }

        return true;
    });

    updateScenarioCount();
    displayScenarios();
}

function updateScenarioCount() {
    const countEl = document.getElementById('whatIfCount');
    if (countEl) {
        countEl.textContent = `Showing ${filteredScenarios.length} of ${allScenarios.length} theoretical scenarios`;
    }
}

function displayScenarios() {
    const grid = document.getElementById('whatIfGrid');
    if (!grid) return;

    if (filteredScenarios.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-glass-light); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔭</div>
                <h3 style="font-size: 1.4rem; color: #ffffff; margin-bottom: 0.5rem;">No Scenarios Found</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">No theoretical scenarios match your current search and filter criteria.</p>
                <button class="btn btn-secondary" onclick="resetWhatIfFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredScenarios.map(s => {
        const badgeClass = getPlausibilityClass(s.classificationLevel);
        return `
            <div class="what-if-card" onclick="openScenarioModal(${s.id})">
                <div>
                    <div class="what-if-card-header">
                        <div class="what-if-card-icon">${s.icon || '🌍'}</div>
                        <span class="plausibility-badge ${badgeClass}">${s.classification}</span>
                    </div>
                    <div class="what-if-card-category">${s.category}</div>
                    <h3 class="what-if-card-title">${s.title}</h3>
                    <p class="what-if-card-hook">"${s.hook}"</p>
                </div>
                <div class="what-if-card-footer">
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${(s.keyConcepts || []).slice(0, 2).map(c => `
                            <span class="concept-tag" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;">${c.name}</span>
                        `).join('')}
                    </div>
                    <div class="what-if-explore-btn">
                        <span>Explore Science</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getPlausibilityClass(level) {
    switch (level) {
        case 'plausible': return 'plausible';
        case 'theoretical': return 'theoretical';
        case 'unlikely': return 'unlikely';
        case 'impossible': return 'impossible';
        default: return 'theoretical';
    }
}

function openScenarioModal(scenarioId) {
    const scenario = allScenarios.find(s => s.id === scenarioId || s.slug === scenarioId);
    if (!scenario) return;

    const modal = document.getElementById('scenarioModal');
    const body = document.getElementById('scenarioModalBody');
    if (!modal || !body) return;

    const badgeClass = getPlausibilityClass(scenario.classificationLevel);

    // Formula card markup
    const formulaHtml = scenario.formulaBreakdown ? `
        <div class="equation-card">
            <div class="equation-display">${scenario.formula}</div>
            <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 0.75rem;">${scenario.formulaBreakdown.meaning}</p>
            <div class="equation-variables">
                ${(scenario.formulaBreakdown.variables || []).map(v => `
                    <div class="var-item">
                        <span class="var-symbol">${v.symbol}</span>
                        <span class="var-meaning">${v.name}: <strong>${v.value}</strong></span>
                    </div>
                `).join('')}
            </div>
            ${scenario.formulaBreakdown.example ? `
                <div class="equation-example">
                    <strong>Worked Example:</strong> ${scenario.formulaBreakdown.example}
                </div>
            ` : ''}
        </div>
    ` : '';

    // Related movies markup
    const relatedMoviesHtml = (scenario.relatedMovieTitles || []).map((title, idx) => {
        const movieId = (scenario.relatedMovies || [])[idx] || 1;
        return `
            <a href="movie-detail.html?id=${movieId}" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.9rem; text-decoration: none;">
                🎬 ${title}
            </a>
        `;
    }).join('');

    body.innerHTML = `
        <div class="scenario-hero">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                <span class="plausibility-badge ${badgeClass}">${scenario.classificationBadge || scenario.classification}</span>
                <span style="font-size: 0.85rem; color: #38bdf8; font-weight: 600;">${scenario.category}</span>
            </div>
            <h2 class="scenario-title">${scenario.title}</h2>
            <div class="scenario-hook">"${scenario.hook}"</div>
            
            <!-- 3-Tier Explanation Level Switcher -->
            <div style="margin-top: 1.25rem;">
                <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                    Science Explanation Depth
                </div>
                <div class="level-switcher" id="scenarioLevelSwitcher">
                    <button class="level-btn active" data-level="beginner">🟢 Beginner</button>
                    <button class="level-btn" data-level="explorer">🟡 Explorer</button>
                    <button class="level-btn" data-level="deepScience">🔴 Deep Science</button>
                </div>
                <div class="level-content-box beginner" id="scenarioLevelContent">
                    ${scenario.levels ? scenario.levels.beginner : scenario.scienceBehindIt}
                </div>
            </div>
        </div>

        <!-- 7-Stage Detailed Scientific Breakdown -->
        <div class="timeline-section">
            <h3 style="font-size: 1.3rem; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                <span>🔬</span> Scientific Progression & Consequences
            </h3>

            <!-- 01 The Immediate Effect -->
            <div class="timeline-card">
                <div class="timeline-header">
                    <span class="timeline-step-num">01</span>
                    <h4 class="timeline-step-title">The Immediate Effect (First Seconds & Minutes)</h4>
                </div>
                <p class="timeline-body">${scenario.immediateEffect}</p>
            </div>

            <!-- 02 The First Few Hours -->
            <div class="timeline-card">
                <div class="timeline-header">
                    <span class="timeline-step-num">02</span>
                    <h4 class="timeline-step-title">The First Few Hours (Physical Consequences)</h4>
                </div>
                <p class="timeline-body">${scenario.firstFewHours}</p>
            </div>

            <!-- 03 Days and Weeks Later -->
            <div class="timeline-card">
                <div class="timeline-header">
                    <span class="timeline-step-num">03</span>
                    <h4 class="timeline-step-title">Days & Weeks Later (Atmospheric, Environmental & Biological)</h4>
                </div>
                <p class="timeline-body">${scenario.daysAndWeeksLater}</p>
            </div>

            <!-- 04 Long-Term Consequences -->
            <div class="timeline-card">
                <div class="timeline-header">
                    <span class="timeline-step-num">04</span>
                    <h4 class="timeline-step-title">Long-Term Consequences (Months, Years & Centuries)</h4>
                </div>
                <p class="timeline-body">${scenario.longTermConsequences}</p>
            </div>

            <!-- 05 The Science Behind It -->
            <div class="timeline-card" style="border-left: 3px solid #0066ff;">
                <div class="timeline-header">
                    <span class="timeline-step-num" style="background: linear-gradient(135deg, #0066ff, #06b6d4);">05</span>
                    <h4 class="timeline-step-title">The Science Behind It (Governing Physical Laws)</h4>
                </div>
                <p class="timeline-body">${scenario.scienceBehindIt}</p>
                ${formulaHtml}
            </div>

            <!-- 06 Could This Really Happen? -->
            <div class="timeline-card" style="border-left: 3px solid ${scenario.classificationColor || '#06b6d4'};">
                <div class="timeline-header">
                    <span class="timeline-step-num" style="background: ${scenario.classificationColor || '#06b6d4'};">06</span>
                    <h4 class="timeline-step-title">Could This Really Happen? (Scientific Feasibility Assessment)</h4>
                </div>
                <div style="margin-bottom: 0.75rem;">
                    <span class="plausibility-badge ${badgeClass}">${scenario.classificationBadge || scenario.classification}</span>
                </div>
                <p class="timeline-body">${scenario.couldItHappen}</p>
            </div>

            <!-- 07 Key Scientific Concepts Involved -->
            <div class="timeline-card">
                <div class="timeline-header">
                    <span class="timeline-step-num">07</span>
                    <h4 class="timeline-step-title">Key Scientific Concepts Involved (Click to Learn More)</h4>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 0.75rem;">
                    ${(scenario.keyConcepts || []).map(c => `
                        <button class="concept-tag" data-concept="${c.name}" style="border: 1px solid rgba(6, 182, 212, 0.4); background: rgba(6, 182, 212, 0.15); color: #38bdf8; cursor: pointer;">
                            ⚛️ ${c.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Related Movies Section -->
        ${relatedMoviesHtml ? `
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <h4 style="font-size: 1.05rem; color: #ffffff; margin-bottom: 0.75rem;">🎬 Related Sci-Fi Films Exploring This Concept:</h4>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    ${relatedMoviesHtml}
                </div>
            </div>
        ` : ''}
    `;

    // Setup 3-tier level switcher inside modal
    const switcher = body.querySelector('#scenarioLevelSwitcher');
    const contentBox = body.querySelector('#scenarioLevelContent');
    if (switcher && contentBox && scenario.levels) {
        switcher.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switcher.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const level = btn.dataset.level;
                contentBox.className = `level-content-box ${level}`;
                contentBox.innerHTML = scenario.levels[level] || scenario.levels.beginner;
            });
        });
    }

    modal.classList.add('active');
}

function resetWhatIfFilters() {
    activeCategory = 'all';
    activePlausibility = 'all';
    searchQuery = '';

    const searchInput = document.getElementById('whatIfSearchInput');
    if (searchInput) searchInput.value = '';

    const plausibilitySelect = document.getElementById('plausibilityFilter');
    if (plausibilitySelect) plausibilitySelect.value = 'all';

    const tabsContainer = document.getElementById('whatIfCategoryTabs');
    if (tabsContainer) {
        tabsContainer.querySelectorAll('.category-tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.category === 'all');
        });
    }

    applyFilters();
}

function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const scenarioParam = params.get('scenario');
    const categoryParam = params.get('category');

    if (categoryParam) {
        activeCategory = categoryParam;
        const tabsContainer = document.getElementById('whatIfCategoryTabs');
        if (tabsContainer) {
            tabsContainer.querySelectorAll('.category-tab-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.category === categoryParam);
            });
        }
        applyFilters();
    }

    if (scenarioParam) {
        const target = allScenarios.find(s => s.slug === scenarioParam || String(s.id) === scenarioParam);
        if (target) {
            setTimeout(() => openScenarioModal(target.id), 150);
        }
    }
}

window.openScenarioModal = openScenarioModal;
window.resetWhatIfFilters = resetWhatIfFilters;
