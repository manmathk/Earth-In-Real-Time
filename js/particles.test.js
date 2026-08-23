import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PARTICLE_COLORS,
  particleCountForWidth,
  createParticle,
  stepParticle
} from "./particles.js";

function seq(values) {
  let index = 0;
  return () => values[index++] ?? 0.5;
}

describe("particle field", () => {
  it("uses fewer particles on narrow screens", () => {
    assert.equal(particleCountForWidth(375), 28);
    assert.equal(particleCountForWidth(700), 42);
    assert.equal(particleCountForWidth(1280), 64);
  });

  it("spawns particles from the top when asked", () => {
    const particle = createParticle(seq([0.25, 0.5, 0.5, 0.5, 0.5, 0.5]), {
      width: 400,
      height: 800
    }, { fromTop: true });

    assert.equal(particle.x, 100);
    assert.ok(particle.y < 0);
    assert.ok(particle.vy > 0);
    assert.ok(PARTICLE_COLORS.includes(particle.color));
  });

  it("moves each particle downward over time", () => {
    const start = {
      x: 100,
      y: 10,
      vx: 0,
      vy: 40,
      r: 1,
      alpha: 0.4,
      color: "#f59e0b"
    };

    const next = stepParticle(start, 0.5, { width: 400, height: 800 }, () => 0);

    assert.equal(next.x, 100);
    assert.equal(next.y, 30);
  });

  it("recycles a particle to the top after it leaves the bottom", () => {
    const falling = {
      x: 50,
      y: 798,
      vx: 0,
      vy: 40,
      r: 1,
      alpha: 0.4,
      color: "#f59e0b"
    };

    const next = stepParticle(falling, 1, { width: 400, height: 800 }, seq([0.1, 0, 0, 0, 0, 0]));

    assert.ok(next.y < 0);
    assert.equal(next.x, 40);
  });
});
