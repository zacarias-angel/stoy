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
    'flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-[45%_55%_52%_48%] border-[3px] border-stone-800 bg-[#fffaf0] text-lg font-semibold text-brand-800 shadow-[3px_4px_0_rgba(41,37,36,0.45)] transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';
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
