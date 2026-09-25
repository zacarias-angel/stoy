import type { NearbyPerson } from '../lib/types';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function createPersonMarkerElement(
  person: NearbyPerson,
  onSelect: (person: NearbyPerson) => void
): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.className =
    'flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white bg-brand-100 text-sm font-semibold text-brand-800 shadow-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';
  element.setAttribute(
    'aria-label',
    `${person.name}, ${person.skill ?? person.headline ?? 'perfil'}, ${person.distanceLabel}`
  );

  if (person.avatarUrl) {
    const image = document.createElement('img');
    image.src = person.avatarUrl;
    image.alt = person.name;
    image.className = 'h-full w-full object-cover';
    element.appendChild(image);
  } else {
    element.textContent = getInitials(person.name) || '?';
  }

  element.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect(person);
  });

  return element;
}
