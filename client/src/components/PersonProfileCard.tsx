import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../lib/api';
import type { ProfileReview, ProfileReviewsResponse, PublicProfile } from '../lib/types';
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
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setReviewsLoading(true);
    apiFetch<ProfileReviewsResponse>(`/api/profiles/${profile.userId}/reviews`)
      .then((data) => {
        if (!active) return;
        setReviews(data.reviews);
        if (data.viewerReview) {
          setRating(data.viewerReview.rating);
          setComment(data.viewerReview.comment ?? '');
        } else {
          setRating(5);
          setComment('');
        }
      })
      .catch(() => {
        if (active) setReviewError('No se pudieron cargar las resenas');
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });
    return () => { active = false; };
  }, [profile.userId]);

  const ratingAverage = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : profile.ratingAverage;
  const ratingCount = reviews.length || profile.ratingCount;

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewSaving(true);
    setReviewError(null);
    try {
      const saved = await apiFetch<ProfileReview>(`/api/profiles/${profile.userId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      setReviews((current) => [saved, ...current.filter((review) => review.reviewer.userId !== saved.reviewer.userId)]);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'No se pudo guardar la resena');
    } finally {
      setReviewSaving(false);
    }
  }

  return (
    <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
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

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        <span className="font-semibold">{ratingAverage === null ? 'Sin puntuacion todavia' : `${ratingAverage.toFixed(1)} de 5`}</span>
        <span className="ml-2 text-amber-800">{ratingCount === 1 ? '1 resena' : `${ratingCount} resenas`}</span>
      </div>

      {profile.bio && <p className="text-sm text-stone-600">{profile.bio}</p>}

      {profile.skills.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <span key={skill.id} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
              {skill.name}
            </span>
          ))}
        </div>
      )}

      <Button fullWidth onClick={onTalk}>
        Hablar
      </Button>

      <section className="border-t border-stone-200 pt-4">
        <h2 className="text-base font-semibold text-stone-900">Resenas de la comunidad</h2>
        {reviewsLoading ? <p className="mt-2 text-sm text-stone-500">Cargando resenas...</p> : reviews.length === 0 ? <p className="mt-2 text-sm text-stone-500">Todavia no tiene resenas.</p> : (
          <div className="mt-3 space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl bg-stone-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-2"><strong className="text-stone-800">{review.reviewer.name}</strong><span className="font-semibold text-amber-700">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div>
                {review.comment && <p className="mt-1 text-stone-600">{review.comment}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={submitReview} className="border-t border-stone-200 pt-4">
        <h2 className="text-base font-semibold text-stone-900">Deja tu resena</h2>
        <div className="mt-2 flex gap-1" aria-label="Puntuacion">
          {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} estrellas`} className={`text-2xl leading-none ${value <= rating ? 'text-amber-500' : 'text-stone-300'}`}>★</button>)}
        </div>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} rows={2} placeholder="Conta como fue trabajar con esta persona" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600" />
        {reviewError && <p role="alert" className="mt-2 text-sm text-red-700">{reviewError}</p>}
        <Button type="submit" className="mt-2" disabled={reviewSaving}>{reviewSaving ? 'Guardando...' : 'Publicar resena'}</Button>
      </form>
    </div>
  );
}
