export const navigation = [
  { label: 'Accueil', href: '/' },
  { label: 'Le Gouvernement', href: '/gouvernement/' },
  { label: 'Nos missions', href: '/missions/' },
  { label: 'Actualités', href: '/actualites/' },
  { label: 'Communiqués', href: '/communiques/' },
] as const;

export function isCurrentPath(currentPath: string, href: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath.startsWith(href);
}
