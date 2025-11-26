// Simple audio helper
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq = 800, duration = 300, vol = 0.08) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain).connect(audioCtx.destination);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
    osc.stop(audioCtx.currentTime + duration / 1000);
}

function playLaunchTone() { playTone(480, 1200, 0.12); }
function playToggleTone() { playTone(920, 200, 0.1); }

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 3200);
}

// Helpers
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Main panel gating
const dashboard = document.getElementById('dashboard');
const mainMenu = document.getElementById('main-menu');
let liveStatInterval;

function setMenuAccess(active) {
    if (!dashboard) return;
    if (active) {
        dashboard.classList.remove('hidden-content');
        if (mainMenu) mainMenu.classList.remove('hidden-content');
        updateStatsInitial();
        startLiveStats();
    } else {
        dashboard.classList.add('hidden-content');
        if (mainMenu) mainMenu.classList.add('hidden-content');
        stopLiveStats();
    }
}

function lockMenu() {
    setMenuAccess(false);
}

// Feature toggles
function toggleFeature(name, enabled, featureElement) {
    const status = enabled ? 'ON' : 'OFF';
    const emoji = enabled ? '✔' : '✖';
    const type = enabled ? 'success' : 'error';
    playToggleTone();

    let feature = featureElement;
    if (!feature) {
        const nameNode = Array.from(document.querySelectorAll('.feature-name')).find(el => el.textContent.includes(name));
        if (nameNode) feature = nameNode.closest('.feature');
    }

    if (feature) {
        const featureNameEl = feature.querySelector('.feature-name');
        if (enabled) {
            feature.style.borderColor = 'rgba(59, 201, 255, 0.6)';
            feature.style.boxShadow = '0 12px 30px rgba(59, 201, 255, 0.15)';
            if (featureNameEl) featureNameEl.style.color = 'var(--primary)';
        } else {
            feature.style.borderColor = 'rgba(148, 169, 214, 0.25)';
            feature.style.boxShadow = 'none';
            if (featureNameEl) featureNameEl.style.color = '';
        }
    }

    showNotification(`${emoji} ${name} ${status}`, type);
}

function initFeatureToggles() {
    document.querySelectorAll('.toggle-switch input').forEach(inputEl => {
        inputEl.addEventListener('change', function () {
            const featureElement = this.closest('.feature');
            let featureName = 'Tuy chon';
            if (featureElement) {
                const featureNameEl = featureElement.querySelector('.feature-name');
                if (featureNameEl) featureName = featureNameEl.textContent;
            }
            featureName = featureName.replace('VIP', '').trim();
            toggleFeature(featureName, this.checked, featureElement);
        });
    });
}

// Performance circles
const TOTAL_LENGTH = 251.2;
let cpuInterval;

function setCircleValue(idPrefix, percent, color, overrideText) {
    const progress = document.getElementById(`${idPrefix}-progress`);
    const textElement = document.getElementById(`${idPrefix}-percent`);
    if (!progress || !textElement) return;
    const offset = TOTAL_LENGTH - (TOTAL_LENGTH * percent) / 100;
    textElement.textContent = overrideText || `${percent}%`;
    progress.style.stroke = color;
    requestAnimationFrame(() => { progress.style.strokeDashoffset = offset; });
}

function updateCpuText() {
    const cpuText = document.getElementById('cpu-percent');
    if (!cpuText) return;
    const newPercent = getRandomInt(20, 35);
    cpuText.textContent = `${newPercent}%`;
    const nextInterval = getRandomInt(400, 700);
    cpuInterval = setTimeout(updateCpuText, nextInterval);
}

// FPS chart
const fpsLine = document.getElementById('fpsLine');
const fpsChartSVG = document.getElementById('fpsChartSVG');
const currentFpsElement = document.getElementById('currentFps');
const CHART_WIDTH_DEFAULT = 360;
const CHART_HEIGHT_DEFAULT = 200;
const FPS_MIN = 30;
const FPS_MAX = 144;
const FPS_RANGE = FPS_MAX - FPS_MIN;
const MAX_POINTS = 60;
let fpsHistory = [];
let fpsInterval;

function getChartDimensions() {
    if (!fpsChartSVG) return { width: CHART_WIDTH_DEFAULT, height: CHART_HEIGHT_DEFAULT };
    const rect = fpsChartSVG.getBoundingClientRect();
    return { width: rect.width || CHART_WIDTH_DEFAULT, height: rect.height || CHART_HEIGHT_DEFAULT };
}

function getRandomFps() {
    let baseFps = 65 + (Math.random() - 0.5) * 12;
    if (Math.random() < 0.08) baseFps = 110 + Math.random() * 34;
    if (Math.random() < 0.05) baseFps = 40 + Math.random() * 15;
    return Math.max(FPS_MIN, Math.min(FPS_MAX, Math.round(baseFps)));
}

function updateChart() {
    if (!fpsLine || !currentFpsElement) return;
    const { width, height } = getChartDimensions();
    const newFps = getRandomFps();
    fpsHistory.push(newFps);
    if (fpsHistory.length > MAX_POINTS) fpsHistory.shift();
    const stepX = width / (MAX_POINTS - 1);
    const points = fpsHistory.map((value, index) => {
        const normalized = (value - FPS_MIN) / FPS_RANGE;
        const y = height * (1 - normalized);
        const x = index * stepX;
        return `${x},${y}`;
    }).join(' ');
    fpsLine.setAttribute('points', points);
    currentFpsElement.textContent = `${newFps} FPS`;
    currentFpsElement.style.color = newFps > 80 ? 'var(--primary)' : 'var(--muted)';
}

function initFpsChart() {
    fpsHistory = Array.from({ length: MAX_POINTS }, () => getRandomFps());
    updateChart();
    if (fpsInterval) clearInterval(fpsInterval);
    fpsInterval = setInterval(updateChart, 150);
}

// Game launchers
function openFreeFire() {
    showNotification('Launching Free Fire...', 'success');
    playLaunchTone();
    setTimeout(() => { window.location.href = 'freefireth://'; }, 500);
}

function openFreeFireMax() {
    showNotification('Launching Free Fire MAX...', 'success');
    playLaunchTone();
    setTimeout(() => { window.location.href = 'freefiremax://'; }, 500);
}

// Support modal
function openSupportModal() { const modal = document.getElementById('supportModal'); if (modal) modal.classList.add('show'); }
function closeSupportModal() { const modal = document.getElementById('supportModal'); if (modal) modal.classList.remove('show'); }
document.addEventListener('click', (e) => { const modal = document.getElementById('supportModal'); if (modal && e.target === modal) closeSupportModal(); });

// Dashboard init
function updateStatsInitial() {
    if (!mainMenu) return;
    const ramPercent = getRandomInt(28, 55);
    const networkPercent = getRandomInt(10, 48);
    setCircleValue('ram', ramPercent, '#fbbf24');
    setCircleValue('network', networkPercent, '#34d399');
    const cpuProgress = document.getElementById('cpu-progress');
    if (cpuProgress) {
        cpuProgress.style.strokeDashoffset = TOTAL_LENGTH - (TOTAL_LENGTH * 25) / 100;
        if (cpuInterval) clearTimeout(cpuInterval);
        updateCpuText();
    }
    initFpsChart();
}

function estimateCpuPercent() {
    const cores = navigator.hardwareConcurrency || 4;
    const baseline = 50 - cores * 3;
    const jitter = Math.random() * 15;
    const percent = Math.max(5, Math.min(90, baseline + jitter + 20));
    return Math.round(percent);
}

function getMemoryPercent() {
    if (performance?.memory) {
        const used = performance.memory.usedJSHeapSize || 0;
        const total = performance.memory.jsHeapSizeLimit || 1;
        return Math.min(95, Math.max(5, Math.round((used / total) * 100)));
    }
    const simulatedUse = 0.4 + Math.random() * 0.2;
    return Math.min(95, Math.round(simulatedUse * 100));
}

function getNetworkPercent() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return getRandomInt(20, 60);
    const rtt = conn.rtt || 100;
    const down = conn.downlink || 10;
    const rttScore = Math.max(0, Math.min(100, 100 - ((rtt - 20) / 280) * 100));
    const downScore = Math.max(0, Math.min(100, (down / 100) * 100));
    return Math.round((rttScore * 0.6 + downScore * 0.4));
}

function updateLiveStats() {
    const cpu = estimateCpuPercent();
    const ram = getMemoryPercent();
    const net = getNetworkPercent();

    setCircleValue('cpu', cpu, 'var(--primary-strong)');
    setCircleValue('ram', ram, '#f59e0b');
    setCircleValue('network', net, '#10b981');
}

function startLiveStats() { stopLiveStats(); updateLiveStats(); liveStatInterval = setInterval(updateLiveStats, 4000); }
function stopLiveStats() { if (liveStatInterval) { clearInterval(liveStatInterval); liveStatInterval = null; } }

function handleLicenseChange(event) {
    const state = event.detail?.state;
    if (state === 'activated' || state === 'verified') {
        setMenuAccess(true);
        showNotification('Menu unlocked.', 'success');
        if (window.VSHKeyGate?.hide) window.VSHKeyGate.hide();
    } else {
        lockMenu();
        showNotification('Please enter access key.', 'error');
        if (window.VSHKeyGate?.show) window.VSHKeyGate.show();
    }
}

window.addEventListener('load', () => { lockMenu(); });
document.addEventListener('DOMContentLoaded', () => {
    initFeatureToggles();
    window.addEventListener('vsh-license-change', handleLicenseChange);
});

// Expose functions
if (typeof window !== 'undefined') {
    Object.assign(window, { openFreeFire, openFreeFireMax, openSupportModal, closeSupportModal });
}

