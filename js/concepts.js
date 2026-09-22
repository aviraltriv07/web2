/**
 * SciFiLens - Concepts Encyclopedia & Interactive Simulators Logic
 */

let allConcepts = [];
let filteredConcepts = [];
let activeConceptCategory = 'all';
let conceptSearchQuery = '';

// Celestial bodies gravitational constants
const CELESTIAL_BODIES = {
    earth: { name: 'Earth', g: 9.80665, icon: '🌍', desc: 'Standard Earth baseline: muscles and bone density are evolved for this force.' },
    moon: { name: 'Moon', g: 1.622, icon: '🌕', desc: 'At ~1/6th Earth gravity, you feel weightless and can easily leap over 3 meters high with a single bound!' },
    mars: { name: 'Mars', g: 3.721, icon: '🔴', desc: 'At 38% Earth gravity, walking requires a bouncing gait. Carrying a 100 kg load feels like 38 kg.' },
    jupiter: { name: 'Jupiter (Cloud Tops)', g: 24.79, icon: '🪐', desc: 'Crushing gravity: you weigh 2.5x more. Standing upright would be exhausting; jumping is virtually impossible.' },
    europa: { name: 'Europa', g: 1.315, icon: '🧊', desc: 'Weak gravity on Jupiter’s icy ocean moon: you can leap 7x higher into the vacuum sky.' },
    titan: { name: 'Titan', g: 1.352, icon: '🪐', desc: 'Low gravity combined with thick atmosphere (1.5x Earth pressure) means a human could fly by strapping wings to their arms!' },
    neutronStar: { name: 'Neutron Star Surface', g: 1.0e12, icon: '🌟', desc: 'Extreme relativistic gravitational field: tidal forces would crush any atomic structure into a superdense 1-atom-thick plasma layer instantly.' }
};

let currentPlanetKey = 'earth';

document.addEventListener('DOMContentLoaded', async () => {
    initTimeDilationSimulator();
    initGravitySimulator();

    const data = await fetchJSON('data/science-concepts.json');
    if (data && data.concepts) {
        allConcepts = data.concepts;
        filteredConcepts = [...allConcepts];

        setupConceptCategoryTabs();
        setupConceptSearch();
        displayConceptCards();
        checkConceptsURLParams();
    }
});

/* ============================================================
   1. TIME DILATION SIMULATOR
   ============================================================ */

function initTimeDilationSimulator() {
    const vSlider = document.getElementById('velocitySlider');
    const tSlider = document.getElementById('properTimeSlider');
    const vText = document.getElementById('velocityValueText');
    const tText = document.getElementById('properTimeText');
    const presets = document.querySelectorAll('#timeDilationCalc .calc-preset-btn');

    function updateCalculations() {
        const v = parseFloat(vSlider.value); // 0.0 to 0.9999
        const tau = parseFloat(tSlider.value); // proper time years

        // Lorentz Factor: γ = 1 / √(1 - v²)
        const gamma = (v >= 1) ? Infinity : 1 / Math.sqrt(1 - (v * v));
        const coordinateTime = tau * gamma;
        const speedKmh = v * 299792.458 * 3600; // km/h

        // Update UI
        if (vText) vText.textContent = `${v.toFixed(4)} c (${(v * 100).toFixed(2)}% light speed)`;
        if (tText) tText.textContent = `${tau.toFixed(1)} Year${tau > 1 ? 's' : ''} (Ship Proper Time)`;

        const shipTimeEl = document.getElementById('shipClockTime');
        const earthTimeEl = document.getElementById('earthClockTime');
        const gammaEl = document.getElementById('gammaValue');
        const speedEl = document.getElementById('actualSpeedKmh');
        const summaryEl = document.getElementById('timeDilationSummary');

        if (shipTimeEl) shipTimeEl.textContent = `${tau.toFixed(1)} Year${tau > 1 ? 's' : ''}`;
        if (earthTimeEl) {
            if (coordinateTime > 10000) {
                earthTimeEl.textContent = `${coordinateTime.toExponential(2)} Years`;
            } else {
                earthTimeEl.textContent = `${coordinateTime.toFixed(2)} Years`;
            }
        }
        if (gammaEl) gammaEl.textContent = gamma > 1000 ? gamma.toExponential(2) : gamma.toFixed(3);
        if (speedEl) speedEl.textContent = `${Math.round(speedKmh).toLocaleString()} km/h`;

        if (summaryEl) {
            if (v === 0) {
                summaryEl.textContent = `At rest relative to Earth, clocks tick at identical rates (γ = 1.000).`;
            } else {
                const ratio = gamma.toFixed(2);
                summaryEl.textContent = `For every ${tau} year${tau > 1 ? 's' : ''} experienced on the ship at ${(v * 100).toFixed(2)}% light speed, ${coordinateTime.toFixed(2)} years elapse on Earth (Time dilation factor: ${ratio}×).`;
            }
        }
    }

    if (vSlider) vSlider.addEventListener('input', updateCalculations);
    if (tSlider) tSlider.addEventListener('input', updateCalculations);

    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            const vVal = parseFloat(btn.dataset.v);
            if (vSlider) vSlider.value = vVal;
            updateCalculations();
        });
    });

    updateCalculations();
}

/* ============================================================
   2. PLANETARY GRAVITY & WEIGHT SIMULATOR
   ============================================================ */

function initGravitySimulator() {
    const massSlider = document.getElementById('userMassSlider');
    const massText = document.getElementById('userMassText');
    const planetBtns = document.querySelectorAll('#planetPresets .calc-preset-btn');

    function updateGravityCalculations() {
        const mass = parseFloat(massSlider ? massSlider.value : 70);
        const planet = CELESTIAL_BODIES[currentPlanetKey] || CELESTIAL_BODIES.earth;

        // Weight in Newtons: W = m * g
        const weightN = mass * planet.g;
        // Felt mass (in Earth kg equivalents): m_felt = weightN / 9.807
        const feltKg = weightN / 9.80665;
        // Jump height baseline ~0.5m on Earth: h = 0.5 * (9.807 / g)
        const jumpH = (planet.g > 1000) ? 0.000 : Math.min(100, 0.5 * (9.80665 / planet.g));

        if (massText) {
            const lbs = Math.round(mass * 2.20462);
            massText.textContent = `${mass} kg (${lbs} lbs)`;
        }

        const weightEl = document.getElementById('weightNewtons');
        const feltEl = document.getElementById('feltMassKg');
        const jumpEl = document.getElementById('jumpHeightText');
        const descEl = document.getElementById('planetPhysicsDesc');

        if (weightEl) {
            if (weightN > 1000000) {
                weightEl.textContent = `${weightN.toExponential(2)} N`;
            } else {
                weightEl.textContent = `${weightN.toFixed(1)} N`;
            }
        }

        if (feltEl) {
            if (feltKg > 1000000) {
                feltEl.textContent = `${feltKg.toExponential(2)} kg`;
            } else {
                feltEl.textContent = `${feltKg.toFixed(1)} kg (${Math.round(feltKg * 2.20462)} lbs)`;
            }
        }

        if (jumpEl) {
            if (jumpH === 0) {
                jumpEl.textContent = `0.00 meters (Crushed)`;
                jumpEl.style.color = '#ef4444';
            } else {
                jumpEl.textContent = `${jumpH.toFixed(2)} meters`;
                jumpEl.style.color = '#4ade80';
            }
        }

        if (descEl) {
            descEl.innerHTML = `<strong>${planet.name} ($g = ${planet.g > 1000 ? planet.g.toExponential(1) : planet.g.toFixed(2)}\\text{ m/s}^2$):</strong> ${planet.desc}`;
        }
    }

    if (massSlider) massSlider.addEventListener('input', updateGravityCalculations);

    planetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            planetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlanetKey = btn.dataset.planet || 'earth';
            updateGravityCalculations();
        });
    });

    updateGravityCalculations();
}

/* ============================================================
   3. CONCEPTS ENCYCLOPEDIA GRID & 3-LEVEL MODAL
   ============================================================ */

function setupConceptCategoryTabs() {
    const tabsContainer = document.getElementById('conceptCategoryTabs');
    if (!tabsContainer) return;

    tabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-tab-btn');
        if (!btn) return;

        tabsContainer.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeConceptCategory = btn.dataset.category || 'all';
        applyConceptFilters();
    });

    const resetBtn = document.getElementById('resetConceptFiltersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeConceptCategory = 'all';
            conceptSearchQuery = '';
            const searchInput = document.getElementById('conceptSearchInput');
            if (searchInput) searchInput.value = '';
            tabsContainer.querySelectorAll('.category-tab-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.category === 'all');
            });
            applyConceptFilters();
        });
    }
}

function setupConceptSearch() {
    const searchInput = document.getElementById('conceptSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            conceptSearchQuery = e.target.value.trim().toLowerCase();
            applyConceptFilters();
        }, 200));
    }
}

function applyConceptFilters() {
    filteredConcepts = allConcepts.filter(c => {
        if (activeConceptCategory !== 'all' && c.category.toLowerCase() !== activeConceptCategory.toLowerCase()) {
            return false;
        }

        if (conceptSearchQuery) {
            const matchTitle = c.title.toLowerCase().includes(conceptSearchQuery);
            const matchDesc = c.description.toLowerCase().includes(conceptSearchQuery);
            const matchCat = c.category.toLowerCase().includes(conceptSearchQuery);
            if (!matchTitle && !matchDesc && !matchCat) {
                return false;
            }
        }

        return true;
    });

    const countEl = document.getElementById('conceptsCountText');
    if (countEl) {
        countEl.textContent = `Showing ${filteredConcepts.length} of ${allConcepts.length} science concepts`;
    }

    displayConceptCards();
}

function displayConceptCards() {
    const grid = document.getElementById('conceptsGrid');
    if (!grid) return;

    if (filteredConcepts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-glass-light); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <h3 style="font-size: 1.4rem; color: #ffffff; margin-bottom: 0.5rem;">No Concepts Found</h3>
                <p style="color: var(--text-secondary);">Try clearing your search or switching categories.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredConcepts.map(c => `
        <div class="science-card" onclick="openConceptEncyclopediaModal(${c.id})" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div class="science-card-icon">${c.icon || '⚛️'}</div>
                    <span class="confidence-badge ${getConfidenceClass(c.confidenceLabel || 'Established Science')}">
                        ${c.confidenceLabel || 'Established Science'}
                    </span>
                </div>
                <h3 class="science-card-title">${c.title}</h3>
                <p class="science-card-description">${c.description}</p>
                ${c.formula ? `
                    <div style="font-family: 'Cambria Math', serif; color: #38bdf8; background: rgba(0,0,0,0.3); padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.95rem; margin: 0.75rem 0; border: 1px dashed rgba(6,182,212,0.3); text-align: center;">
                        ${c.formula}
                    </div>
                ` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06);">
                <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">${c.category}</span>
                <span class="difficulty-badge ${(c.difficulty || 'intermediate').toLowerCase()}">${c.difficulty || 'Intermediate'}</span>
            </div>
        </div>
    `).join('');
}

function openConceptEncyclopediaModal(conceptId) {
    const concept = allConcepts.find(c => c.id === conceptId || c.slug === conceptId);
    if (!concept) return;

    const modal = document.getElementById('conceptEncyclopediaModal');
    const body = document.getElementById('conceptEncyclopediaModalBody');
    if (!modal || !body) return;

    const formulaHtml = concept.formulaBreakdown ? `
        <div class="equation-card">
            <div class="equation-display">${concept.formula}</div>
            <p style="font-size: 0.95rem; color: #cbd5e1; margin-bottom: 0.75rem;">${concept.formulaBreakdown.meaning}</p>
            <div class="equation-variables">
                ${(concept.formulaBreakdown.variables || []).map(v => `
                    <div class="var-item">
                        <span class="var-symbol">${v.symbol}</span>
                        <span class="var-meaning">${v.name}: <strong>${v.value}</strong></span>
                    </div>
                `).join('')}
            </div>
            ${concept.formulaBreakdown.utility ? `
                <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem;">
                    <strong>When Useful:</strong> ${concept.formulaBreakdown.utility}
                </div>
            ` : ''}
            ${concept.formulaBreakdown.example ? `
                <div class="equation-example">
                    <strong>Worked Example:</strong> ${concept.formulaBreakdown.example}
                </div>
            ` : ''}
        </div>
    ` : (concept.formula ? `<div class="equation-card"><div class="equation-display">${concept.formula}</div></div>` : '');

    const levels = concept.levels || {
        beginner: concept.description,
        explorer: concept.explanation || concept.description,
        deepScience: concept.explanation || concept.description
    };

    const relatedMoviesHtml = (concept.relatedMovieTitles || []).map((title, idx) => {
        const movieId = (concept.relatedMovies || [])[idx] || 1;
        return `
            <a href="movie-detail.html?id=${movieId}" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.35rem 0.85rem; text-decoration: none;">
                🎬 ${title}
            </a>
        `;
    }).join('');

    const relatedWhatIfsHtml = (concept.relatedWhatIfs || []).map(wId => `
        <a href="what-if.html?scenario=${wId}" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.35rem 0.85rem; text-decoration: none; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
            🌌 Explore What If Scenario #${wId} →
        </a>
    `).join('');

    body.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="font-size: 2.5rem; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-md); border: 1px solid var(--border-color); flex-shrink: 0;">
                    ${concept.icon || '⚛️'}
                </div>
                <div>
                    <span class="confidence-badge ${getConfidenceClass(concept.confidenceLabel || 'Established Science')}" style="margin-bottom: 0.4rem;">
                        ${concept.confidenceLabel || 'Established Science'}
                    </span>
                    <h2 style="font-size: 1.75rem; color: #ffffff; margin: 0; line-height: 1.2;">${concept.title}</h2>
                    <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600; margin-top: 0.25rem;">${concept.category} • Difficulty: ${concept.difficulty || 'Intermediate'}</div>
                </div>
            </div>
        </div>

        <p style="font-size: 1.05rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 1.25rem;">${concept.description}</p>

        <!-- 3-Tier Explanation Switcher -->
        <div>
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.5px; margin-bottom: 0.5rem;">
                Explanation Depth (Select Knowledge Tier)
            </div>
            <div class="level-switcher" id="encyclopediaLevelSwitcher">
                <button class="level-btn active" data-level="beginner">🟢 Beginner</button>
                <button class="level-btn" data-level="explorer">🟡 Explorer</button>
                <button class="level-btn" data-level="deepScience">🔴 Deep Science</button>
            </div>
            <div class="level-content-box beginner" id="encyclopediaLevelBox">
                ${levels.beginner}
            </div>
        </div>

        ${formulaHtml}

        <!-- Real-World Applications -->
        ${(concept.applications && concept.applications.length > 0) ? `
            <div class="modal-section" style="margin-top: 1.5rem;">
                <h3 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 0.75rem;">🌍 Real-World Technologies & Applications:</h3>
                <ul class="applications-list" style="padding-left: 1.25rem; color: #cbd5e1; font-size: 0.95rem; line-height: 1.7;">
                    ${concept.applications.map(app => `<li>${app}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <!-- Related Movies and What-Ifs -->
        ${(relatedMoviesHtml || relatedWhatIfsHtml) ? `
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                ${relatedMoviesHtml ? `
                    <div style="margin-bottom: 1rem;">
                        <h4 style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 0.5rem;">🎬 Featured in Sci-Fi Films:</h4>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">${relatedMoviesHtml}</div>
                    </div>
                ` : ''}
                ${relatedWhatIfsHtml ? `
                    <div>
                        <h4 style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 0.5rem;">🌌 Related Theoretical Scenarios:</h4>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">${relatedWhatIfsHtml}</div>
                    </div>
                ` : ''}
            </div>
        ` : ''}
    `;

    // Setup 3-tier switcher inside modal
    const switcher = body.querySelector('#encyclopediaLevelSwitcher');
    const contentBox = body.querySelector('#encyclopediaLevelBox');
    if (switcher && contentBox) {
        switcher.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switcher.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const level = btn.dataset.level;
                contentBox.className = `level-content-box ${level}`;
                contentBox.innerHTML = levels[level] || levels.beginner;
            });
        });
    }

    modal.classList.add('active');
}

function checkConceptsURLParams() {
    const params = new URLSearchParams(window.location.search);
    const conceptParam = params.get('concept');
    const searchParam = params.get('search');

    if (searchParam) {
        conceptSearchQuery = searchParam.toLowerCase();
        const searchInput = document.getElementById('conceptSearchInput');
        if (searchInput) searchInput.value = searchParam;
        applyConceptFilters();
    }

    if (conceptParam) {
        const target = allConcepts.find(c => c.slug === conceptParam || String(c.id) === conceptParam || c.title.toLowerCase() === conceptParam.toLowerCase());
        if (target) {
            setTimeout(() => openConceptEncyclopediaModal(target.id), 150);
        }
    }
}

window.openConceptEncyclopediaModal = openConceptEncyclopediaModal;
