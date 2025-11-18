const MAX_ACTIVE = 3;
const featureHandlers = {
  aimlock: {
    enable: startAimAssistDemo,
    disable: stopAimAssistDemo,
  },
  nheTam: {
    enable: startFeatherAim,
    disable: stopFeatherAim,
  },
  nhay: {
    enable: startQuickSwipe,
    disable: stopQuickSwipe,
  },
  damTam: {
    enable: startSteadyHold,
    disable: stopSteadyHold,
  },
  fixRung: {
    enable: startShakeFix,
    disable: stopShakeFix,
  },
  ghimTam: {
    enable: startAnchorAim,
    disable: stopAnchorAim,
  },
  fixLacDan: {
    enable: startDriftFix,
    disable: stopDriftFix,
  },
  fixLoDau: {
    enable: startHeadFix,
    disable: stopHeadFix,
  },
};
const CODE_COLUMNS = 8;
const CODE_SNIPPETS = [
  `namespace ios {
  float aim = 0.45f;
  bool lock = true;
}`,
  `template<typename T>
T smooth(T a, T b, float k){
  return a + (b - a) * k;
}`,
  `struct DriftFix {
  float spread; float decay;
};
DriftFix fix{1.2f, 0.04f};`,
  `constexpr int MAX_LOCK = 3;
volatile bool active = false;`,
  `std::array<float,4> recoil {0.2f,0.3f,0.1f,0.5f};`,
  `auto clamp = [](float v){
  return std::max(0.f, std::min(1.f, v));
};`,
  `for(size_t i=0;i<nodes.size();++i){
  nodes[i].update();
}`,
  `std::cout << "LOCK" << std::endl;
++tick;`,
];

const ping = createPing();
const canvasState = {
  element: null,
  ctx: null,
  drawUsers: new Set(),
  pointerUsers: new Set(),
  resizeHandler: null,
};

// ---------- Aim Assist Helpers ----------
function clampValue(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function defaultValue(value, fallback) {
  return value === undefined || value === null ? fallback : value;
}
function lerpNumber(a, b, t) {
  return a + (b - a) * t;
}
function lerpPoint(p, q, t) {
  return { x: lerpNumber(p.x, q.x, t), y: lerpNumber(p.y, q.y, t) };
}
function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}
function dotVec(a, b) {
  return a.x * b.x + a.y * b.y;
}

function getNearestInFOV(origin, targets, fovPx) {
  const f2 = fovPx * fovPx;
  let best = null;
  let bestD2 = Infinity;
  for (const t of targets) {
    const d2 = dist2(origin, t);
    if (d2 <= f2 && d2 < bestD2) {
      best = t;
      bestD2 = d2;
    }
  }
  return best;
}

function leadPoint(target, shooterPos, bulletSpeed = 700) {
  const r = { x: target.x - shooterPos.x, y: target.y - shooterPos.y };
  const v = { x: target.vx || 0, y: target.vy || 0 };
  const vv = dotVec(v, v);
  const rr = dotVec(r, r);
  const s2 = bulletSpeed * bulletSpeed;
  const a = vv - s2;
  const b = 2 * dotVec(r, v);
  const c = rr;
  let t;
  if (Math.abs(a) < 1e-6) {
    t = Math.abs(b) > 1e-6 ? -c / b : 0;
  } else {
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      t = 0;
    } else {
      const sqrtD = Math.sqrt(disc);
      const t1 = (-b - sqrtD) / (2 * a);
      const t2 = (-b + sqrtD) / (2 * a);
      const candidates = [t1, t2].filter((x) => x > 0);
      t = candidates.length ? Math.min(...candidates) : 0;
    }
  }
  t = clampValue(t, 0, 1);
  return { x: target.x + v.x * t, y: target.y + v.y * t };
}

function updateReticle(reticle, mouse, targets, opts = {}) {
  const cfg = {
    enabled: true,
    mode: "soft",
    strength: 0.35,
    smoothing: 0.25,
    fov: 180,
    predict: false,
    bulletSpeed: 700,
    ...opts,
  };
  const nearest = getNearestInFOV(mouse, targets, cfg.fov);
  let aimPoint = null;
  if (nearest) {
    aimPoint = cfg.predict ? leadPoint(nearest, mouse, cfg.bulletSpeed) : { x: nearest.x, y: nearest.y };
  }
  let desired;
  if (!cfg.enabled || !aimPoint) {
    desired = mouse;
  } else if (cfg.mode === "snap") {
    desired = aimPoint;
  } else {
    const k = clampValue(cfg.strength, 0, 1);
    desired = lerpPoint(mouse, aimPoint, k);
  }
  const s = clampValue(cfg.smoothing, 0, 1);
  const newReticle = lerpPoint(reticle, desired, s);
  return { reticle: newReticle, target: nearest, aimPoint };
}

class Crosshair {
  constructor(opts = {}) {
    this.weight = opts.weight || 2;
    this.alpha = opts.alpha === undefined ? 0.85 : opts.alpha;
    this.size = opts.size || 12;
    this.gap = opts.gap === undefined ? 4 : opts.gap;
    this.dot = opts.dot === undefined ? 3 : opts.dot;
    this.color = opts.color || "#e6e6e6";
  }
  setWeight(px) {
    this.weight = Math.max(1, Number(px) || 1);
    return this;
  }
  setAlpha(a) {
    const v = Number(a);
    if (!Number.isNaN(v)) {
      this.alpha = Math.max(0, Math.min(1, v));
    }
    return this;
  }
  setColor(css) {
    this.color = String(css || this.color);
    return this;
  }
  setSize(px) {
    this.size = Math.max(1, Number(px) || this.size);
    return this;
  }
  setGap(px) {
    this.gap = Math.max(0, Number(px) || this.gap);
    return this;
  }
  setDot(px) {
    this.dot = Math.max(0, Number(px) || this.dot);
    return this;
  }
  draw(ctx, x, y) {
    if (!ctx) {
      return;
    }
    const { weight, alpha, size, gap, dot, color } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = weight;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(-(gap + size), 0);
    ctx.lineTo(-gap, 0);
    ctx.moveTo(gap, 0);
    ctx.lineTo(gap + size, 0);
    ctx.moveTo(0, -(gap + size));
    ctx.lineTo(0, -gap);
    ctx.moveTo(0, gap);
    ctx.lineTo(0, gap + size);
    ctx.stroke();
    if (dot > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, dot, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

class SensitivityPointer {
  constructor(canvas, opts = {}) {
    if (!canvas || !canvas.getContext) {
      throw new Error("Can truyen vao <canvas>.");
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.eventTarget = opts.eventTarget || canvas;
    this.sensitivity = clampNumber(opts.sensitivity === undefined ? 0.6 : opts.sensitivity, 0.05, 5);
    this.smoothing = clampNumber(opts.smoothing === undefined ? 0 : opts.smoothing, 0, 0.95);
    this.usePLock = Boolean(opts.pointerLock);
    this.doClamp = opts.clamp === undefined ? true : Boolean(opts.clamp);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    this.phys = { x: cx, y: cy };
    this.lastPhys = null;
    this.virt = { x: cx, y: cy };
    this.target = { x: cx, y: cy };
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
    this._raf = 0;
    this.onchange = null;
    this.attach();
  }
  setSensitivity(value) {
    this.sensitivity = clampNumber(Number(value) || 0.6, 0.05, 5);
    return this;
  }
  setSmoothing(alpha) {
    this.smoothing = clampNumber(Number(alpha) || 0, 0, 0.95);
    return this;
  }
  setClamp(enabled) {
    this.doClamp = Boolean(enabled);
    return this;
  }
  get position() {
    return { x: this.virt.x, y: this.virt.y };
  }
  attach() {
    this.eventTarget.addEventListener("mousemove", this._onMouseMove);
    this.eventTarget.addEventListener("mousedown", this._onMouseDown);
    window.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("resize", this._onResize);
    this._raf = requestAnimationFrame(this._tick);
  }
  detach() {
    this.eventTarget.removeEventListener("mousemove", this._onMouseMove);
    this.eventTarget.removeEventListener("mousedown", this._onMouseDown);
    window.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("resize", this._onResize);
    cancelAnimationFrame(this._raf);
  }
  _tick() {
    if (this.smoothing > 0) {
      this.virt.x = lerpNumber(this.virt.x, this.target.x, this.smoothing);
      this.virt.y = lerpNumber(this.virt.y, this.target.y, this.smoothing);
      if (typeof this.onchange === "function") {
        this.onchange(this.position);
      }
    }
    this._raf = requestAnimationFrame(this._tick);
  }
  _onResize() {
    if (!this.doClamp) {
      return;
    }
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.virt.x = clampNumber(this.virt.x, 0, width);
    this.virt.y = clampNumber(this.virt.y, 0, height);
    this.target.x = clampNumber(this.target.x, 0, width);
    this.target.y = clampNumber(this.target.y, 0, height);
  }
  _toCanvasCoords(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (event.clientY - rect.top) * (this.canvas.height / rect.height),
    };
  }
  _onMouseDown() {
    if (this.usePLock && this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }
  _onMouseUp() {
    if (document.pointerLockElement === this.canvas && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }
  _onMouseMove(event) {
    let dx = typeof event.movementX === "number" ? event.movementX : 0;
    let dy = typeof event.movementY === "number" ? event.movementY : 0;
    const pos = this._toCanvasCoords(event);
    if (this.lastPhys === null || (dx === 0 && dy === 0)) {
      if (this.lastPhys) {
        dx = pos.x - this.lastPhys.x;
        dy = pos.y - this.lastPhys.y;
      }
      this.lastPhys = { x: pos.x, y: pos.y };
    }
    const k = this.sensitivity;
    this.target.x += dx * k;
    this.target.y += dy * k;
    if (this.doClamp) {
      this.target.x = clampNumber(this.target.x, 0, this.canvas.width);
      this.target.y = clampNumber(this.target.y, 0, this.canvas.height);
    }
    if (this.smoothing === 0) {
      this.virt.x = this.target.x;
      this.virt.y = this.target.y;
      if (typeof this.onchange === "function") {
        this.onchange(this.position);
      }
    }
  }
}

function clampNumber(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

class SteadyAimDamper {
  constructor(opts = {}) {
    this.k = num(opts.stiffness, 40);
    this.z = clampNumber(defaultValue(opts.dampingRatio, 1.1), 0, 5);
    this.m = clampNumber(defaultValue(opts.mass, 1), 0.1, 10);
    this.vmax = clampNumber(defaultValue(opts.maxSpeed, 1200), 50, 10000);
    this.dead = clampNumber(defaultValue(opts.deadzone, 0), 0, 20);
    this.aIn = clampNumber(defaultValue(opts.inputSmoothing, 0.2), 0, 0.95);
    const p0 = defaultValue(opts.initPos, { x: 0, y: 0 });
    this.pos = { x: p0.x, y: p0.y };
    this.vel = { x: 0, y: 0 };
    this.goalRaw = { x: p0.x, y: p0.y };
    this.goal = { x: p0.x, y: p0.y };
  }
  setTarget(x, y) {
    this.goalRaw.x = x;
    this.goalRaw.y = y;
  }
  update(dt) {
    const t = Math.min(Math.max(dt, 0), 0.05);
    const a = this.aIn;
    this.goal.x = lerpNumber(this.goal.x, this.goalRaw.x, a);
    this.goal.y = lerpNumber(this.goal.y, this.goalRaw.y, a);
    const dx = this.goal.x - this.pos.x;
    const dy = this.goal.y - this.pos.y;
    const dead = this.dead;
    let ex = dx;
    let ey = dy;
    if (dead > 0) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < dead) {
        ex = 0;
        ey = 0;
      }
    }
    const omega = Math.sqrt(Math.max(this.k, 1e-6));
    const ax = ((omega * omega) * ex - (2 * this.z * omega) * this.vel.x) / this.m;
    const ay = ((omega * omega) * ey - (2 * this.z * omega) * this.vel.y) / this.m;
    this.vel.x += ax * t;
    this.vel.y += ay * t;
    const v = Math.hypot(this.vel.x, this.vel.y);
    if (v > this.vmax) {
      const s = this.vmax / Math.max(v, 1e-6);
      this.vel.x *= s;
      this.vel.y *= s;
    }
    this.pos.x += this.vel.x * t;
    this.pos.y += this.vel.y * t;
    return { x: this.pos.x, y: this.pos.y };
  }
}

class RecoilControl {
  constructor(opts = {}) {
    this.fireRate = clampNumber(defaultValue(opts.fireRate, 10), 1, 30);
    this.kickY = num(opts.kickY, 36);
    this.kickX = num(opts.kickX, 8);
    this.recoveryY = num(opts.recoveryY, 18);
    this.recoveryX = num(opts.recoveryX, 24);
    this.reduction = clampNumber(defaultValue(opts.reduction, 0.5), 0, 1);
    this.smoothing = clampNumber(defaultValue(opts.smoothing, 0.25), 0, 0.95);
    this.jitter = num(opts.jitter, 1.5);
    this.pattern = defaultValue(opts.pattern, "alt");
    this.vScaleUp = num(opts.verticalScaleUp, 0.015);
    this._firing = false;
    this._tSince = 0;
    this._shot = 0;
    this._target = { x: 0, y: 0 };
    this._curr = { x: 0, y: 0 };
  }
  triggerDown() {
    this._firing = true;
  }
  triggerUp() {
    this._firing = false;
  }
  setReduction(r) {
    this.reduction = clampNumber(r, 0, 1);
    return this;
  }
  setSmoothing(a) {
    this.smoothing = clampNumber(a, 0, 0.95);
    return this;
  }
  setFireRate(r) {
    this.fireRate = clampNumber(r, 1, 30);
    return this;
  }
  update(dt) {
    const interval = 1 / this.fireRate;
    if (this._firing) {
      this._tSince += dt;
      while (this._tSince >= interval) {
        this._tSince -= interval;
        this._emitShot();
      }
      this._target.x += randGaussian() * this.jitter * Math.sqrt(dt);
      this._target.y += randGaussian() * this.jitter * Math.sqrt(dt);
    } else {
      this._target.x = approachValue(this._target.x, 0, this.recoveryX * dt);
      this._target.y = approachValue(this._target.y, 0, this.recoveryY * dt);
    }
    const a = this.smoothing;
    this._curr.x = lerpNumber(this._curr.x, this._target.x, a);
    this._curr.y = lerpNumber(this._curr.y, this._target.y, a);
    const comp = { x: -this._curr.x * this.reduction, y: -this._curr.y * this.reduction };
    return { recoil: { ...this._curr }, compensation: comp };
  }
  _emitShot() {
    this._shot += 1;
    const scale = 1 + (this._shot - 1) * this.vScaleUp;
    const dy = this.kickY * scale;
    let dx = 0;
    if (Array.isArray(this.pattern) && this.pattern.length) {
      const p = this.pattern[(this._shot - 1) % this.pattern.length];
      const px = p && typeof p.x === "number" ? p.x : 0;
      const py = p && typeof p.y === "number" ? p.y : 0;
      dx = this.kickX * px;
      this._target.y += this.kickY * py;
    } else if (this.pattern === "alt") {
      dx = this.kickX * (this._shot % 2 ? 1 : -1);
    }
  this._target.x += dx;
  this._target.y += dy;
}
}

class SpreadControl {
  constructor(opts = {}) {
    this.mode = opts.mode === "uniform" ? "uniform" : "gaussian";
    this.baseSx = num(opts.sigmaX, num(opts.sigma, 3));
    this.baseSy = num(opts.sigmaY, num(opts.sigma, 3));
    this.clampK = num(opts.clampSigma, 3);
    this.maxR = num(opts.maxRadius, 12);
    this.fix = clampValue(defaultValue(opts.fixFactor, 0.5), 0, 1);
    this.bloom = num(opts.bloomPerShot, 0.25);
    this.decay = num(opts.decayRate, 3);
    this.fireRate = clampValue(defaultValue(opts.fireRate, 10), 1, 30);
    this._rng = makeRng(opts.seed);
    this._firing = false;
    this._shot = 0;
    this._sx = this.baseSx;
    this._sy = this.baseSy;
  }
  setFixFactor(v) {
    this.fix = clampValue(v, 0, 1);
    return this;
  }
  setBloom(px) {
    this.bloom = Math.max(0, Number(px) || 0);
    return this;
  }
  setDecay(r) {
    this.decay = Math.max(0, Number(r) || 0);
    return this;
  }
  setSigma(sx, sy) {
    this.baseSx = Math.max(0, sx);
    this.baseSy = Math.max(0, sy ?? sx);
    return this;
  }
  triggerDown() {
    this._firing = true;
  }
  triggerUp() {
    this._firing = false;
  }
  update(dt) {
    if (!this._firing) {
      this._sx = approachValue(this._sx, this.baseSx, this.decay * dt);
      this._sy = approachValue(this._sy, this.baseSy, this.decay * dt);
      this._shot = 0;
    }
  }
  nextShot() {
    this._shot += 1;
    const curSx = this.baseSx + this.bloom * (this._shot - 1);
    const curSy = this.baseSy + this.bloom * (this._shot - 1);
    const effSx = curSx * (1 - this.fix);
    const effSy = curSy * (1 - this.fix);
    let dx = 0;
    let dy = 0;
    if (this.mode === "gaussian") {
      dx = clampSym(gauss01(this._rng) * effSx, this.clampK * effSx);
      dy = clampSym(gauss01(this._rng) * effSy, this.clampK * effSy);
      const radius = Math.hypot(dx, dy);
      if (radius > this.maxR) {
        const s = this.maxR / radius;
        dx *= s;
        dy *= s;
      }
    } else {
      const u = this._rng();
      const v = this._rng();
      const angle = 2 * Math.PI * u;
      const radius = Math.sqrt(v) * (this.maxR * (1 - this.fix));
      dx = radius * Math.cos(angle);
      dy = radius * Math.sin(angle);
    }
    this._sx = curSx;
    this._sy = curSy;
    return { dx, dy, sx: effSx, sy: effSy, shot: this._shot };
  }
}

function num(v, d) {
  return Number.isFinite(v) ? v : d;
}

function approachValue(v, goal, delta) {
  if (v < goal) return Math.min(v + delta, goal);
  if (v > goal) return Math.max(v - delta, goal);
  return v;
}

function randGaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clampSym(v, m) {
  return Math.max(-m, Math.min(m, v));
}

function makeRng(seed) {
  let s = seed == null ? Math.floor(Math.random() * 2 ** 31) : seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss01(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

class LowPass {
  constructor(alpha = 0.5, init = 0) {
    this.alpha = alpha;
    this.s = init;
    this.initialized = false;
  }
  setAlpha(a) {
    this.alpha = clampValue(a, 0, 1);
  }
  reset(v) {
    this.s = v;
    this.initialized = true;
  }
  filter(v) {
    if (!this.initialized) {
      this.reset(v);
      return v;
    }
    this.s = this.s + this.alpha * (v - this.s);
    return this.s;
  }
}

function alphaFrom(fc, dt) {
  const te = Math.max(dt, 1 / 240);
  const tau = 1 / (2 * Math.PI * Math.max(fc, 1e-6));
  return 1 / (1 + tau / te);
}

class OneEuroSmoother2D {
  constructor(opts = {}) {
    this.minCutoff = Math.max(0.01, defaultValue(opts.minCutoff, 1.2));
    this.beta = Math.max(0, defaultValue(opts.beta, 0.003));
    this.dCutoff = Math.max(0.01, defaultValue(opts.dCutoff, 1));
    this.deadzone = clampValue(defaultValue(opts.deadzone, 0), 0, 20);
    const p = defaultValue(opts.init, { x: 0, y: 0 });
    this.last = { x: p.x, y: p.y };
    this.fX = new LowPass();
    this.fY = new LowPass();
    this.fdX = new LowPass();
    this.fdY = new LowPass();
    this.initialized = false;
  }
  update(x, y, dt) {
    const _dt = clampValue(defaultValue(dt, 1 / 120), 1 / 240, 0.05);
    if (!this.initialized) {
      this.reset(x, y);
      return { x, y };
    }
    const dx0 = x - this.last.x;
    const dy0 = y - this.last.y;
    if (this.deadzone > 0 && dx0 * dx0 + dy0 * dy0 < this.deadzone * this.deadzone) {
      x = this.last.x;
      y = this.last.y;
    }
    const dx = (x - this.last.x) / _dt;
    const dy = (y - this.last.y) / _dt;
    this.fdX.setAlpha(alphaFrom(this.dCutoff, _dt));
    this.fdY.setAlpha(alphaFrom(this.dCutoff, _dt));
    const dxf = this.fdX.filter(dx);
    const dyf = this.fdY.filter(dy);
    const speed = Math.hypot(dxf, dyf);
    const fc = this.minCutoff + this.beta * speed;
    this.fX.setAlpha(alphaFrom(fc, _dt));
    this.fY.setAlpha(alphaFrom(fc, _dt));
    const xf = this.fX.filter(x);
    const yf = this.fY.filter(y);
    this.last.x = xf;
    this.last.y = yf;
    return { x: xf, y: yf };
  }
  reset(x, y) {
    this.last = { x, y };
    this.fX.reset(x);
    this.fY.reset(y);
    this.fdX.reset(0);
    this.fdY.reset(0);
    this.initialized = true;
    return this;
  }
}

class AntiOvershoot2D {
  constructor(opts = {}) {
    this.kp = num(opts.kp, 100);
    this.kd = num(opts.kd, 20);
    this.vmax = clampValue(defaultValue(opts.vmax, 1600), 50, 10000);
    this.amax = clampValue(defaultValue(opts.amax, 4000), 100, 50000);
    this.jmax = clampValue(defaultValue(opts.jmax, 20000), 1000, 200000);
    this.brakeAcc = clampValue(defaultValue(opts.brakeAcc, 3000), 100, 50000);
    this.dead = clampValue(defaultValue(opts.deadzone, 0.4), 0, 10);
    this.snap = clampValue(defaultValue(opts.snap, 0.75), 0, 10);
    this.aIn = clampValue(defaultValue(opts.inputSmooth, 0.15), 0, 0.95);
    const p0 = defaultValue(opts.initPos, { x: 0, y: 0 });
    this.pos = { x: p0.x, y: p0.y };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.goalRaw = { x: p0.x, y: p0.y };
    this.goal = { x: p0.x, y: p0.y };
  }
  setTarget(x, y) {
    this.goalRaw.x = x;
    this.goalRaw.y = y;
    return this;
  }
  setGains(kp, kd) {
    this.kp = num(kp, this.kp);
    this.kd = num(kd, this.kd);
    return this;
  }
  update(dt) {
    const t = clampValue(dt, 1 / 1000, 0.05);
    this.goal.x = lerpNumber(this.goal.x, this.goalRaw.x, this.aIn);
    this.goal.y = lerpNumber(this.goal.y, this.goalRaw.y, this.aIn);
    let ex = this.goal.x - this.pos.x;
    let ey = this.goal.y - this.pos.y;
    if (this.dead > 0 && ex * ex + ey * ey < this.dead * this.dead) {
      ex = 0;
      ey = 0;
    }
    let axDes = this.kp * ex - this.kd * this.vel.x;
    let ayDes = this.kp * ey - this.kd * this.vel.y;
    const vx = this.vel.x;
    const vy = this.vel.y;
    const vmag = Math.hypot(vx, vy);
    if (vmag > 1e-4) {
      const eAlongV = (vx * ex + vy * ey) / vmag;
      const stopDist = (vmag * vmag) / (2 * this.brakeAcc);
      if (stopDist > Math.max(0, eAlongV)) {
        axDes = -(this.brakeAcc * vx) / vmag;
        ayDes = -(this.brakeAcc * vy) / vmag;
      }
    }
    let aMag = Math.hypot(axDes, ayDes);
    if (aMag > this.amax) {
      const s = this.amax / aMag;
      axDes *= s;
      ayDes *= s;
      aMag = this.amax;
    }
    const dax = axDes - this.acc.x;
    const day = ayDes - this.acc.y;
    const maxStep = this.jmax * t;
    let dMag = Math.hypot(dax, day);
    if (dMag > maxStep) {
      const s = maxStep / dMag;
      this.acc.x += dax * s;
      this.acc.y += day * s;
    } else {
      this.acc.x = axDes;
      this.acc.y = ayDes;
    }
    this.vel.x += this.acc.x * t;
    this.vel.y += this.acc.y * t;
    const speed = Math.hypot(this.vel.x, this.vel.y);
    if (speed > this.vmax) {
      const s = this.vmax / speed;
      this.vel.x *= s;
      this.vel.y *= s;
    }
    this.pos.x += this.vel.x * t;
    this.pos.y += this.vel.y * t;
    const e2 = (this.goal.x - this.pos.x) ** 2 + (this.goal.y - this.pos.y) ** 2;
    if (e2 < this.snap * this.snap && Math.hypot(this.vel.x, this.vel.y) < 20) {
      this.pos.x = this.goal.x;
      this.pos.y = this.goal.y;
      this.vel.x = 0;
      this.vel.y = 0;
      this.acc.x = 0;
      this.acc.y = 0;
    }
    return { x: this.pos.x, y: this.pos.y };
  }
}

function initPanel() {
  const cards = document.querySelectorAll("[data-feature]");
  const limitToast = document.getElementById("limitToast");
  const limitOverlay = document.getElementById("limitOverlay");
  if (!cards.length) {
    return;
  }
  const featureState = {};
  const featureRefs = {};
  Array.prototype.forEach.call(cards, (card) => {
    const featureId = card.getAttribute("data-feature");
    const button = card.querySelector(".aimlock-switch");
    const status = card.querySelector(".status-pill");
    if (!featureId || !button || !status) {
      return;
    }
    featureState[featureId] = false;
    featureRefs[featureId] = { button, status, card };
    button.addEventListener("click", (event) => {
      event.preventDefault();
      toggleFeature(featureId);
    });
    card.addEventListener("click", (event) => {
      if (button.contains(event.target)) {
        return;
      }
      toggleFeature(featureId);
    });
  });

  function activeCount() {
    return Object.keys(featureState).reduce((count, id) => count + (featureState[id] ? 1 : 0), 0);
  }

  function toggleFeature(id) {
    if (!featureRefs[id]) {
      return;
    }
    if (!featureState[id] && activeCount() >= MAX_ACTIVE) {
      showLimit();
      return;
    }
    featureState[id] = !featureState[id];
    renderFeature(id, featureState[id]);
    runFeatureHandler(id, featureState[id]);
    ping();
  }

  function renderFeature(id, isOn) {
    const refs = featureRefs[id];
    refs.button.classList.toggle("on", isOn);
    refs.button.setAttribute("aria-pressed", String(isOn));
    refs.card.classList.toggle("active", isOn);
    refs.status.textContent = isOn ? "On" : "Off";
    refs.status.classList.toggle("on", isOn);
    refs.status.classList.toggle("off", !isOn);
  }

  function showLimit() {
    if (!limitToast) {
      return;
    }
    limitToast.classList.add("show");
    if (limitOverlay) {
      limitOverlay.classList.add("show");
    }
    setTimeout(() => {
      limitToast.classList.remove("show");
      if (limitOverlay) {
        limitOverlay.classList.remove("show");
      }
    }, 1600);
  }

  function runFeatureHandler(id, isOn) {
    const handler = featureHandlers[id];
    if (!handler) {
      return;
    }
    if (isOn && handler.enable) {
      handler.enable();
    } else if (!isOn && handler.disable) {
      handler.disable();
    }
  }

}

function createPing() {
  const AudioApi = window.AudioContext || window.webkitAudioContext;
  if (!AudioApi) {
    return () => {};
  }
  const ctx = new AudioApi();
  return () => {
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  };
}

function getSharedCanvas() {
  if (!canvasState.element) {
    canvasState.element = document.getElementById("aimCanvas");
  }
  return canvasState.element;
}

function ensureCanvasSize() {
  const canvas = getSharedCanvas();
  if (!canvas) {
    return null;
  }
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(window.innerWidth * dpr);
  const height = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  if (!canvasState.ctx) {
    canvasState.ctx = canvas.getContext("2d");
  }
  canvasState.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return canvasState.ctx;
}

function acquireCanvasDraw(userId) {
  const canvas = getSharedCanvas();
  if (!canvas) {
    console.warn("Canvas element not found");
    return null;
  }
  const ctx = ensureCanvasSize();
  canvasState.drawUsers.add(userId);
  canvas.classList.add("show");
  attachCanvasResizeHandler();
  return ctx;
}

function releaseCanvasDraw(userId) {
  const canvas = getSharedCanvas();
  if (!canvas) {
    return;
  }
  canvasState.drawUsers.delete(userId);
  if (!canvasState.drawUsers.size) {
    if (canvasState.ctx) {
      canvasState.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (!canvasState.pointerUsers.size) {
      canvas.classList.remove("show");
    }
    detachCanvasResizeHandlerIfIdle();
  }
}

function acquireCanvasPointer(userId) {
  const canvas = getSharedCanvas();
  if (!canvas) {
    console.warn("Canvas element not found");
    return null;
  }
  ensureCanvasSize();
  canvasState.pointerUsers.add(userId);
  canvas.style.pointerEvents = "auto";
  canvas.classList.add("show");
  attachCanvasResizeHandler();
  return canvas;
}

function releaseCanvasPointer(userId) {
  const canvas = getSharedCanvas();
  if (!canvas) {
    return;
  }
  canvasState.pointerUsers.delete(userId);
  if (!canvasState.pointerUsers.size) {
    canvas.style.pointerEvents = "none";
    if (!canvasState.drawUsers.size) {
      canvas.classList.remove("show");
    }
  }
  detachCanvasResizeHandlerIfIdle();
}

function attachCanvasResizeHandler() {
  if (canvasState.resizeHandler) {
    return;
  }
  canvasState.resizeHandler = () => {
    if (canvasState.drawUsers.size || canvasState.pointerUsers.size) {
      ensureCanvasSize();
    }
  };
  window.addEventListener("resize", canvasState.resizeHandler);
}

function detachCanvasResizeHandlerIfIdle() {
  if (!canvasState.resizeHandler) {
    return;
  }
  if (canvasState.drawUsers.size || canvasState.pointerUsers.size) {
    return;
  }
  window.removeEventListener("resize", canvasState.resizeHandler);
  canvasState.resizeHandler = null;
}

function startCodeRain() {
  const layer = document.getElementById("codeRain");
  if (!layer) {
    return;
  }
  layer.innerHTML = "";
  const pickSnippet = () => CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
  const formatSnippet = (snippet) =>
    snippet
      .split("\n")
      .map((line) => (line.trim().length === 0 ? " " : line))
      .join("<br />");
  const spawnColumn = () => {
    const column = document.createElement("div");
    column.className = "code-column";
    layer.appendChild(column);
    const track = document.createElement("div");
    track.className = "code-track";
    column.appendChild(track);
    const duration = 12 + Math.random() * 14;
    column.style.setProperty("--duration", `${duration}s`);
    column.style.setProperty("--delay", `${-Math.random() * duration}s`);
    const refresh = () => {
      const snippet = formatSnippet(pickSnippet());
      track.innerHTML = `${snippet}<br />${snippet}`;
    };
    refresh();
    setInterval(refresh, 4500 + Math.random() * 5500);
  };
  for (let i = 0; i < CODE_COLUMNS; i += 1) {
    spawnColumn();
  }
}

function bootPanel() {
  initPanel();
  startCodeRain();
  console.log("Panel booted, features:", Object.keys(featureHandlers));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootPanel);
} else {
  bootPanel();
}

const aimReticleDrawer = new Crosshair({
  weight: 1.4,
  alpha: 0.9,
  size: 18,
  gap: 5,
  dot: 4,
  color: "#e2e8f0",
});
const aimDemoState = {
  active: false,
  reticle: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  targets: [],
  raf: 0,
  lastTime: null,
  canvas: null,
  ctx: null,
  crosshairEl: null,
  aimPoint: null,
};
const aimMouseHandler = (event) => {
  aimDemoState.mouse.x = event.clientX;
  aimDemoState.mouse.y = event.clientY;
};

function startAimAssistDemo() {
  console.info("Aimlock visual effect disabled per user request.");
}

function stopAimAssistDemo() {
  console.info("Aimlock visual effect already disabled.");
}

function createAimTargets() {
  const targets = [];
  for (let i = 0; i < 6; i += 1) {
    targets.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 160,
      vy: (Math.random() - 0.5) * 160,
    });
  }
  return targets;
}

function updateAimTargets(targets, dt) {
  targets.forEach((t) => {
    t.x += t.vx * dt;
    t.y += t.vy * dt;
    if (t.x < 0 || t.x > window.innerWidth) {
      t.vx *= -1;
    }
    if (t.y < 0 || t.y > window.innerHeight) {
      t.vy *= -1;
    }
  });
}

function runAimAssistLoop(timestamp) {
  if (!aimDemoState.active) {
    return;
  }
  if (!aimDemoState.lastTime) {
    aimDemoState.lastTime = timestamp;
  }
  const dt = (timestamp - aimDemoState.lastTime) / 1000;
  aimDemoState.lastTime = timestamp;
  updateAimTargets(aimDemoState.targets, dt);
  const result = updateReticle(
    aimDemoState.reticle,
    aimDemoState.mouse,
    aimDemoState.targets,
    {
      enabled: true,
      predict: true,
      bulletSpeed: 700,
      smoothing: 0.3,
      strength: 0.45,
      fov: 260,
    }
  );
  aimDemoState.reticle = result.reticle;
  aimDemoState.aimPoint = result.aimPoint;
  renderAimAssistScene();
  aimDemoState.raf = requestAnimationFrame(runAimAssistLoop);
}

function renderAimAssistScene() {
  if (!aimDemoState.ctx || !aimDemoState.canvas) {
    return;
  }
  const ctx = aimDemoState.ctx;
  ctx.clearRect(0, 0, aimDemoState.canvas.width, aimDemoState.canvas.height);
  ctx.save();
  ctx.lineWidth = 1.4;
  aimDemoState.targets.forEach((t) => {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  if (aimDemoState.aimPoint) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(34, 211, 238, 0.7)";
    ctx.arc(aimDemoState.aimPoint.x, aimDemoState.aimPoint.y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  aimReticleDrawer.draw(ctx, aimDemoState.reticle.x, aimDemoState.reticle.y);
  ctx.restore();
  if (aimDemoState.crosshairEl) {
    const half = aimDemoState.crosshairEl.offsetWidth / 2 || 60;
    aimDemoState.crosshairEl.style.transform = `translate(${aimDemoState.reticle.x - half}px, ${
      aimDemoState.reticle.y - half
    }px)`;
    aimDemoState.crosshairEl.classList.add("show");
  }
}

const featherAimState = {
  active: false,
};

function startFeatherAim() {
  console.info("Feather Aim visual effect disabled per user request.");
}

function stopFeatherAim() {
  console.info("Feather Aim visual effect already disabled.");
}

const quickSwipeState = {
  active: false,
  module: null,
  instance: null,
};

function startQuickSwipe() {
  if (quickSwipeState.active) {
    return;
  }
  const canvas = getSharedCanvas();
  if (!canvas) {
    console.warn("Quick swipe: canvas not found");
    return;
  }
  ensureCanvasSize();
  quickSwipeState.instance = new SensitivityPointer(canvas, {
    sensitivity: 0.9,
    smoothing: 0.08,
    pointerLock: false,
    clamp: true,
    eventTarget: window,
  });
  quickSwipeState.active = true;
}

function stopQuickSwipe() {
  if (!quickSwipeState.active) {
    return;
  }
  quickSwipeState.active = false;
  if (quickSwipeState.instance && typeof quickSwipeState.instance.detach === "function") {
    quickSwipeState.instance.detach();
  }
  quickSwipeState.instance = null;
}

const driftState = {
  active: false,
  controller: null,
  raf: 0,
  lastTime: null,
  timer: 0,
};

function startDriftFix() {
  if (driftState.active) {
    return;
  }
  driftState.controller = new SpreadControl({
    fixFactor: 0.65,
    bloomPerShot: 0.2,
    decayRate: 4,
    fireRate: 9,
    mode: "gaussian",
  });
  driftState.controller.triggerDown();
  driftState.active = true;
  driftState.lastTime = null;
  driftState.timer = 0;
  driftState.raf = requestAnimationFrame(runDriftLoop);
}

function stopDriftFix() {
  if (!driftState.active) {
    return;
  }
  driftState.active = false;
  if (driftState.controller) {
    driftState.controller.triggerUp();
  }
  cancelAnimationFrame(driftState.raf);
  driftState.raf = 0;
  driftState.controller = null;
}

function runDriftLoop(timestamp) {
  if (!driftState.active || !driftState.controller) {
    return;
  }
  if (!driftState.lastTime) {
    driftState.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - driftState.lastTime) / 1000, 0.05);
  driftState.lastTime = timestamp;
  driftState.controller.update(dt);
  driftState.timer += dt;
  const interval = 1 / driftState.controller.fireRate;
  if (driftState.timer >= interval) {
    driftState.timer -= interval;
    driftState.controller.nextShot();
  }
  driftState.raf = requestAnimationFrame(runDriftLoop);
}

const steadyState = {
  active: false,
  instance: null,
  raf: 0,
  lastTime: null,
  mouseHandler: null,
};

function startSteadyHold() {
  if (steadyState.active) {
    return;
  }
  steadyState.instance = new SteadyAimDamper({
    stiffness: 45,
    dampingRatio: 1.2,
    inputSmoothing: 0.25,
    initPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  });
  steadyState.mouseHandler = (event) => {
    if (steadyState.instance) {
      steadyState.instance.setTarget(event.clientX, event.clientY);
    }
  };
  window.addEventListener("mousemove", steadyState.mouseHandler);
  steadyState.active = true;
  steadyState.lastTime = null;
  steadyState.raf = requestAnimationFrame(runSteadyLoop);
}

function stopSteadyHold() {
  if (!steadyState.active) {
    return;
  }
  steadyState.active = false;
  cancelAnimationFrame(steadyState.raf);
  steadyState.raf = 0;
  if (steadyState.mouseHandler) {
    window.removeEventListener("mousemove", steadyState.mouseHandler);
  }
  steadyState.mouseHandler = null;
  steadyState.instance = null;
}

function runSteadyLoop(timestamp) {
  if (!steadyState.active || !steadyState.instance) {
    return;
  }
  if (!steadyState.lastTime) {
    steadyState.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - steadyState.lastTime) / 1000, 0.05);
  steadyState.lastTime = timestamp;
  steadyState.instance.update(dt);
  steadyState.raf = requestAnimationFrame(runSteadyLoop);
}

const anchorState = {
  active: false,
  instance: null,
  raf: 0,
  lastTime: null,
};

function startAnchorAim() {
  if (anchorState.active) {
    return;
  }
  anchorState.instance = new RecoilControl({
    fireRate: 12,
    kickY: 28,
    kickX: 6,
    reduction: 0.6,
    smoothing: 0.25,
  });
  anchorState.instance.triggerDown();
  anchorState.active = true;
  anchorState.lastTime = null;
  anchorState.raf = requestAnimationFrame(runAnchorLoop);
}

function stopAnchorAim() {
  if (!anchorState.active) {
    return;
  }
  anchorState.active = false;
  if (anchorState.instance) {
    anchorState.instance.triggerUp();
  }
  cancelAnimationFrame(anchorState.raf);
  anchorState.raf = 0;
  anchorState.instance = null;
}

function runAnchorLoop(timestamp) {
  if (!anchorState.active || !anchorState.instance) {
    return;
  }
  if (!anchorState.lastTime) {
    anchorState.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - anchorState.lastTime) / 1000, 0.05);
  anchorState.lastTime = timestamp;
  anchorState.instance.update(dt);
  anchorState.raf = requestAnimationFrame(runAnchorLoop);
}

const shakeState = {
  active: false,
  smoother: null,
  handler: null,
  raf: 0,
  lastTime: null,
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
};

function startShakeFix() {
  if (shakeState.active) {
    return;
  }
  shakeState.smoother = new OneEuroSmoother2D({
    init: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    minCutoff: 1.2,
    beta: 0.004,
    deadzone: 0.2,
  });
  shakeState.mouse.x = window.innerWidth / 2;
  shakeState.mouse.y = window.innerHeight / 2;
  shakeState.handler = (event) => {
    shakeState.mouse.x = event.clientX;
    shakeState.mouse.y = event.clientY;
  };
  window.addEventListener("mousemove", shakeState.handler);
  shakeState.active = true;
  shakeState.lastTime = null;
  shakeState.raf = requestAnimationFrame(runShakeLoop);
}

function stopShakeFix() {
  if (!shakeState.active) {
    return;
  }
  shakeState.active = false;
  cancelAnimationFrame(shakeState.raf);
  shakeState.raf = 0;
  shakeState.lastTime = null;
  if (shakeState.handler) {
    window.removeEventListener("mousemove", shakeState.handler);
  }
  shakeState.handler = null;
  shakeState.smoother = null;
}

function runShakeLoop(timestamp) {
  if (!shakeState.active || !shakeState.smoother) {
    return;
  }
  if (!shakeState.lastTime) {
    shakeState.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - shakeState.lastTime) / 1000, 0.05);
  shakeState.lastTime = timestamp;
  shakeState.smoother.update(shakeState.mouse.x, shakeState.mouse.y, dt);
  shakeState.raf = requestAnimationFrame(runShakeLoop);
}

const headFixState = {
  active: false,
  controller: null,
  raf: 0,
  lastTime: null,
  mouseHandler: null,
};

function startHeadFix() {
  if (headFixState.active) {
    return;
  }
  headFixState.controller = new AntiOvershoot2D({
    kp: 110,
    kd: 26,
    initPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  });
  headFixState.mouseHandler = (event) => {
    headFixState.controller.setTarget(event.clientX, event.clientY);
  };
  window.addEventListener("mousemove", headFixState.mouseHandler);
  headFixState.active = true;
  headFixState.lastTime = null;
  headFixState.raf = requestAnimationFrame(runHeadFixLoop);
}

function stopHeadFix() {
  if (!headFixState.active) {
    return;
  }
  headFixState.active = false;
  cancelAnimationFrame(headFixState.raf);
  headFixState.raf = 0;
  if (headFixState.mouseHandler) {
    window.removeEventListener("mousemove", headFixState.mouseHandler);
  }
  headFixState.mouseHandler = null;
  headFixState.controller = null;
}

function runHeadFixLoop(timestamp) {
  if (!headFixState.active || !headFixState.controller) {
    return;
  }
  if (!headFixState.lastTime) {
    headFixState.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - headFixState.lastTime) / 1000, 0.05);
  headFixState.lastTime = timestamp;
  const pos = headFixState.controller.update(dt);
  headFixState.raf = requestAnimationFrame(runHeadFixLoop);
}








