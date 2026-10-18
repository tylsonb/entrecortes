const paths = {
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  bag: 'M5 7h14l1 14H4L5 7ZM8 7V5a4 4 0 0 1 8 0v2',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  needle: 'M5 20 16 3c2-3 5-1 3 2L5 20Zm10-13 3-4M5 20c4 3 11 0 11-4',
  scissors: 'm8 8 12 12M8 16 20 4M8 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
}

export default function Icon({ name, className = 'size-5' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
