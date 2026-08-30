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
  utcClock: document.getElementById("utcClock"), sinceLabel: document.getElementById("sinceLabel"), startDate: document.getElementById("startDate"), timer: document.getElementById("timer"), netPeople: document.getElementById("netPeople"), stats: document.getElementById("stats"), pauseBtn: document.getElementById("pauseBtn"), shareBtn: document.getElementById("shareBtn"), sourcesBtn: document.getElementById("sourcesBtn"), sourcesDialog: document.getElementById("sourcesDialog"), sourcesList: document.getElementById("sourcesList"), toast: document.getElementById("toast"), audio: document.getElementById("bgAudio"), audioToggle: document.getElementById("audioToggle"), prevDay: document.getElementById("prevDay"), nextDay: document.getElementById("nextDay"), eventHeadline: document.getElementById("eventHeadline"), eventDetail: document.getElementById("eventDetail"), challengeTitle: document.getElementById("challengeTitle"), challengeText: document.getElementById("challengeText"), challengeCounter: document.getElementById("challengeCounter"), fastestMetric: document.getElementById("fastestMetric"), worldStage: document.getElementById("worldStage")
};

const sessionStart = Date.now();
const state = { mode: "date", category: "all", paused: false, frozenElapsed: 0, selectedDate: startOfToday().getTime() };
const brandSlot = document.querySelector("[data-brand-mark]");
if (brandSlot) brandSlot.innerHTML = BRAND_MARK;

/* Browser autoplay policies can block an unmuted soundtrack until interaction. */
els.audio.preload = "auto";
els.audio.volume = 0.4;
let audioRequested = false;

function currentElapsed() { return state.paused ? state.frozenElapsed : getElapsedSeconds(state.mode, Date.now(), sessionStart, state.selectedDate); }
function renderUtcClock() {
  const now = new Date();
  const utc = now.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "UTC" });
  els.utcClock.dateTime = now.toISOString(); els.utcClock.textContent = `${utc} UTC`;
}
function renderClock(elapsed) {
  renderUtcClock(); els.timer.textContent = formatElapsed(elapsed);
  const selected = startOfToday(state.selectedDate); const isToday = selected.getTime() === startOfToday().getTime();
  els.sinceLabel.textContent = isToday ? "Counts so far on this UTC day" : "Full UTC day"; els.startDate.textContent = formatStartDate(selected); els.nextDay.disabled = !canSelectNextDate(state.selectedDate);
  const net = snapshotMetrics(elapsed, "people").find((card) => card.id === "netPeople"); els.netPeople.textContent = net ? net.display : "+0";
}
function renderStats(elapsed) {
  const cards = snapshotMetrics(elapsed, state.category);
  els.stats.replaceChildren(...cards.map((card, index) => {
    const article = document.createElement("article"); article.className = "stat"; article.dataset.id = card.id; article.dataset.sign = card.sign; article.style.setProperty("--delay", `${index * 35}ms`);
    article.innerHTML = `<div class="stat-icon">${ICONS[card.id] ?? ""}</div><p class="stat-value">${card.display}</p><p class="stat-label">${card.label}</p><p class="stat-rate">${card.rateLabel}</p>`; return article;
  }));
}
function renderSources() {
  els.sourcesList.replaceChildren(...METRICS.map((metric) => { const item = document.createElement("li"); const link = document.createElement("a"); link.href = metric.sourceUrl; link.target = "_blank"; link.rel = "noreferrer"; link.textContent = metric.label; const note = document.createElement("p"); note.textContent = metric.source; item.append(link, note); return item; }));
}
function updateEngagement(elapsed) {
  const cards = snapshotMetrics(elapsed, "all"); const fastest = [...cards].sort((a, b) => b.perSecond - a.perSecond)[0]; if (fastest) els.fastestMetric.textContent = `FASTEST: ${fastest.label.toUpperCase()}`;
  const seconds = Math.floor(elapsed); const challenges = [["Stay for 10 seconds.", "Watch the numbers change without stopping."],["Can you make it to 30?", "A few seconds is enough to change the planet’s counters."],["Now pick a category.", "People. Travel. Planet. Digital. Which one surprises you?"],["Don’t blink.", "The fastest counters are moving every second."],["Beat your last watch.", "Leave this open and watch the gap grow."],["Find the biggest number.", "Switch categories and see what dominates."]];
  const item = challenges[Math.floor(seconds / 10) % challenges.length]; els.challengeTitle.textContent = item[0]; els.challengeText.textContent = item[1]; const remaining = 10 - (seconds % 10); els.challengeCounter.textContent = remaining === 10 ? "10" : String(remaining);
  const headlines = [["THE PLANET IS BUSY", "Births, flights, messages and emissions are all advancing."],["SOMETHING JUST CHANGED", "Every second adds another slice of the world’s activity."],["WATCH THE SCALE GROW", "A few more seconds means millions more in some counters."],["LIVE HUMAN ACTIVITY", "The largest movement right now is happening in the digital layer."],["EARTH DOESN’T PAUSE", "Even while this page sits still, the numbers keep climbing."]]; const [headline, detail] = headlines[Math.floor(seconds / 7) % headlines.length]; els.eventHeadline.textContent = headline; els.eventDetail.textContent = detail;
  if (els.worldStage) els.worldStage.style.setProperty("--pulse-intensity", Math.min(1, 0.45 + ((seconds % 10) / 10)).toFixed(2));
}
function render(elapsed = currentElapsed()) { renderClock(elapsed); renderStats(elapsed); updateEngagement(elapsed); }
function shiftDay(days) { const next = shiftUtcDate(state.selectedDate, days); const today = startOfToday().getTime(); if (next > today) return; state.selectedDate = next; state.paused = false; state.frozenElapsed = 0; els.pauseBtn.textContent = "PAUSE THE WORLD"; els.pauseBtn.setAttribute("aria-pressed", "false"); render(); }
function setCategory(category) { state.category = category; document.querySelectorAll("[data-cat]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.cat === category))); render(); }
function togglePause() { if (state.paused) state.paused = false; else { state.frozenElapsed = currentElapsed(); state.paused = true; } els.pauseBtn.textContent = state.paused ? "RESUME THE WORLD" : "PAUSE THE WORLD"; els.pauseBtn.setAttribute("aria-pressed", String(state.paused)); document.body.classList.toggle("is-paused", state.paused); render(); }
function showToast(message) { els.toast.textContent = message; els.toast.hidden = false; window.setTimeout(() => { els.toast.hidden = true; }, 2200); }
async function shareSnapshot() { const text = buildShareText(currentElapsed(), Date.now(), state.selectedDate); try { if (navigator.share) { await navigator.share({ title: "Earth In Real Time", text }); return; } await navigator.clipboard.writeText(text); showToast("Snapshot copied"); } catch (error) { if (error?.name !== "AbortError") showToast("Could not share snapshot"); } }
function syncAudioButton() { const paused = els.audio.paused; els.audioToggle.innerHTML = `${paused ? ICONS.play : ICONS.pause}<span class="visually-hidden">${paused ? "Play" : "Pause"}</span>`; els.audioToggle.setAttribute("aria-pressed", String(!paused)); els.audioToggle.setAttribute("aria-label", paused ? "Play music" : "Pause music"); }
async function startMusic() {
  if (!els.audio || !els.audio.paused) return true;
  audioRequested = true;
  try { await els.audio.play(); syncAudioButton(); return true; }
  catch (error) { syncAudioButton(); return false; }
}

els.prevDay.addEventListener("click", () => shiftDay(-1)); els.nextDay.addEventListener("click", () => shiftDay(1));
document.querySelectorAll("[data-cat]").forEach((button) => button.addEventListener("click", () => setCategory(button.dataset.cat)));
els.pauseBtn.addEventListener("click", togglePause); els.shareBtn.addEventListener("click", () => void shareSnapshot()); els.sourcesBtn.addEventListener("click", () => els.sourcesDialog.showModal()); els.sourcesDialog.querySelector(".dialog-close").addEventListener("click", () => els.sourcesDialog.close());

els.audioToggle.addEventListener("click", async () => { if (els.audio.paused) { const ok = await startMusic(); if (!ok) showToast("Music could not start — check the audio file/browser"); } else els.audio.pause(); syncAudioButton(); });
els.audio.addEventListener("play", syncAudioButton); els.audio.addEventListener("pause", syncAudioButton); els.audio.addEventListener("error", () => { syncAudioButton(); showToast("Music file could not be loaded"); });

/* First interaction fallback: browsers commonly allow audio after any user gesture. */
const unlockAudio = () => { if (!audioRequested && els.audio.paused) void startMusic(); window.removeEventListener("pointerdown", unlockAudio); window.removeEventListener("keydown", unlockAudio); };
window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true }); window.addEventListener("keydown", unlockAudio, { once: true });

function tick() { if (state.paused) renderUtcClock(); else { const elapsed = currentElapsed(); renderClock(elapsed); updateEngagement(elapsed); const cards = snapshotMetrics(elapsed, state.category); cards.forEach((card, index) => { const node = els.stats.children[index]; if (node) node.querySelector(".stat-value").textContent = card.display; }); } requestAnimationFrame(tick); }
function startParticles() { const canvas = document.getElementById("particles"); if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const ctx = canvas.getContext("2d"); let width = 0; let height = 0; let particles = []; let last = performance.now(); function resize() { const dpr = Math.min(window.devicePixelRatio || 1, 2); width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); particles = createField(Math.random, { width, height }); } function paint(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; particles = stepField(particles, dt, { width, height }); ctx.clearRect(0, 0, width, height); for (const particle of particles) { ctx.fillStyle = particle.color; ctx.shadowColor = particle.color; ctx.shadowBlur = 10; ctx.globalAlpha = particle.alpha * 0.32; ctx.fillRect(particle.x - particle.r * .22, particle.y - particle.r * 7, particle.r * .44, particle.r * 7); ctx.beginPath(); ctx.globalAlpha = particle.alpha; ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; requestAnimationFrame(paint); } resize(); window.addEventListener("resize", resize); requestAnimationFrame(paint); }

renderSources(); render(); syncAudioButton(); startParticles(); requestAnimationFrame(tick);
