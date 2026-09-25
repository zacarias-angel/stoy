import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { apiFetch } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Profile, Skill, UpdateProfileInput } from '../lib/types';

export function ProfilePage() {
  const { profile, logout, refreshProfile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <ProfileForm profile={profile} onLogout={logout} onSaved={refreshProfile} />
  );
}

interface ProfileFormProps {
  profile: Profile;
  onLogout: () => void;
  onSaved: () => Promise<void>;
}

function ProfileForm({ profile, onLogout, onSaved }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [isVisible, setIsVisible] = useState(profile.isVisible);
  const [primarySkillId, setPrimarySkillId] = useState<number | null>(
    profile.skills.find((skill) => skill.isPrimary)?.id ?? profile.skills[0]?.id ?? null
  );
  const [skills, setSkills] = useState<Skill[]>([]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ skills: Skill[] }>('/api/skills')
      .then((data) => {
        if (active) setSkills(data.skills);
      })
      .catch(() => {
        if (active) setSkills([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const primarySkillName = useMemo(
    () => profile.skills.find((skill) => skill.isPrimary)?.name ?? null,
    [profile.skills]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setError(null);

    const payload: UpdateProfileInput = {
      name: name.trim(),
      headline: headline.trim() ? headline.trim() : null,
      bio: bio.trim() ? bio.trim() : null,
      isVisible,
      primarySkillId,
    };

    try {
      await apiFetch<Profile>('/api/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await onSaved();
      setStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
      setStatus('idle');
    }
  }

  return (
    <section className="space-y-6 px-4 py-5">
      <div className="flex items-center gap-4">
        <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-stone-900">{profile.name}</h1>
          <p className="truncate text-sm text-stone-500">
            {primarySkillName ?? headline ?? 'Sin oficio definido'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Nombre"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="Oficio / habilidad principal"
          name="headline"
          maxLength={120}
          placeholder="Ej: Modista"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
        />

        <div className="space-y-1.5">
          <label htmlFor="primarySkill" className="block text-sm font-medium text-stone-700">
            Categoria (opcional)
          </label>
          <select
            id="primarySkill"
            name="primarySkill"
            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            value={primarySkillId ?? ''}
            onChange={(event) =>
              setPrimarySkillId(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">Sin categoria</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        <TextArea
          label="Descripcion corta"
          name="bio"
          rows={3}
          maxLength={500}
          placeholder="Ej: Restauro sillones y sillas antiguas."
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />

        <label className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-3.5 py-3">
          <span className="text-sm text-stone-700">Mostrarme en el mapa</span>
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
            checked={isVisible}
            onChange={(event) => setIsVisible(event.target.checked)}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          {status === 'saved' && <span className="text-sm text-brand-700">Guardado</span>}
        </div>
      </form>

      <div className="border-t border-stone-200 pt-5">
        <Button variant="ghost" onClick={onLogout}>
          Cerrar sesion
        </Button>
      </div>
    </section>
  );
}
