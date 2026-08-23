import {
  METRICS,
  formatElapsed,
  formatStartDate,
  getElapsedSeconds,
  startOfToday,
  shiftUtcDate,
  canSelectNextDate,
  snapshotMetrics,
  buildShareText
} from "./earth-stats.js";
import { BRAND_MARK, ICONS } from "./icons.js";
import { createField, stepField } from "./particles.js";

const els = {
  utcClock: document.getElementById("utcClock"),
  sinceLabel: document.getElementById("sinceLabel"),
  startDate: document.getElementById("startDate"),
  timer: document.getElementById("timer"),
  netPeople: document.getElementById("netPeople"),
  pausedBadge: document.getElementById("pausedBadge"),
  stats: document.getElementById("stats"),
  pauseBtn: document.getElementById("pauseBtn"),
  shareBtn: document.getElementById("shareBtn"),
  sourcesBtn: document.getElementById("sourcesBtn"),
  sourcesDialog: document.getElementById("sourcesDialog"),
  sourcesList: document.getElementById("sourcesList"),
  toast: document.getElementById("toast"),
  audio: document.getElementById("bgAudio"),
  audioToggle: document.getElementById("audioToggle"),
  prevDay: document.getElementById("prevDay"),
  nextDay: document.getElementById("nextDay")
};

const sessionStart = Date.now();
const state = {
  mode: "date",
  category: "all",
  paused: false,
  frozenElapsed: 0,
  selectedDate: startOfToday().getTime()
};

const brandSlot = document.querySelector("[data-brand-mark]");
if (brandSlot) {
  brandSlot.innerHTML = BRAND_MARK;
}

els.startDate.textContent = formatStartDate(startOfToday());
els.audio.volume = 0.2;

function currentElapsed() {
  if (state.paused) {
    return state.frozenElapsed;
  }

  return getElapsedSeconds(state.mode, Date.now(), sessionStart, state.selectedDate);
}

function renderUtcClock() {
  const now = new Date();
  const utc = now.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  });

  els.utcClock.dateTime = now.toISOString();
  els.utcClock.textContent = `${utc} UTC`;
}

function renderClock(elapsed) {
  renderUtcClock();
  els.timer.textContent = formatElapsed(elapsed);
  const selected = startOfToday(state.selectedDate);
  const isToday = selected.getTime() === startOfToday().getTime();
  els.sinceLabel.textContent = isToday
    ? "Counts so far on this UTC day"
    : "Full UTC day";
  els.startDate.textContent = formatStartDate(selected);
  els.nextDay.disabled = !canSelectNextDate(state.selectedDate);

  const net = snapshotMetrics(elapsed, "people").find((card) => card.id === "netPeople");
  els.netPeople.textContent = net ? `${net.display} net people` : "";
}

function renderStats(elapsed) {
  const cards = snapshotMetrics(elapsed, state.category);

  els.stats.replaceChildren(
    ...cards.map((card, index) => {
      const article = document.createElement("article");
      article.className = "stat";
      article.dataset.id = card.id;
      article.dataset.sign = card.sign;
      article.style.setProperty("--delay", `${index * 45}ms`);
      article.innerHTML = `
        <div class="stat-icon">${ICONS[card.id] ?? ""}</div>
        <p class="stat-value">${card.display}</p>
        <p class="stat-label">${card.label}</p>
        <p class="stat-rate">${card.rateLabel}</p>
      `;
      return article;
    })
  );
}

function renderSources() {
  els.sourcesList.replaceChildren(
    ...METRICS.map((metric) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = metric.sourceUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = metric.label;
      const note = document.createElement("p");
      note.textContent = metric.source;
      item.append(link, note);
      return item;
    })
  );
}

function render(elapsed = currentElapsed()) {
  renderClock(elapsed);
  renderStats(elapsed);
}

function shiftDay(days) {
  const next = shiftUtcDate(state.selectedDate, days);
  const today = startOfToday().getTime();

  if (next > today) {
    return;
  }

  state.selectedDate = next;
  state.paused = false;
  els.pauseBtn.textContent = "Pause";
  els.pauseBtn.setAttribute("aria-pressed", "false");
  els.pausedBadge.hidden = true;
  render();
}

function setCategory(category) {
  state.category = category;
  document.querySelectorAll("[data-cat]").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.cat === category));
  });
  render();
}

function togglePause() {
  if (state.paused) {
    state.paused = false;
  } else {
    state.frozenElapsed = currentElapsed();
    state.paused = true;
  }

  els.pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  els.pauseBtn.setAttribute("aria-pressed", String(state.paused));
  els.pausedBadge.hidden = !state.paused;
  render();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2200);
}

async function shareSnapshot() {
  const elapsed = currentElapsed();
  const text = buildShareText(elapsed, Date.now(), state.selectedDate);

  try {
    if (navigator.share) {
      await navigator.share({ title: "Earth In Real Time", text });
      return;
    }

    await navigator.clipboard.writeText(text);
    showToast("Snapshot copied");
  } catch (error) {
    if (error?.name !== "AbortError") {
      showToast("Could not share snapshot");
    }
  }
}

function syncAudioButton() {
  const paused = els.audio.paused;
  els.audioToggle.innerHTML = `${paused ? ICONS.play : ICONS.pause}<span class="visually-hidden">${paused ? "Play" : "Pause"}</span>`;
  els.audioToggle.setAttribute("aria-pressed", String(!paused));
  els.audioToggle.setAttribute("aria-label", paused ? "Play audio" : "Pause audio");
}

els.prevDay.addEventListener("click", () => shiftDay(-1));
els.nextDay.addEventListener("click", () => shiftDay(1));

document.querySelectorAll("[data-cat]").forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.cat));
});

els.pauseBtn.addEventListener("click", togglePause);
els.shareBtn.addEventListener("click", () => {
  void shareSnapshot();
});
els.sourcesBtn.addEventListener("click", () => els.sourcesDialog.showModal());
els.sourcesDialog.querySelector(".dialog-close").addEventListener("click", () => {
  els.sourcesDialog.close();
});

els.audioToggle.addEventListener("click", async () => {
  try {
    if (els.audio.paused) {
      await els.audio.play();
    } else {
      els.audio.pause();
    }
  } catch {
    showToast("Tap play again after interacting with the page");
  }
  syncAudioButton();
});

els.audio.addEventListener("play", syncAudioButton);
els.audio.addEventListener("pause", syncAudioButton);

function tick() {
  if (state.paused) {
    renderUtcClock();
  } else {
    renderClock(currentElapsed());
    snapshotMetrics(currentElapsed(), state.category).forEach((card, index) => {
      const node = els.stats.children[index];
      if (node) {
        node.querySelector(".stat-value").textContent = card.display;
      }
    });
  }

  requestAnimationFrame(tick);
}

function startParticles() {
  const canvas = document.getElementById("particles");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let last = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = createField(Math.random, { width, height });
  }

  function paint(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    particles = stepField(particles, dt, { width, height });
    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = particle.alpha * 0.4;
      ctx.fillRect(particle.x - particle.r * 0.28, particle.y - particle.r * 12, particle.r * 0.56, particle.r * 12);
      ctx.beginPath();
      ctx.globalAlpha = particle.alpha;
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(paint);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(paint);
}

renderSources();
render();
syncAudioButton();
startParticles();
requestAnimationFrame(tick);
