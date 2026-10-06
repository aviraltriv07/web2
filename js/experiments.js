/**
 * SciFiLens - Interactive Physics Laboratory Engine
 * 60 FPS Canvas Physics Simulations, Live Mathematical Computing & Cosmic Presets
 */

let allExperiments = [];
let currentExperiment = null;
let currentControls = {};
let animFrameId = null;
let simTime = 0;

// Filter states
let activeCategory = 'all';
let activeDifficulty = 'all';
let searchQuery = '';

// Physical Constants
const G = 6.67430e-11;      // Gravitational constant (m^3 kg^-1 s^-2)
const c = 299792458;        // Speed of light (m/s)
const M_sun = 1.989e30;     // Solar mass (kg)
const M_earth = 5.972e24;   // Earth mass (kg)

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const expData = await fetchJSON('data/experiments.json');
        if (expData && Array.isArray(expData.experiments)) {
            allExperiments = expData.experiments;
            setupFilterPills();
            setupSearchAndControls();
            renderExperimentsGrid();

            // Check URL param ?id=X or ?experiment=X to auto-open
            const urlParams = new URLSearchParams(window.location.search);
            const expId = urlParams.get('id') || urlParams.get('experiment');
            if (expId) {
                const matched = allExperiments.find(e => e.id === parseInt(expId) || e.title.toLowerCase().includes(expId.toLowerCase()));
                if (matched) {
                    openExperiment(matched.id);
                }
            }
        }
    } catch (err) {
        console.error('Failed to load experiments:', err);
    }

    setupModalCloseEvents();
});

/* ============================================================
   FILTERS & SEARCH SYSTEM
   ============================================================ */

function setupFilterPills() {
    // 1. Categories
    const categoryContainer = document.getElementById('categoryFilters');
    if (categoryContainer) {
        const categories = ['all', ...new Set(allExperiments.map(e => e.category))];
        categoryContainer.innerHTML = categories.map(cat => `
            <button class="filter-pill ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
                ${cat === 'all' ? 'All Fields' : cat}
            </button>
        `).join('');

        categoryContainer.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                categoryContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.dataset.category;
                renderExperimentsGrid();
            });
        });
    }

    // 2. Difficulties
    const diffContainer = document.getElementById('difficultyFilters');
    if (diffContainer) {
        const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];
        diffContainer.innerHTML = difficulties.map(diff => `
            <button class="filter-pill ${diff === activeDifficulty ? 'active' : ''}" data-diff="${diff}">
                ${diff === 'all' ? 'All Levels' : diff}
            </button>
        `).join('');

        diffContainer.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                diffContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDifficulty = btn.dataset.diff;
                renderExperimentsGrid();
            });
        });
    }
}

function setupSearchAndControls() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            renderExperimentsGrid();
        }, 150));
    }

    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeCategory = 'all';
            activeDifficulty = 'all';
            searchQuery = '';
            if (searchInput) searchInput.value = '';

            document.querySelectorAll('#categoryFilters .filter-pill').forEach(b => {
                b.classList.toggle('active', b.dataset.category === 'all');
            });
            document.querySelectorAll('#difficultyFilters .filter-pill').forEach(b => {
                b.classList.toggle('active', b.dataset.diff === 'all');
            });

            renderExperimentsGrid();
        });
    }
}

function renderExperimentsGrid() {
    const grid = document.getElementById('experimentsGrid');
    const countEl = document.getElementById('experimentsCount');
    if (!grid) return;

    const filtered = allExperiments.filter(exp => {
        const matchesCat = activeCategory === 'all' || exp.category === activeCategory;
        const matchesDiff = activeDifficulty === 'all' || exp.difficulty.toLowerCase() === activeDifficulty.toLowerCase();
        const matchesSearch = !searchQuery || 
            exp.title.toLowerCase().includes(searchQuery) ||
            exp.description.toLowerCase().includes(searchQuery) ||
            exp.category.toLowerCase().includes(searchQuery) ||
            (exp.relatedMovies && exp.relatedMovies.some(m => m.toLowerCase().includes(searchQuery)));

        return matchesCat && matchesDiff && matchesSearch;
    });

    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} of ${allExperiments.length} physics simulators`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-experiments-msg">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔬</div>
                <h3>No simulators found matching your criteria</h3>
                <p>Try resetting the search filters or adjusting category settings.</p>
                <button class="btn btn-secondary" onclick="document.getElementById('resetFilters').click()" style="margin-top: 1rem;">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(exp => `
        <div class="experiment-card" onclick="openExperiment(${exp.id})">
            <div class="experiment-card-top">
                <div class="experiment-card-icon">${exp.icon || '⚡'}</div>
                <div class="experiment-badges">
                    <span class="card-badge cat-${exp.category.toLowerCase().replace(/\s+/g, '-')}">${exp.category}</span>
                    <span class="card-badge diff-${exp.difficulty.toLowerCase()}">${exp.difficulty}</span>
                </div>
            </div>

            <h3 class="experiment-card-title">${exp.title}</h3>
            <p class="experiment-card-description">${exp.description}</p>

            <div class="experiment-card-formula-preview">
                <code>\\[ ${exp.formula || 'Physical Equation'} \\]</code>
            </div>

            <div class="experiment-card-footer">
                <span class="footer-param-count">🎛️ ${exp.controls.length} Interactive Parameters</span>
                <span class="launch-btn">Launch Simulator →</span>
            </div>
        </div>
    `).join('');
}

/* ============================================================
   EXPERIMENT MODAL & CONTROLS MANAGEMENT
   ============================================================ */

function setupModalCloseEvents() {
    const modal = document.getElementById('experimentModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', closeExperimentModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeExperimentModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeExperimentModal();
        }
    });
}

function closeExperimentModal() {
    const modal = document.getElementById('experimentModal');
    if (modal) {
        modal.classList.remove('active');
    }
    stopAnimationLoop();
}

function openExperiment(expId) {
    const exp = allExperiments.find(e => e.id === parseInt(expId));
    if (!exp) return;

    currentExperiment = exp;
    currentControls = {};

    // Populate Modal Metadata
    document.getElementById('experimentIcon').textContent = exp.icon || '⚡';
    document.getElementById('experimentTitle').textContent = exp.title;
    document.getElementById('experimentCategory').textContent = exp.category;
    document.getElementById('experimentDifficulty').textContent = exp.difficulty;
    document.getElementById('experimentDescription').textContent = exp.description;
    document.getElementById('experimentExplanation').textContent = exp.explanation;
    document.getElementById('experimentFormula').innerHTML = `<code>\\[ ${exp.formula} \\]</code>`;

    // Populate Related Movies
    const moviesContainer = document.getElementById('relatedMoviesTags');
    if (moviesContainer) {
        if (exp.relatedMovies && exp.relatedMovies.length > 0) {
            moviesContainer.innerHTML = exp.relatedMovies.map(movie => `
                <a href="movies.html?search=${encodeURIComponent(movie)}" class="movie-pill">
                    <span>🎬 ${movie}</span>
                </a>
            `).join('');
        } else {
            moviesContainer.innerHTML = '<span style="color: var(--text-tertiary);">No specific cinema links</span>';
        }
    }

    // Initialize Default Controls
    exp.controls.forEach(ctrl => {
        currentControls[ctrl.name] = ctrl.value;
    });

    // Render Presets Bar
    renderPresetsBar(exp);

    // Render Control Sliders
    renderControlsPanel(exp);

    // Initial Physics Calculation
    updatePhysicalResults(exp);

    // Open Modal
    const modal = document.getElementById('experimentModal');
    if (modal) {
        modal.classList.add('active');
    if (window.renderMath) window.renderMath(document.body);
    }

    // Start 60fps Canvas Animation
    startAnimationLoop(exp);
}

function renderPresetsBar(exp) {
    const presetsContainer = document.getElementById('presetsContainer');
    if (!presetsContainer) return;

    if (!exp.presets || exp.presets.length === 0) {
        presetsContainer.parentElement.style.display = 'none';
        return;
    }

    presetsContainer.parentElement.style.display = 'block';
    presetsContainer.innerHTML = exp.presets.map((p, idx) => `
        <button class="preset-btn ${idx === 0 ? 'active' : ''}" onclick="applyPreset(${exp.id}, ${idx})">
            ${p.name}
        </button>
    `).join('');
}

function applyPreset(expId, presetIdx) {
    const exp = allExperiments.find(e => e.id === expId);
    if (!exp || !exp.presets || !exp.presets[presetIdx]) return;

    const preset = exp.presets[presetIdx];
    
    // Highlight button
    document.querySelectorAll('.presets-container .preset-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === presetIdx);
    });

    // Apply values to controls
    exp.controls.forEach(ctrl => {
        if (preset[ctrl.name] !== undefined) {
            currentControls[ctrl.name] = preset[ctrl.name];
            
            const inputEl = document.getElementById(`ctrl-slider-${ctrl.name}`);
            if (inputEl) {
                inputEl.value = preset[ctrl.name];
            }
            const valueTextEl = document.getElementById(`ctrl-val-${ctrl.name}`);
            if (valueTextEl) {
                valueTextEl.textContent = formatControlValue(preset[ctrl.name], ctrl.unit);
            }
        }
    });

    updatePhysicalResults(exp);
}

function renderControlsPanel(exp) {
    const controlsContainer = document.getElementById('controlsContainer');
    if (!controlsContainer) return;

    controlsContainer.innerHTML = exp.controls.map(ctrl => `
        <div class="control-group">
            <div class="control-header">
                <label for="ctrl-slider-${ctrl.name}" class="control-label">${ctrl.label}</label>
                <span class="control-value-badge" id="ctrl-val-${ctrl.name}">
                    ${formatControlValue(ctrl.value, ctrl.unit)}
                </span>
            </div>
            <input type="range" 
                   id="ctrl-slider-${ctrl.name}" 
                   class="control-slider"
                   min="${ctrl.min}" 
                   max="${ctrl.max}" 
                   step="${ctrl.step}" 
                   value="${ctrl.value}"
                   oninput="onControlInput('${ctrl.name}', this.value, '${ctrl.unit}')">
            <div class="control-range-bounds">
                <span>${formatControlValue(ctrl.min, ctrl.unit)}</span>
                <span>${formatControlValue(ctrl.max, ctrl.unit)}</span>
            </div>
        </div>
    `).join('');
}

function onControlInput(controlName, value, unit) {
    const numVal = parseFloat(value);
    currentControls[controlName] = numVal;

    // Deselect preset buttons as user customized
    document.querySelectorAll('.presets-container .preset-btn').forEach(b => b.classList.remove('active'));

    const valueEl = document.getElementById(`ctrl-val-${controlName}`);
    if (valueEl) {
        valueEl.textContent = formatControlValue(numVal, unit);
    }

    if (currentExperiment) {
        updatePhysicalResults(currentExperiment);
    }
}

function formatControlValue(val, unit) {
    if (val >= 1e20) {
        return `${val.toExponential(3)} ${unit}`;
    }
    if (val >= 1000000) {
        return `${(val / 1e6).toFixed(2)}M ${unit}`;
    }
    if (val >= 1000) {
        return `${new Intl.NumberFormat().format(val)} ${unit}`;
    }
    return `${val} ${unit}`;
}

/* ============================================================
   PHYSICS COMPUTATION & RESULTS RENDERING
   ============================================================ */

function updatePhysicalResults(exp) {
    const resultsContainer = document.getElementById('resultsContainer');
    const readout = document.getElementById('canvasStatusReadout');
    if (!resultsContainer) return;

    const computed = computePhysics(exp.id, currentControls);

    resultsContainer.innerHTML = computed.results.map(r => `
        <div class="result-card">
            <div class="result-label">${r.label}</div>
            <div class="result-value-row">
                <span class="result-main-value">${r.value}</span>
                <span class="result-unit">${r.unit}</span>
            </div>
            <div class="result-formula-tag">Eq: \\[ ${r.formula} \\]</div>
        </div>
    `).join('');

    if (readout && computed.statusSummary) {
        readout.textContent = computed.statusSummary;
    }
}

function computePhysics(expId, controls) {
    let results = [];
    let statusSummary = '';

    switch (expId) {
        case 1: { // Gravitational Time Dilation
            const M = controls.mass || M_earth;
            const r = controls.distance || 6371000;
            const rs = (2 * G * M) / (c * c);

            let gamma_g = 1.0;
            if (r > rs) {
                gamma_g = Math.sqrt(1 - rs / r);
            } else {
                gamma_g = 0.0;
            }

            const dailyDiffMicroseconds = (1 - gamma_g) * 86400 * 1e6;
            const redshiftZ = gamma_g > 0 ? (1 / gamma_g - 1) : Infinity;

            results = [
                {
                    label: 'Time Dilation Factor (γ_g)',
                    value: gamma_g.toFixed(10),
                    unit: 'ratio',
                    formula: '√(1 - 2GM/rc²)'
                },
                {
                    label: 'Daily Clock Drift vs Deep Space',
                    value: dailyDiffMicroseconds.toFixed(2),
                    unit: 'μs / day slower',
                    formula: '(1 - γ_g) × 86,400s'
                },
                {
                    label: 'Gravitational Redshift (z)',
                    value: redshiftZ < 1000 ? redshiftZ.toExponential(4) : 'Infinite (Event Horizon)',
                    unit: 'spectral shift',
                    formula: '(1/γ_g) - 1'
                }
            ];

            statusSummary = `Time flows at ${(gamma_g * 100).toFixed(6)}% deep space rate`;
            break;
        }

        case 2: { // Escape Velocity
            const M = controls.mass || M_earth;
            const R = controls.radius || 6371000;
            const v_e = Math.sqrt((2 * G * M) / R);
            const surfaceG = (G * M) / (R * R);

            results = [
                {
                    label: 'Escape Velocity (v_e)',
                    value: Math.round(v_e).toLocaleString(),
                    unit: 'm / s',
                    formula: '√(2GM/R)'
                },
                {
                    label: 'Escape Velocity in km/s',
                    value: (v_e / 1000).toFixed(2),
                    unit: 'km / s',
                    formula: 'v_e / 1,000'
                },
                {
                    label: 'Surface Gravity Acceleration',
                    value: surfaceG.toFixed(2),
                    unit: `m/s² (${(surfaceG / 9.81).toFixed(2)} g)`,
                    formula: 'GM / R²'
                }
            ];

            statusSummary = `Escape Speed: ${(v_e / 1000).toFixed(1)} km/s (${(v_e * 3.6).toFixed(0)} km/h)`;
            break;
        }

        case 3: { // Orbital Mechanics
            const M = controls.mass || M_earth;
            const r = controls.distance || 6771000;
            const v_orb = Math.sqrt((G * M) / r);
            const periodSeconds = 2 * Math.PI * Math.sqrt((r * r * r) / (G * M));
            const centripetalAcc = (v_orb * v_orb) / r;

            results = [
                {
                    label: 'Orbital Velocity',
                    value: (v_orb / 1000).toFixed(3),
                    unit: 'km / s',
                    formula: '√(GM/r)'
                },
                {
                    label: 'Orbital Period (T)',
                    value: periodSeconds >= 86400 ? (periodSeconds / 86400).toFixed(2) : (periodSeconds / 60).toFixed(1),
                    unit: periodSeconds >= 86400 ? 'Days' : 'Minutes',
                    formula: '2π√(r³/GM)'
                },
                {
                    label: 'Centripetal Acceleration',
                    value: centripetalAcc.toFixed(3),
                    unit: 'm / s²',
                    formula: 'v² / r'
                }
            ];

            statusSummary = `Period: ${(periodSeconds / 60).toFixed(1)} min | Orbital Speed: ${(v_orb / 1000).toFixed(2)} km/s`;
            break;
        }

        case 4: { // Projectile Trajectory
            const v0 = controls.velocity || 60;
            const angleDeg = controls.angle || 45;
            const gVal = controls.gravity || 9.81;
            const rad = (angleDeg * Math.PI) / 180;

            const maxHeight = (v0 * v0 * Math.sin(rad) * Math.sin(rad)) / (2 * gVal);
            const totalRange = (v0 * v0 * Math.sin(2 * rad)) / gVal;
            const flightTime = (2 * v0 * Math.sin(rad)) / gVal;

            results = [
                {
                    label: 'Maximum Apex Altitude (H)',
                    value: maxHeight.toFixed(2),
                    unit: 'meters',
                    formula: '(v₀² sin²θ) / 2g'
                },
                {
                    label: 'Total Ground Range (R)',
                    value: totalRange.toFixed(2),
                    unit: 'meters',
                    formula: '(v₀² sin 2θ) / g'
                },
                {
                    label: 'Total Flight Time',
                    value: flightTime.toFixed(2),
                    unit: 'seconds',
                    formula: '(2v₀ sinθ) / g'
                }
            ];

            statusSummary = `Apex: ${maxHeight.toFixed(1)}m | Range: ${totalRange.toFixed(1)}m | Time: ${flightTime.toFixed(1)}s`;
            break;
        }

        case 5: { // Black Hole Event Horizon
            const solarMasses = controls.mass || 10;
            const M = solarMasses * M_sun;
            const r_s_km = ((2 * G * M) / (c * c)) / 1000;
            const photonSphereKm = 1.5 * r_s_km;
            const iscoKm = 3.0 * r_s_km;
            const surfaceAreaKm2 = 4 * Math.PI * r_s_km * r_s_km;

            results = [
                {
                    label: 'Schwarzschild Radius (r_s)',
                    value: r_s_km >= 1e6 ? (r_s_km / 1e6).toFixed(2) + 'M' : r_s_km.toFixed(2),
                    unit: 'km (Event Horizon)',
                    formula: '2GM / c²'
                },
                {
                    label: 'Photon Sphere Radius',
                    value: photonSphereKm >= 1e6 ? (photonSphereKm / 1e6).toFixed(2) + 'M' : photonSphereKm.toFixed(2),
                    unit: 'km (Light Orbit)',
                    formula: '1.5 × r_s'
                },
                {
                    label: 'Innermost Stable Circular Orbit (ISCO)',
                    value: iscoKm >= 1e6 ? (iscoKm / 1e6).toFixed(2) + 'M' : iscoKm.toFixed(2),
                    unit: 'km (Accretion Inner Edge)',
                    formula: '3.0 × r_s'
                },
                {
                    label: 'Event Horizon Area',
                    value: surfaceAreaKm2.toExponential(3),
                    unit: 'km²',
                    formula: '4π r_s²'
                }
            ];

            statusSummary = `Mass: ${solarMasses.toLocaleString()} M☉ | Radius: ${r_s_km.toFixed(1)} km`;
            break;
        }
    }

    return { results, statusSummary };
}

/* ============================================================
   60 FPS CANVAS SIMULATION RENDERING ENGINE
   ============================================================ */

function startAnimationLoop(exp) {
    stopAnimationLoop();
    simTime = 0;

    const canvas = document.getElementById('experimentCanvas');
    if (!canvas) return;

    function loop() {
        simTime += 0.016; // ~60fps step
        renderCanvasSimulation(exp, canvas);
        animFrameId = requestAnimationFrame(loop);
    }

    animFrameId = requestAnimationFrame(loop);
}

function stopAnimationLoop() {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}

function renderCanvasSimulation(exp, canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark cyber space background grid
    drawSpaceBackground(ctx, width, height);

    switch (exp.id) {
        case 1:
            drawGravitationalTimeDilation(ctx, width, height, currentControls, simTime);
            break;
        case 2:
            drawEscapeVelocity(ctx, width, height, currentControls, simTime);
            break;
        case 3:
            drawOrbitalMechanics(ctx, width, height, currentControls, simTime);
            break;
        case 4:
            drawProjectileKinematics(ctx, width, height, currentControls, simTime);
            break;
        case 5:
            drawBlackHoleSim(ctx, width, height, currentControls, simTime);
            break;
    }
}

function drawSpaceBackground(ctx, width, height) {
    // Subtle background glow
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
    bgGrad.addColorStop(0, 'rgba(10, 25, 50, 0.4)');
    bgGrad.addColorStop(1, 'rgba(5, 10, 25, 0.95)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

/* --- Simulation 1: Gravitational Time Dilation --- */
function drawGravitationalTimeDilation(ctx, width, height, controls, t) {
    const centerX = width / 2 - 60;
    const centerY = height / 2;

    // 1. Spacetime Curvature Grid lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1.5;
    for (let r = 40; r <= 180; r += 25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 2. Gravitational Well Pulse
    const pulse = (Math.sin(t * 3) + 1) * 0.5;
    const glow = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, 80 + pulse * 20);
    glow.addColorStop(0, 'rgba(0, 102, 255, 0.6)');
    glow.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
    ctx.fill();

    // Central Massive Body
    const bodyGrad = ctx.createRadialGradient(centerX - 10, centerY - 10, 5, centerX, centerY, 35);
    bodyGrad.addColorStop(0, '#60a5fa');
    bodyGrad.addColorStop(0.7, '#1d4ed8');
    bodyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Massive Body', centerX, centerY + 4);

    // 3. Clocks Comparison:
    // Clock A: Deep Space Clock (Fast)
    drawClockWidget(ctx, width - 110, 90, 'Deep Space (Flat Spacetime)', t * 2.0, '#38bdf8');

    // Calculate time dilation factor
    const M = controls.mass || M_earth;
    const r = controls.distance || 6371000;
    const rs = (2 * G * M) / (c * c);
    const gamma = r > rs ? Math.sqrt(1 - rs / r) : 0.001;

    // Clock B: Gravitational Well Clock (Slowed down by gamma)
    drawClockWidget(ctx, width - 110, 260, 'Gravity Well Clock', t * (2.0 * gamma), '#f59e0b');

    // Photon Redshift Waves
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    const waveR = ((t * 60) % 140) + 40;
    ctx.beginPath();
    ctx.arc(centerX, centerY, waveR, -0.8, 0.8);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px sans-serif';
    ctx.fillText('Gravitational Redshift Wave ➔', centerX + 90, centerY - 10);
}

function drawClockWidget(ctx, x, y, label, angleTime, color) {
    const radius = 32;

    // Clock Face
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hour/Tick markers
    for (let i = 0; i < 12; i++) {
        const rad = (i * Math.PI) / 6;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(rad) * (radius - 5), y + Math.sin(rad) * (radius - 5));
        ctx.lineTo(x + Math.cos(rad) * radius, y + Math.sin(rad) * radius);
        ctx.stroke();
    }

    // Sweeping Hand
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angleTime) * (radius - 8), y - Math.cos(angleTime) * (radius - 8));
    ctx.stroke();

    // Center pin
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + radius + 16);
}

/* --- Simulation 2: Escape Velocity --- */
function drawEscapeVelocity(ctx, width, height, controls, t) {
    const cx = 130;
    const cy = height / 2;
    const planetR = 50;

    // Atmosphere halo
    const atmo = ctx.createRadialGradient(cx, cy, planetR, cx, cy, planetR + 25);
    atmo.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
    atmo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = atmo;
    ctx.beginPath();
    ctx.arc(cx, cy, planetR + 25, 0, Math.PI * 2);
    ctx.fill();

    // Planet
    const planetGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, planetR);
    planetGrad.addColorStop(0, '#38bdf8');
    planetGrad.addColorStop(0.6, '#0284c7');
    planetGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Celestial Body', cx, cy + 4);

    // Escape boundary limit curve
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, 180, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.font = '10px sans-serif';
    ctx.fillText('Gravity Escape Boundary', cx + 160, cy - 120);

    // Animated Rocket Trajectory
    const M = controls.mass || M_earth;
    const R = controls.radius || 6371000;
    const v_e = Math.sqrt((2 * G * M) / R);

    // Trajectory path
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + planetR, cy);
    ctx.bezierCurveTo(cx + 150, cy - 40, cx + 250, cy - 110, width - 40, cy - 140);
    ctx.stroke();

    // Moving Rocket
    const rocketProgress = (t * 0.35) % 1.0;
    const rx = cx + planetR + rocketProgress * (width - 40 - (cx + planetR));
    const ry = cy - Math.sin(rocketProgress * 1.3) * 140;

    // Thruster Particle Trail
    ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.beginPath();
    ctx.arc(rx - 8, ry + 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Rocket Icon
    ctx.font = '18px sans-serif';
    ctx.fillText('🚀', rx, ry);

    // Status readout overlay
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`✓ Hyperbolic Escape Vector: ${(v_e / 1000).toFixed(1)} km/s`, 220, height - 35);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Kinetic Energy > Gravitational Potential Well', 220, height - 18);
}

/* --- Simulation 3: Orbital Mechanics --- */
function drawOrbitalMechanics(ctx, width, height, controls, t) {
    const cx = width / 2;
    const cy = height / 2;
    const orbitRadius = 120;

    // Gravitational Field Rings
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 40; r <= 160; r += 30) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Central Star/Planet
    const starGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 35);
    starGrad.addColorStop(0, '#fde047');
    starGrad.addColorStop(0.5, '#f59e0b');
    starGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = starGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Central Mass', cx, cy + 3);

    // Orbit Ellipse/Circle Trail
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting Satellite Position
    const orbitSpeed = t * 1.5;
    const satX = cx + Math.cos(orbitSpeed) * orbitRadius;
    const satY = cy + Math.sin(orbitSpeed) * orbitRadius;

    // Satellite Icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(satX, satY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '16px sans-serif';
    ctx.fillText('🛰️', satX + 12, satY - 10);

    // Velocity Vector (Tangent)
    const vx = -Math.sin(orbitSpeed) * 35;
    const vy = Math.cos(orbitSpeed) * 35;
    drawVectorArrow(ctx, satX, satY, satX + vx, satY + vy, '#22c55e', 'v (Velocity)');

    // Gravitational Force Vector (Centripetal toward center)
    const fx = (cx - satX) * 0.25;
    const fy = (cy - satY) * 0.25;
    drawVectorArrow(ctx, satX, satY, satX + fx, satY + fy, '#ec4899', 'F_g (Gravity)');
}

function drawVectorArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.fill();

    if (label) {
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(label, toX + 5, toY - 5);
    }
}

/* --- Simulation 4: Projectile Kinematics --- */
function drawProjectileKinematics(ctx, width, height, controls, t) {
    const originX = 60;
    const groundY = height - 50;

    // Ground Plane
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, groundY);
    ctx.lineTo(width - 30, groundY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ground Datum (y = 0)', 30, groundY + 20);

    const v0 = controls.velocity || 60;
    const angleDeg = controls.angle || 45;
    const gVal = controls.gravity || 9.81;
    const rad = (angleDeg * Math.PI) / 180;

    const maxHeight = (v0 * v0 * Math.sin(rad) * Math.sin(rad)) / (2 * gVal);
    const totalRange = (v0 * v0 * Math.sin(2 * rad)) / gVal;
    const flightTime = (2 * v0 * Math.sin(rad)) / gVal;

    // Scale calculation to fit canvas
    const maxCanvasW = width - 140;
    const maxCanvasH = groundY - 60;
    const scaleX = maxCanvasW / Math.max(totalRange, 10);
    const scaleY = maxCanvasH / Math.max(maxHeight * 1.2, 10);

    // Parabolic trajectory line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
        const timeFrac = (i / steps) * flightTime;
        const x = v0 * Math.cos(rad) * timeFrac;
        const y = v0 * Math.sin(rad) * timeFrac - 0.5 * gVal * timeFrac * timeFrac;

        const px = originX + x * scaleX;
        const py = groundY - y * scaleY;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Apex Marker
    const apexX = originX + (totalRange / 2) * scaleX;
    const apexY = groundY - maxHeight * scaleY;

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(apexX, apexY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Apex: ${maxHeight.toFixed(1)}m`, apexX, apexY - 10);

    // Range Marker
    const impactX = originX + totalRange * scaleX;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(impactX, groundY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`Impact Range: ${totalRange.toFixed(1)}m`, impactX, groundY - 10);

    // Moving Projectile along curve
    const cycleTime = (t * 0.8) % flightTime;
    const curX = v0 * Math.cos(rad) * cycleTime;
    const curY = v0 * Math.sin(rad) * cycleTime - 0.5 * gVal * cycleTime * cycleTime;
    const projPx = originX + curX * scaleX;
    const projPy = groundY - curY * scaleY;

    // Glowing projectile ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(projPx, projPy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Launcher Barrel
    const barrelLen = 25;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(originX, groundY);
    ctx.lineTo(originX + Math.cos(rad) * barrelLen, groundY - Math.sin(rad) * barrelLen);
    ctx.stroke();
}

/* --- Simulation 5: Black Hole Event Horizon --- */
function drawBlackHoleSim(ctx, width, height, controls, t) {
    const cx = width / 2;
    const cy = height / 2;
    const rsPixel = 45;

    // 1. Gravitational Lensing Rings (Background warp)
    for (let i = 1; i <= 3; i++) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 / i})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, rsPixel * (1.8 + i * 0.7) + Math.sin(t * 2 + i) * 3, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 2. Glowing Relativistic Accretion Disk (with Doppler Beaming)
    // Left side is bluer and brighter (approaching), right side is redder and dimmer (receding)
    const diskW = 160;
    const diskH = 35;
    const diskAngle = -0.2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(diskAngle);

    // Back half of disk (behind black hole)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, diskW, diskH, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Photon Sphere Ring (1.5 rs)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, rsPixel * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Black Hole Event Horizon (Pitch Black Sphere)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, rsPixel, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Front half of Accretion Disk (in front of black hole)
    const frontDiskGrad = ctx.createLinearGradient(-diskW, 0, diskW, 0);
    frontDiskGrad.addColorStop(0, '#38bdf8');     // Blue approaching Doppler boost
    frontDiskGrad.addColorStop(0.3, '#f59e0b');
    frontDiskGrad.addColorStop(0.7, '#ea580c');
    frontDiskGrad.addColorStop(1, '#991b1b');     // Red receding Doppler dimming

    ctx.strokeStyle = frontDiskGrad;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.ellipse(0, 0, diskW, diskH, 0, 0, Math.PI);
    ctx.stroke();

    ctx.restore();

    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Singularity & Event Horizon (r ≤ r_s)', cx, cy + rsPixel + 30);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Photon Sphere (1.5 r_s)', cx, cy - rsPixel - 15);
}

// Global exposure
window.openExperiment = openExperiment;
window.applyPreset = applyPreset;
window.onControlInput = onControlInput;
