function svg(body, extraClass = "") {
  return `<svg class="${extraClass}" viewBox="0 0 32 32" fill="none" aria-hidden="true">${body}</svg>`;
}

function badge(glyph) {
  return svg(`<circle class="soft" cx="16" cy="16" r="15"/>${glyph}`);
}

export const BRAND_MARK = `
<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
  <defs>
    <linearGradient id="earth-core" x1="12" y1="8" x2="36" y2="40">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="earth-land" x1="14" y1="10" x2="34" y2="36">
      <stop offset="0" stop-color="#fbbf24"/>
      <stop offset="1" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <g class="brand-orbit">
    <ellipse cx="24" cy="24" rx="22" ry="8" transform="rotate(-28 24 24)" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
  </g>
  <circle cx="24" cy="24" r="14" fill="url(#earth-core)"/>
  <path fill="url(#earth-land)" d="M13.2 17.2c2.4-3.4 6.8-4.6 9.4-2.1 1.6 1.6.8 3.6-1.1 4.6-2.6 1.4-6.2 1.2-8.3-2.5Zm10.1-2.4c3.2-1.4 7.6-.2 8.8 2.8 1 2.4-1.2 4.2-3.4 4.1-2.6-.1-5.4-1.6-6.2-4.2-.4-1.2.1-2.2.8-2.7ZM14.6 23.4c3.2.2 5.8 2.4 6.4 5 .8 3.4-1.6 5.4-4.4 4.6-3.2-.8-5.6-3.4-4.6-6.4.3-1 .4-1.8.6-3.2Zm9.8 1.2c3.4 1.2 7 .8 8.2 3.4.8 2-1.4 3.8-3.8 3.8-3.2 0-6.2-2.2-4.4-7.2Z"/>
  <ellipse cx="24" cy="24" rx="14" ry="5.4" stroke="#93c5fd" stroke-width=".8" opacity=".4"/>
  <path d="M24 10v28" stroke="#93c5fd" stroke-width=".7" opacity=".28"/>
  <circle class="brand-sat" cx="41.4" cy="13.2" r="2.1"/>
</svg>
`.trim();

export const ICONS = {
  births: badge(`
    <path class="ink" d="M16 7.2c.6 0 1.1.5 1.1 1.2 0 1.4-1.1 2.2-1.1 3.4 0-1.2-1.1-2-1.1-3.4 0-.7.5-1.2 1.1-1.2Z"/>
    <path class="accent" d="M11.4 13.2c1.8-1.4 3.4-.4 4.6 1.2 1.2-1.6 2.8-2.6 4.6-1.2 1.6 1.2.8 3.6-1.2 4.8-1.8 1-3.4 1.2-3.4 1.2s-1.6-.2-3.4-1.2c-2-1.2-2.8-3.6-1.2-4.8Z"/>
    <path class="ink" d="M14.2 22.6c.4-2.2 1.2-3.4 1.8-3.8.6.4 1.4 1.6 1.8 3.8.3 1.4-.4 2.8-1.8 2.8s-2.1-1.4-1.8-2.8Z"/>
    <circle class="accent" cx="22.8" cy="9.2" r="1.1"/>
  `),
  deaths: badge(`
    <path class="ink" d="M13.2 14.4h5.6c.7 0 1.2.5 1.2 1.2V24c0 1.2-1 1.8-2 1.8h-4c-1 0-2-.6-2-1.8v-8.4c0-.7.5-1.2 1.2-1.2Z"/>
    <path class="ink" d="M12.6 13.6h6.8c.4 0 .8.3.8.8s-.4.6-.8.6h-6.8c-.4 0-.8-.2-.8-.6s.4-.8.8-.8Z"/>
    <path class="accent" d="M16 6.8c1.6 1.4 2.2 2.8 1.6 4.2-.6 1.2-1.6 1.6-1.6 1.6s-1-.4-1.6-1.6c-.6-1.4 0-2.8 1.6-4.2Z"/>
    <path class="line" d="M18.8 7.6c1.2-.8 2.4-.4 2.8.8"/>
  `),
  netPeople: badge(`
    <circle class="ink" cx="11.4" cy="12.2" r="2.4"/>
    <circle class="ink" cx="18.2" cy="11.4" r="2.6"/>
    <path class="ink" d="M7.6 21.6c.2-3 2.2-4.6 3.8-4.6s3.4 1.4 3.8 3.2"/>
    <path class="ink" d="M13.6 22.2c.4-3.4 2.8-5.2 4.8-5.2 2.4 0 4.8 2 5 5.4 0 .6-.4 1-1 1H14.6c-.6 0-1-.4-1-1Z"/>
    <path class="accent" d="M23.2 8.2 25 10h-1.2v2.4h-1.6V10H21l2.2-1.8Z"/>
  `),
  flights: badge(`
    <path class="ink" d="M7.2 18.4c3.2-1.2 7.4-3.2 10.2-5.2 1.2-.8 4.4-3.6 5.4-4.4.8-.6 1.8-.2 1.6.8l-1.2 5.2 3.4.8c.8.2 1.2.8.8 1.4l-2.2 2.2c-.4.4-1 .4-1.4.2l-3.6-1.6-4.2 1.6 1.4 2.2c.3.4 0 .8-.4.8l-3.2.2-2.2-3.6-4.2 1.2c-.6.2-1.2-.4-1-1l.8-2.8Z"/>
    <path class="accent" d="M6.4 21.6c1.6.2 3.2 0 4.6-.6"/>
  `),
  vehicles: badge(`
    <path class="ink" d="M8.2 15.2 10 11c.4-.8 1.2-1.4 2.2-1.4h8.2c.8 0 1.6.4 2 1.2l2.2 4.4H8.2Z"/>
    <path class="ink" d="M6.8 16.4h18.4c.8 0 1.4.6 1.4 1.4v3.2c0 .6-.4 1-1 1h-1.2c-.2 1.6-1.4 2.8-3 2.8s-2.8-1.2-3-2.8h-4.8c-.2 1.6-1.4 2.8-3 2.8s-2.8-1.2-3-2.8H6.4c-.6 0-1-.4-1-1v-3.2c0-.8.6-1.4 1.4-1.4Z"/>
    <circle class="soft" cx="11.2" cy="22.2" r="1.5" style="opacity:.35"/>
    <circle class="soft" cx="21.6" cy="22.2" r="1.5" style="opacity:.35"/>
    <path class="accent" d="M21.4 12.2h2.2l1.2 2.6h-3.8l.4-2.6Z"/>
  `),
  trees: badge(`
    <path class="ink" d="M16 6.4c4.6 0 7.6 3.4 7.2 6.8 2.2.6 3.6 2.6 3.2 4.8-.4 2.4-2.6 3.8-5.2 3.8H10.8c-2.6 0-4.8-1.4-5.2-3.8-.4-2.2 1-4.2 3.2-4.8C8.4 9.8 11.4 6.4 16 6.4Z"/>
    <path class="ink" d="M14.4 20.8h3.2V25c0 .6-.4 1-1 1h-1.2c-.6 0-1-.4-1-1v-4.2Z"/>
    <circle class="accent" cx="19.6" cy="12.4" r="1.3"/>
  `),
  co2: badge(`
    <circle class="ink" cx="16" cy="16" r="4.2"/>
    <circle class="accent" cx="7.8" cy="16" r="3.1"/>
    <circle class="accent" cx="24.2" cy="16" r="3.1"/>
    <path class="line" d="M11.6 16h-1.2M21.6 16h-1.2"/>
    <path class="ink" d="M14.8 25.2h2.4c.4 0 .6.3.6.6v.4H14.2v-.4c0-.3.2-.6.6-.6Zm-1.2-1.6h4.8c.3 0 .5.2.5.5s-.2.5-.5.5h-4.8c-.3 0-.5-.2-.5-.5s.2-.5.5-.5Z"/>
  `),
  plastic: badge(`
    <path class="accent" d="M13.4 6.8h5.2c.6 0 1 .4 1 1v1.4h-7.2V7.8c0-.6.4-1 1-1Z"/>
    <path class="ink" d="M11.2 10.2h9.6c.8 0 1.4.6 1.4 1.4l-.8 12.2c0 1.2-1 2.2-2.2 2.2h-6.4c-1.2 0-2.2-1-2.2-2.2l-.8-12.2c0-.8.6-1.4 1.4-1.4Z"/>
    <path class="line" d="M14 14.4h4M14 18h4"/>
  `),
  lightning: badge(`
    <path class="ink" d="M10.4 13.2c.2-3.2 2.6-5.6 5.6-5.6 2.4 0 4.4 1.4 5.2 3.4 1.8.2 3.2 1.8 3.2 3.8 0 2-1.6 3.6-3.6 3.8"/>
    <path class="ink" d="M8.4 15.6c0-1.8 1.4-3.2 3.2-3.4"/>
    <path class="accent" d="m17.6 13.2-6.4 7.2h4.2l-1.2 6.4 7-7.6h-4.2l.6-6Z"/>
  `),
  data: badge(`
    <ellipse class="ink" cx="16" cy="9.4" rx="8.2" ry="3.2"/>
    <path class="ink" d="M7.8 9.4v5.2c0 1.8 3.6 3.2 8.2 3.2s8.2-1.4 8.2-3.2V9.4"/>
    <path class="ink" d="M7.8 16.4v5.2c0 1.8 3.6 3.2 8.2 3.2s8.2-1.4 8.2-3.2v-5.2"/>
    <circle class="accent" cx="22.8" cy="11.2" r="1.4"/>
  `),
  emails: badge(`
    <path class="ink" d="M6.8 10.4h18.4c.8 0 1.4.6 1.4 1.4v10.4c0 .8-.6 1.4-1.4 1.4H6.8c-.8 0-1.4-.6-1.4-1.4V11.8c0-.8.6-1.4 1.4-1.4Z"/>
    <path class="accent" d="M7.2 11.2 16 17.2l8.8-6"/>
    <path class="line" d="m7.4 22.2 5.2-4.4M24.6 22.2 19.4 17.8"/>
  `),
  photos: badge(`
    <path class="ink" d="M8.2 10.6h3l1.2-1.8c.3-.4.8-.6 1.2-.6h5c.4 0 .9.2 1.2.6l1.2 1.8h3c1.2 0 2.2 1 2.2 2.2v10c0 1.2-1 2.2-2.2 2.2H8.2c-1.2 0-2.2-1-2.2-2.2v-10c0-1.2 1-2.2 2.2-2.2Z"/>
    <circle class="soft" cx="16" cy="18" r="4.2" style="opacity:.25"/>
    <circle class="accent" cx="16" cy="18" r="2.2"/>
    <circle class="accent" cx="22.6" cy="13.2" r="1"/>
  `),
  play: svg(`<path class="ink" d="M11 8.4c0-.8.8-1.2 1.4-.8l11 7.6c.6.4.6 1.2 0 1.6l-11 7.6c-.6.4-1.4 0-1.4-.8V8.4Z"/>`),
  pause: svg(`<path class="ink" d="M10 8.2h3.4c.6 0 1 .4 1 1v13.6c0 .6-.4 1-1 1H10c-.6 0-1-.4-1-1V9.2c0-.6.4-1 1-1Zm8.6 0H22c.6 0 1 .4 1 1v13.6c0 .6-.4 1-1 1h-3.4c-.6 0-1-.4-1-1V9.2c0-.6.4-1 1-1Z"/>`)
};
