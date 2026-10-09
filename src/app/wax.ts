// Motifs géométriques inspirés du wax, générés en SVG pour rester légers (aucune image à télécharger).

const enc = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export function waxTile(stroke: string) {
  return enc(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="${stroke}" stroke-width="2">` +
      `<circle cx="30" cy="30" r="20"/><circle cx="30" cy="30" r="12"/><circle cx="30" cy="30" r="4"/>` +
      `<circle cx="90" cy="90" r="20"/><circle cx="90" cy="90" r="12"/><circle cx="90" cy="90" r="4"/>` +
      `<path d="M90 10 110 30 90 50 70 30Z"/><path d="M30 70 50 90 30 110 10 90Z"/>` +
      `<path d="M0 60h12M108 60h12M60 0v12M60 108v12"/></svg>`
  );
}

export const WAX_HERO = enc(
  `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90" fill="none" stroke="#fff" stroke-width="3">` +
    `<circle cx="22" cy="22" r="14"/><circle cx="22" cy="22" r="6"/>` +
    `<path d="M68 8 82 22 68 36 54 22Z"/><path d="M22 54 36 68 22 82 8 68Z"/>` +
    `<circle cx="68" cy="68" r="14"/><circle cx="68" cy="68" r="6"/></svg>`
);
