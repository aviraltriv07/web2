/**
 * SciFiLens - Interactive Experiments
 */

let allExperiments = [];

document.addEventListener('DOMContentLoaded', async () => {
    const expData = await fetchJSON('data/experiments.json');
    
    if (expData) {
        allExperiments = expData.experiments;
        displayExperiments();
    }
    
    setupExperimentModal();
});

function displayExperiments() {
    const grid = document.getElementById('experimentsGrid');
    if (!grid) return;
    
    grid.innerHTML = allExperiments.map(exp => `
        <div class="experiment-card" onclick="openExperiment(${exp.id})">
            <div class="experiment-card-icon">${exp.icon}</div>
            <h3 class="experiment-card-title">${exp.title}</h3>
            <p class="experiment-card-description">${exp.description}</p>
            <div class="experiment-card-tag">${exp.category}</div>
        </div>
    `).join('');
}

function setupExperimentModal() {
    const modal = document.getElementById('experimentModal');
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

function openExperiment(expId) {
    const experiment = allExperiments.find(e => e.id === expId);
    if (!experiment) return;
    
    const modal = document.getElementById('experimentModal');
    
    // Set title and description
    document.getElementById('experimentTitle').textContent = experiment.title;
    document.getElementById('experimentDescription').textContent = experiment.description;
    document.getElementById('experimentExplanation').textContent = experiment.explanation;
    
    // Setup controls
    setupControls(experiment);
    
    // Setup visualization
    setupVisualization(experiment);
    
    // Show modal
    modal.classList.add('active');
}

function setupControls(experiment) {
    const controlsContainer = document.getElementById('experimentControls');
    if (!controlsContainer) return;
    
    controlsContainer.innerHTML = experiment.controls.map((control, index) => `
        <div class="control-group">
            <div style="display: flex; justify-content: space-between;">
                <label class="control-label">${control.label}</label>
                <span class="control-value">
                    <span id="value-${control.name}">${control.value}</span> ${control.unit}
                </span>
            </div>
            <input type="range" 
                   id="control-${control.name}"
                   min="${control.min}" 
                   max="${control.max}" 
                   step="${control.step}" 
                   value="${control.value}"
                   oninput="updateExperiment('${experiment.id}', '${control.name}', this.value)">
        </div>
    `).join('');
}

function setupVisualization(experiment) {
    const canvas = document.getElementById('experimentCanvas');
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = 500;
    canvas.height = 400;
    
    // Clear and draw initial state
    updateExperimentVisualization(experiment);
}

let currentExperimentId = null;

function updateExperiment(expId, controlName, value) {
    currentExperimentId = expId;
    const experiment = allExperiments.find(e => e.id === parseInt(expId));
    if (!experiment) return;
    
    // Update display value
    const valueDisplay = document.getElementById(`value-${controlName}`);
    if (valueDisplay) {
        valueDisplay.textContent = formatNumber(parseFloat(value));
    }
    
    // Update results
    updateResults(experiment);
    
    // Update visualization
    updateExperimentVisualization(experiment);
}

function updateResults(experiment) {
    const resultsContainer = document.getElementById('experimentResults');
    if (!resultsContainer) return;
    
    // Get current control values
    const controls = {};
    experiment.controls.forEach(control => {
        const el = document.getElementById(`control-${control.name}`);
        if (el) controls[control.name] = parseFloat(el.value);
    });
    
    // Calculate results based on experiment type
    const results = calculateResults(experiment, controls);
    
    // Display results
    resultsContainer.innerHTML = results.map(result => `
        <div class="result-item">
            <div class="result-label">${result.label}</div>
            <div class="result-value">${result.value}</div>
        </div>
    `).join('');
}

function calculateResults(experiment, controls) {
    const G = 6.674e-11; // Gravitational constant
    const c = 299792458; // Speed of light
    const g = 9.81; // Earth's gravity
    const M_sun = 1.989e30; // Solar mass in kg
    
    let results = [];
    
    switch (experiment.id) {
        case 1: // Time Dilation
            {
                const M = controls.mass;
                const r = controls.distance;
                const tdf = 1 - (2 * G * M) / (c * c * r);
                const timeDiff = (1 - tdf) * 86400e6; // microseconds per day
                results = [
                    { label: 'Time Dilation Factor', value: tdf.toFixed(8) },
                    { label: 'Time Diff/Day', value: timeDiff.toFixed(2) + ' μs' }
                ];
                break;
            }
        case 2: // Escape Velocity
            {
                const M = controls.mass;
                const R = controls.radius;
                const v_e = Math.sqrt((2 * G * M) / R);
                results = [
                    { label: 'Escape Velocity', value: v_e.toFixed(0) + ' m/s' },
                    { label: 'Escape Velocity', value: (v_e / 1000).toFixed(2) + ' km/s' }
                ];
                break;
            }
        case 3: // Orbital Motion
            {
                const M = controls.mass;
                const r = controls.distance;
                const v = Math.sqrt((G * M) / r);
                const period = 2 * Math.PI * Math.sqrt((r * r * r) / (G * M));
                results = [
                    { label: 'Orbital Velocity', value: v.toFixed(0) + ' m/s' },
                    { label: 'Orbital Period', value: (period / 3600).toFixed(2) + ' hours' }
                ];
                break;
            }
        case 4: // Projectile Motion
            {
                const v0 = controls.velocity;
                const angle = (controls.angle * Math.PI) / 180;
                const maxHeight = (v0 * v0 * Math.sin(angle) * Math.sin(angle)) / (2 * g);
                const range = (v0 * v0 * Math.sin(2 * angle)) / g;
                const time = (2 * v0 * Math.sin(angle)) / g;
                results = [
                    { label: 'Max Height', value: maxHeight.toFixed(1) + ' m' },
                    { label: 'Range', value: range.toFixed(1) + ' m' },
                    { label: 'Flight Time', value: time.toFixed(2) + ' s' }
                ];
                break;
            }
        case 5: // Black Hole Event Horizon
            {
                const M = controls.mass * M_sun;
                const r_s = (2 * G * M) / (c * c);
                const area = 4 * Math.PI * r_s * r_s;
                results = [
                    { label: 'Schwarzschild Radius', value: (r_s / 1000).toFixed(2) + ' km' },
                    { label: 'Surface Area', value: (area / 1e12).toFixed(2) + ' km²' }
                ];
                break;
            }
    }
    
    return results;
}

function updateExperimentVisualization(experiment) {
    const canvas = document.getElementById('experimentCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current control values
    const controls = {};
    experiment.controls.forEach(control => {
        const el = document.getElementById(`control-${control.name}`);
        if (el) controls[control.name] = parseFloat(el.value);
    });
    
    // Draw visualization based on experiment type
    switch (experiment.id) {
        case 1: // Time Dilation
            drawTimeDilationVisualization(ctx, canvas, controls);
            break;
        case 2: // Escape Velocity
            drawEscapeVelocityVisualization(ctx, canvas, controls);
            break;
        case 3: // Orbital Motion
            drawOrbitalMotionVisualization(ctx, canvas, controls);
            break;
        case 4: // Projectile Motion
            drawProjectileVisualization(ctx, canvas, controls);
            break;
        case 5: // Black Hole
            drawBlackHoleVisualization(ctx, canvas, controls);
            break;
    }
}

function drawTimeDilationVisualization(ctx, canvas, controls) {
    const G = 6.674e-11;
    const c = 299792458;
    const M = controls.mass;
    const r = controls.distance;
    
    // Draw gravitational field
    ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(250, 200, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw massive object
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(250, 200, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw time dilation effect
    const tdf = 1 - (2 * G * M) / (c * c * r);
    const clockRadius = 40;
    ctx.strokeStyle = 'var(--accent-cyan)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(420, 200, clockRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw slow clock hand
    ctx.strokeStyle = 'var(--accent-cyan)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(420, 200);
    const angle = (1 - tdf) * Math.PI;
    ctx.lineTo(420 + Math.sin(angle) * 30, 200 - Math.cos(angle) * 30);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Massive Object', 250, 250);
    ctx.fillText('Time Passes Slower', 420, 260);
}

function drawEscapeVelocityVisualization(ctx, canvas, controls) {
    const G = 6.674e-11;
    const M = controls.mass;
    const R = controls.radius;
    const v_e = Math.sqrt((2 * G * M) / R);
    
    // Draw planet
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(250, 200, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw escape velocity path
    const scale = Math.min(200 / v_e, 0.001);
    const velocitySize = Math.min(v_e * scale, 100);
    
    ctx.strokeStyle = 'var(--accent-cyan)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(250, 150);
    ctx.quadraticCurveTo(250 + velocitySize, 50, 250 + velocitySize * 1.5, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw velocity vector
    ctx.fillStyle = 'var(--accent-cyan)';
    ctx.fillText(`v_e = ${(v_e / 1000).toFixed(1)} km/s`, 250, 100);
}

function drawOrbitalMotionVisualization(ctx, canvas, controls) {
    // Draw central body
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(250, 200, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw orbit
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 200, 100, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw orbiting object
    const time = Date.now() / 10000;
    const angle = time * Math.PI * 2;
    const x = 250 + Math.cos(angle) * 100;
    const y = 200 + Math.sin(angle) * 100;
    
    ctx.fillStyle = 'var(--accent-cyan)';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw velocity vector
    ctx.strokeStyle = 'var(--accent-purple)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.sin(angle) * 30, y + Math.cos(angle) * 30);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Satellite', x, y + 25);
}

function drawProjectileVisualization(ctx, canvas, controls) {
    const v0 = controls.velocity;
    const angle = (controls.angle * Math.PI) / 180;
    const g = 9.81;
    
    // Draw trajectory
    ctx.strokeStyle = 'var(--accent-cyan)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxHeight = (v0 * v0 * Math.sin(angle) * Math.sin(angle)) / (2 * g);
    const range = (v0 * v0 * Math.sin(2 * angle)) / g;
    
    const scaleX = 300 / range;
    const scaleY = 300 / maxHeight;
    
    for (let t = 0; t <= 1; t += 0.02) {
        const time = t * (2 * v0 * Math.sin(angle)) / g;
        const x = v0 * Math.cos(angle) * time;
        const y = v0 * Math.sin(angle) * time - 0.5 * g * time * time;
        
        const px = 50 + x * scaleX;
        const py = 380 - y * scaleY;
        
        if (t === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.stroke();
    
    // Draw launch point
    ctx.fillStyle = 'var(--accent-cyan)';
    ctx.beginPath();
    ctx.arc(50, 380, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw ground
    ctx.strokeStyle = 'var(--text-secondary)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 380);
    ctx.lineTo(450, 380);
    ctx.stroke();
}

function drawBlackHoleVisualization(ctx, canvas, controls) {
    const G = 6.674e-11;
    const c = 299792458;
    const M_sun = 1.989e30;
    const M = controls.mass * M_sun;
    const r_s = (2 * G * M) / (c * c);
    
    // Draw event horizon
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(250, 200, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw accretion disk
    ctx.strokeStyle = 'var(--accent-cyan)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(250, 200, 80, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw gravitational lensing
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(250, 200, 60 + i * 20, angle - 0.3, angle + 0.3);
        ctx.stroke();
    }
    
    // Label
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Black Hole', 250, 280);
    ctx.fillText(`Radius: ${(r_s / 1000).toFixed(0)} km`, 250, 300);
}
