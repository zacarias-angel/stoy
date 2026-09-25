import type { NearbyPerson } from '../lib/types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { DistanceBadge } from './DistanceBadge';

interface PersonCardProps {
  person: NearbyPerson;
  onViewProfile: () => void;
  onTalk: () => void;
}

export function PersonCard({ person, onViewProfile, onTalk }: PersonCardProps) {
  const role = person.skill ?? person.headline ?? 'Sin oficio definido';
  const description = person.skill ? person.headline : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 pr-8">
        <Avatar name={person.name} src={person.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-stone-900">{person.name}</p>
          <p className="truncate text-sm text-stone-500">{role}</p>
          <div className="mt-1.5">
            <DistanceBadge label={person.distanceLabel} />
          </div>
        </div>
      </div>

      {description && <p className="line-clamp-2 text-sm text-stone-600">{description}</p>}

      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={onViewProfile}>
          Ver perfil
        </Button>
        <Button fullWidth onClick={onTalk}>
          Hablar
        </Button>
      </div>
    </div>
  );
}
