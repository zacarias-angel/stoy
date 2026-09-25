import type { PublicProfile } from '../lib/types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { DistanceBadge } from './DistanceBadge';

interface PersonProfileCardProps {
  profile: PublicProfile;
  distanceLabel: string;
  onTalk: () => void;
}

export function PersonProfileCard({ profile, distanceLabel, onTalk }: PersonProfileCardProps) {
  const role = profile.primarySkill?.name ?? profile.headline ?? 'Sin oficio definido';

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 pr-8">
        <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-stone-900">{profile.name}</p>
          <p className="truncate text-sm text-stone-500">{role}</p>
          <div className="mt-1.5">
            <DistanceBadge label={distanceLabel} />
          </div>
        </div>
      </div>

      {profile.bio && <p className="text-sm text-stone-600">{profile.bio}</p>}

      <Button fullWidth onClick={onTalk}>
        Hablar
      </Button>
    </div>
  );
}
