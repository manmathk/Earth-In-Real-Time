export const PARTICLE_COLORS = ["#f59e0b", "#d97706", "#fbbf24", "#a5b4fc", "#ffffff"];

export function particleCountForWidth(width) {
  if (width < 480) {
    return 28;
  }

  if (width < 900) {
    return 42;
  }

  return 64;
}

export function createParticle(random, bounds, options = {}) {
  return {
    x: random() * bounds.width,
    y: options.fromTop ? -4 - random() * 40 : random() * bounds.height,
    vx: (random() - 0.5) * 16,
    vy: 22 + random() * 48,
    r: 0.9 + random() * 2.2,
    alpha: 0.28 + random() * 0.5,
    color: PARTICLE_COLORS[Math.floor(random() * PARTICLE_COLORS.length)]
  };
}

export function stepParticle(particle, dt, bounds, random = Math.random) {
  const next = {
    ...particle,
    x: particle.x + particle.vx * dt,
    y: particle.y + particle.vy * dt
  };

  if (next.x < -8) {
    next.x = bounds.width + 8;
  } else if (next.x > bounds.width + 8) {
    next.x = -8;
  }

  if (next.y > bounds.height + 12) {
    return createParticle(random, bounds, { fromTop: true });
  }

  return next;
}

export function createField(random, bounds, count = particleCountForWidth(bounds.width)) {
  return Array.from({ length: count }, () => createParticle(random, bounds));
}

export function stepField(particles, dt, bounds, random = Math.random) {
  return particles.map((particle) => stepParticle(particle, dt, bounds, random));
}
