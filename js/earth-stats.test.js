import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SECONDS_PER_YEAR,
  rateFromAnnual,
  rateFromDaily,
  formatElapsed,
  formatStartDate,
  formatStatValue,
  accumulate,
  getElapsedSeconds,
  startOfToday,
  elapsedForDate,
  shiftUtcDate,
  canSelectNextDate,
  filterMetrics,
  snapshotMetrics,
  buildShareText,
  formatRateLabel,
  METRICS,
  getMetric
} from "./earth-stats.js";
import { ICONS, BRAND_MARK } from "./icons.js";

describe("rate helpers", () => {
  it("converts an annual count into a per-second rate", () => {
    assert.equal(rateFromAnnual(SECONDS_PER_YEAR), 1);
    assert.equal(rateFromAnnual(132_000_000), 132_000_000 / SECONDS_PER_YEAR);
  });

  it("converts a daily count into a per-second rate", () => {
    assert.equal(rateFromDaily(86_400), 1);
    assert.equal(rateFromDaily(361_000_000_000), 361_000_000_000 / 86_400);
  });
});

describe("sourced Earth rates", () => {
  it("uses UN 2024 birth and death totals", () => {
    const births = getMetric("births");
    const deaths = getMetric("deaths");
    const net = getMetric("netPeople");

    assert.ok(Math.abs(births.perSecond - 4.183) < 0.01);
    assert.ok(Math.abs(deaths.perSecond - 1.974) < 0.02);
    assert.ok(net.perSecond > 2 && net.perSecond < 2.3);
    assert.equal(births.source.includes("UN"), true);
  });

  it("uses ICAO 2024 flight departures and OICA 2024 vehicles", () => {
    assert.ok(Math.abs(getMetric("flights").perSecond - 1.185) < 0.02);
    assert.ok(Math.abs(getMetric("vehicles").perSecond - 2.931) < 0.02);
  });

  it("does not keep the old placeholder rates", () => {
    assert.notEqual(getMetric("births").perSecond, 4.5);
    assert.notEqual(getMetric("deaths").perSecond, 1.8);
    assert.notEqual(getMetric("trees").perSecond, 0.8);
    assert.notEqual(getMetric("data").perSecond, 125);
  });
});

describe("elapsed time", () => {
  it("formats hours, minutes, and seconds", () => {
    assert.equal(formatElapsed(0), "00:00:00");
    assert.equal(formatElapsed(3661), "01:01:01");
  });

  it("includes days once a day has passed", () => {
    assert.equal(formatElapsed(86_400), "24:00:00");
    assert.equal(formatElapsed(90_061), "1d 01:01:01");
    assert.equal(formatElapsed(176_400), "2d 01:00:00");
  });

  it("never returns a negative duration", () => {
    assert.equal(formatElapsed(-12), "00:00:00");
  });

  it("uses UTC midnight today as the stream start, not a local or fixed date", () => {
    const noonUtc = Date.parse("2026-08-23T12:00:00Z");
    const start = startOfToday(noonUtc);

    assert.equal(formatStartDate(start), "23 AUG 2026");
    assert.equal(start.getTime(), Date.parse("2026-08-23T00:00:00Z"));
    assert.notEqual(formatStartDate(start), "21 AUG 2026");
  });

  it("keeps the UTC date before UTC midnight even after India midnight", () => {
    const afterIndiaMidnight = Date.parse("2026-08-24T00:01:00+05:30");
    assert.equal(formatStartDate(startOfToday(afterIndiaMidnight)), "23 AUG 2026");
  });

  it("rolls the displayed date forward at UTC midnight", () => {
    const beforeMidnight = Date.parse("2026-08-23T23:59:00Z");
    const afterMidnight = Date.parse("2026-08-24T00:01:00Z");

    assert.equal(formatStartDate(startOfToday(beforeMidnight)), "23 AUG 2026");
    assert.equal(formatStartDate(startOfToday(afterMidnight)), "24 AUG 2026");
  });

  it("computes stream elapsed from UTC midnight and session elapsed from page open", () => {
    const now = Date.parse("2026-08-23T12:00:00Z");
    const sessionStart = Date.parse("2026-08-23T11:59:00Z");

    assert.equal(getElapsedSeconds("stream", now, sessionStart), 12 * 3600);
    assert.equal(getElapsedSeconds("session", now, sessionStart), 60);
    assert.equal(getElapsedSeconds("stream", Date.parse("2026-08-23T00:00:00Z"), sessionStart), 0);
  });

  it("counts a past UTC date as a full day and today only up to now", () => {
    const now = Date.parse("2026-08-23T12:00:00Z");
    const yesterday = Date.parse("2026-08-22T08:00:00Z");
    const tomorrow = Date.parse("2026-08-24T00:00:00Z");

    assert.equal(elapsedForDate(yesterday, now), 86_400);
    assert.equal(elapsedForDate(now, now), 12 * 3600);
    assert.equal(elapsedForDate(tomorrow, now), 0);
  });

  it("steps the selected UTC date one day at a time and stops at today", () => {
    const now = Date.parse("2026-08-23T12:00:00Z");
    const today = startOfToday(now).getTime();
    const yesterday = shiftUtcDate(today, -1);

    assert.equal(formatStartDate(new Date(yesterday)), "22 AUG 2026");
    assert.equal(shiftUtcDate(yesterday, 1), today);
    assert.equal(canSelectNextDate(yesterday, now), true);
    assert.equal(canSelectNextDate(today, now), false);
  });

  it("uses the selected date when counting in date mode", () => {
    const now = Date.parse("2026-08-23T12:00:00Z");
    const yesterday = Date.parse("2026-08-22T00:00:00Z");

    assert.equal(getElapsedSeconds("date", now, now, yesterday), 86_400);
    assert.equal(getElapsedSeconds("date", now, now, now), 12 * 3600);
  });
});

describe("formatting", () => {
  it("formats the stream start date in a compact uppercase style", () => {
    assert.equal(formatStartDate(new Date("2026-08-21T00:00:00Z")), "21 AUG 2026");
  });

  it("keeps modest counts readable and compact-formats huge totals", () => {
    assert.equal(formatStatValue(722_304, "count"), "+722,304");
    assert.match(formatStatValue(1_250_000, "count"), /^\+1\.25M$/);
    assert.match(formatStatValue(41.6e9, "tonnes"), /t$/);
    assert.match(formatStatValue(1_394_180, "gb"), /(TB|PB|EB|GB)$/);
  });

  it("marks losses with a minus sign", () => {
    assert.equal(formatStatValue(480, "count", "−"), "−480");
  });
});

describe("accumulation and filters", () => {
  it("accumulates a metric from a shared elapsed clock", () => {
    const births = getMetric("births");
    assert.equal(accumulate(births, 10), births.perSecond * 10);
  });

  it("filters metrics by category and keeps all when asked", () => {
    const people = filterMetrics("people");
    assert.ok(people.every((metric) => metric.category === "people"));
    assert.equal(filterMetrics("all").length, METRICS.length);
  });

  it("builds a snapshot the UI can render", () => {
    const cards = snapshotMetrics(3_600, "planet");
    assert.ok(cards.length > 0);
    assert.ok(cards.every((card) => card.category === "planet"));
    assert.ok(cards[0].display);
    assert.ok(cards[0].rateLabel);
  });

  it("formats whole-number rates without extra decimals", () => {
    assert.equal(formatRateLabel(getMetric("lightning")), "44 / sec");
  });

  it("builds a shareable snapshot from the same clock", () => {
    const now = Date.parse("2026-08-23T12:00:00Z");
    const text = buildShareText(3_600, now);
    assert.match(text, /^Earth In Real Time — /);
    assert.match(text, /23 AUG 2026/);
    assert.doesNotMatch(text, /21 AUG 2026/);
    assert.match(text, /Births: \+/);
    assert.match(text, /Trees cut: −/);
  });

  it("shares counts against the selected UTC date", () => {
    const now = Date.parse("2026-08-23T12:00:00Z");
    const yesterday = Date.parse("2026-08-22T00:00:00Z");
    const text = buildShareText(86_400, now, yesterday);

    assert.match(text, /24:00:00 on 22 AUG 2026/);
    assert.doesNotMatch(text, /23 AUG 2026/);
  });
});

describe("marks", () => {
  it("gives every metric a custom SVG mark", () => {
    for (const metric of METRICS) {
      assert.match(ICONS[metric.id] ?? "", /<svg[\s\S]+<\/svg>/, metric.id);
    }
  });

  it("includes a brand mark instead of plain text-only identity", () => {
    assert.match(BRAND_MARK, /<svg/);
    assert.match(BRAND_MARK, /earth-mark|brand-mark/);
  });
});
