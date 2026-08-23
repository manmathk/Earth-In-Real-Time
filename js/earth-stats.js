export const SECONDS_PER_YEAR = 365.25 * 24 * 3600;
export const DISPLAY_TIME_ZONE = "UTC";

export function startOfToday(now = Date.now(), timeZone = DISPLAY_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(now));

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day));
}

export function rateFromAnnual(annualCount) {
  return annualCount / SECONDS_PER_YEAR;
}

export function rateFromDaily(dailyCount) {
  return dailyCount / 86_400;
}

const BIRTHS_PER_SECOND = rateFromAnnual(132_000_000);
const DEATHS_PER_SECOND = rateFromAnnual(62_300_000);

export const METRICS = [
  {
    id: "births",
    label: "Births",
    category: "people",
    perSecond: BIRTHS_PER_SECOND,
    sign: "+",
    unit: "count",
    source: "UN World Fertility 2024 / WPP 2024 — 132 million live births",
    sourceUrl: "https://www.un.org/development/desa/pd/data/world-population-prospects-2024"
  },
  {
    id: "deaths",
    label: "Deaths",
    category: "people",
    perSecond: DEATHS_PER_SECOND,
    sign: "+",
    unit: "count",
    source: "UN WPP 2024 implied by ~8.2B people and a 7.6 crude death rate — 62.3 million deaths",
    sourceUrl: "https://population.un.org/wpp/"
  },
  {
    id: "netPeople",
    label: "Net people",
    category: "people",
    perSecond: BIRTHS_PER_SECOND - DEATHS_PER_SECOND,
    sign: "+",
    unit: "count",
    source: "Derived from UN 2024 births minus deaths",
    sourceUrl: "https://population.un.org/wpp/"
  },
  {
    id: "flights",
    label: "Flights",
    category: "travel",
    perSecond: rateFromAnnual(37_400_000),
    sign: "+",
    unit: "count",
    source: "ICAO 2024 — 37.4 million scheduled departures",
    sourceUrl: "https://www.icao.int/about-icao/AnnualReport2024/world-air-transport-2024"
  },
  {
    id: "vehicles",
    label: "Vehicles built",
    category: "travel",
    perSecond: rateFromAnnual(92_504_338),
    sign: "+",
    unit: "count",
    source: "OICA 2024 — 92,504,338 motor vehicles produced",
    sourceUrl: "https://www.oica.net/"
  },
  {
    id: "trees",
    label: "Trees cut",
    category: "planet",
    perSecond: rateFromAnnual(15_000_000_000),
    sign: "−",
    unit: "count",
    source: "Crowther et al. / widely cited harvest estimate — about 15 billion trees cut each year",
    sourceUrl: "https://www.nature.com/articles/nature14967"
  },
  {
    id: "co2",
    label: "CO₂ emitted",
    category: "planet",
    perSecond: rateFromAnnual(41_600_000_000),
    sign: "+",
    unit: "tonnes",
    source: "Global Carbon Project 2024 — 41.6 billion tonnes total CO₂",
    sourceUrl: "https://globalcarbonbudget.org/fossil-fuel-co2-emissions-increase-again-in-2024/"
  },
  {
    id: "plastic",
    label: "Plastic made",
    category: "planet",
    perSecond: rateFromAnnual(400_000_000),
    sign: "+",
    unit: "tonnes",
    source: "OECD / UNEP — about 400 million tonnes of plastic produced each year",
    sourceUrl: "https://www.oecd.org/environment/plastic-pollution/"
  },
  {
    id: "lightning",
    label: "Lightning",
    category: "planet",
    perSecond: 44,
    sign: "+",
    unit: "count",
    source: "NASA — roughly 40–50 lightning flashes every second",
    sourceUrl: "https://www.nasa.gov/centers-and-facilities/marshall/what-causes-lightning-and-thunder/"
  },
  {
    id: "data",
    label: "Internet traffic",
    category: "digital",
    perSecond: rateFromAnnual(4.4e12),
    sign: "+",
    unit: "gb",
    source: "Cisco-era global IP traffic scale — about 4.4 zettabytes a year",
    sourceUrl: "https://www.cisco.com/"
  },
  {
    id: "emails",
    label: "Emails",
    category: "digital",
    perSecond: rateFromDaily(361_000_000_000),
    sign: "+",
    unit: "count",
    source: "Radicati Group 2024 — about 361 billion emails a day",
    sourceUrl: "https://www.radicati.com/"
  },
  {
    id: "photos",
    label: "Photos taken",
    category: "digital",
    perSecond: rateFromDaily(5_300_000_000),
    sign: "+",
    unit: "count",
    source: "Industry photo estimates — about 5.3 billion photos a day",
    sourceUrl: "https://photutorial.com/photos-statistics/"
  }
];

export function getMetric(id) {
  return METRICS.find((metric) => metric.id === id);
}

export function filterMetrics(category = "all") {
  if (category === "all") {
    return METRICS.slice();
  }

  return METRICS.filter((metric) => metric.category === category);
}

export function accumulate(metric, elapsedSeconds) {
  return Math.max(0, elapsedSeconds) * metric.perSecond;
}

export function shiftUtcDate(dateMs, days) {
  return startOfToday(dateMs).getTime() + days * 86_400_000;
}

export function canSelectNextDate(selectedMs, nowMs = Date.now()) {
  return startOfToday(selectedMs).getTime() < startOfToday(nowMs).getTime();
}

export function elapsedForDate(dateMs, nowMs = Date.now()) {
  const start = startOfToday(dateMs).getTime();
  const end = start + 86_400_000;

  if (nowMs <= start) {
    return 0;
  }

  if (nowMs >= end) {
    return 86_400;
  }

  return (nowMs - start) / 1000;
}

export function getElapsedSeconds(mode, nowMs, sessionStartMs, selectedDateMs = nowMs) {
  if (mode === "session") {
    return Math.max(0, (nowMs - sessionStartMs) / 1000);
  }

  return elapsedForDate(mode === "date" ? selectedDateMs : nowMs, nowMs);
}

export function formatElapsed(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  if (seconds === 86_400) {
    return "24:00:00";
  }

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const clock = [hours, minutes, remainder].map((part) => String(part).padStart(2, "0")).join(":");

  return days > 0 ? `${days}d ${clock}` : clock;
}

export function formatStartDate(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: DISPLAY_TIME_ZONE
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = (parts.find((part) => part.type === "month")?.value ?? "").toUpperCase();
  const year = parts.find((part) => part.type === "year")?.value ?? "";

  return `${day} ${month} ${year}`;
}

function trimDecimals(value) {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function formatMagnitude(value, sign = "+") {
  const abs = Math.abs(value);
  const prefix = sign === "−" || sign === "-" ? "−" : "+";

  if (abs >= 1e12) return `${prefix}${trimDecimals(abs / 1e12)}T`;
  if (abs >= 1e9) return `${prefix}${trimDecimals(abs / 1e9)}B`;
  if (abs >= 1e6) return `${prefix}${trimDecimals(abs / 1e6)}M`;

  return `${prefix}${Math.floor(abs).toLocaleString("en-US")}`;
}

function formatDataVolume(gigabytes, sign = "+") {
  const abs = Math.abs(gigabytes);
  const prefix = sign === "−" || sign === "-" ? "−" : "+";
  const steps = [
    { size: 1e9, label: "EB" },
    { size: 1e6, label: "PB" },
    { size: 1e3, label: "TB" },
    { size: 1, label: "GB" }
  ];
  const step = steps.find((item) => abs >= item.size) ?? steps[3];

  return `${prefix}${trimDecimals(abs / step.size)} ${step.label}`;
}

export function formatStatValue(value, unit = "count", sign = "+") {
  if (unit === "gb") {
    return formatDataVolume(value, sign);
  }

  if (unit === "tonnes") {
    return `${formatMagnitude(value, sign)} t`;
  }

  return formatMagnitude(value, sign);
}

export function formatRateLabel(metric) {
  const rate = metric.perSecond;

  if (metric.unit === "gb") {
    return `${Math.round(rate).toLocaleString("en-US")} GB/s`;
  }

  if (metric.unit === "tonnes") {
    return `${rate >= 100 ? Math.round(rate).toLocaleString("en-US") : trimDecimals(rate)} t/s`;
  }

  if (rate >= 1000) {
    return `${formatMagnitude(rate, "").replace(/^[+\-−]/, "")} / sec`;
  }

  if (Number.isInteger(rate)) {
    return `${rate} / sec`;
  }

  return `${rate.toFixed(2)} / sec`;
}

export function snapshotMetrics(elapsedSeconds, category = "all") {
  return filterMetrics(category).map((metric) => {
    const value = accumulate(metric, elapsedSeconds);

    return {
      ...metric,
      value,
      display: formatStatValue(value, metric.unit, metric.sign),
      rateLabel: formatRateLabel(metric)
    };
  });
}

export function buildShareText(elapsedSeconds, nowMs = Date.now(), selectedDateMs = nowMs) {
  const cards = snapshotMetrics(elapsedSeconds, "all");

  return [
    `Earth In Real Time — ${formatElapsed(elapsedSeconds)} on ${formatStartDate(startOfToday(selectedDateMs))}`,
    ...cards.map((card) => `${card.label}: ${card.display}`)
  ].join("\n");
}
