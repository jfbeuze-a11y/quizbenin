const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3m10-4h3v1a3 3 0 0 1-3 3M12 14v3m-4 4h8m-6-4h4v4h-4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.4a7.5 7.5 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7.5 7.5 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z',
  play: 'M8 5v14l11-7z',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  flame: 'M12 22c4 0 7-2.8 7-7 0-3.5-2.5-6-4-8-.5 2-1.5 3-3 3 0-3-1-6-4-8 0 4-5 7-5 13 0 4.2 3 7 9 7z',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-14v10m-3-7.5c0-1 1.3-1.5 3-1.5s3 .7 3 2-1.3 1.6-3 2-3 .8-3 2 1.3 2 3 2 3-.5 3-1.5',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 12.5 9.5 18 20 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  volume: 'M4 9v6h4l5 4V5L8 9zm12.5-1.5a6 6 0 0 1 0 9M15 10a2.5 2.5 0 0 1 0 4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4l3 2',
  half: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-18v18',
  skip: 'M5 5v14l9-7zm11 0v14',
  lock: 'M6 11h12v10H6zm2 0V8a4 4 0 0 1 8 0v3',
  star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z',
  chevron: 'M9 5l7 7-7 7',
  back: 'M15 5l-7 7 7 7',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  download: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
  trash: 'M4 7h16M10 7V4h4v3m-8 0 1 13h10l1-13',
  swords: 'M14.5 17.5 21 11V3h-8l-6.5 6.5M13 19l-8-8m0 8 4-4M3 21l2-2',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm0 0v16M8 7h7',
  zap: 'M13 2 4 14h7l-1 8 9-12h-7z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-11v6m0-9v.01',
  video: 'M3 6h12v12H3zm12 4 6-3v10l-6-3z',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.01',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  share: 'M12 3v12m-4-8 4-4 4 4M5 13v7h14v-7',
};

export function Icon({ name, title, className }: { name: keyof typeof PATHS | string; title?: string; className?: string }) {
  const filled = name === 'play' || name === 'star' || name === 'bolt' || name === 'zap' || name === 'flame';
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.25em"
      height="1.25em"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}
