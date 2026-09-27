import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquare, PenLine, Trash2, X } from 'lucide-react';
import { reviewApi, type Review, type ReviewSummary } from '@/api/reviews';
import { useAuthStore } from '@/features/auth/authStore';
import { StarInput, StarRating } from '@/components/StarRating';
import { toast } from '@/lib/toastStore';
import { cn } from '@/lib/utils';

export function ProductReviews({ productId }: { productId: string }) {
  const { user, token } = useAuthStore();
  const qc = useQueryClient();
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.list(productId),
  });

  const myReview = user && data ? data.reviews.find((r) => r.userId === user.id) : null;
  const canReview = !!token && !myReview;

  const submit = useMutation({
    mutationFn: () =>
      reviewApi.create(productId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Review posted', { description: 'Thanks for sharing!' });
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      setWriting(false);
      setRating(0);
      setTitle('');
      setComment('');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not post review';
      toast.error('Review failed', { description: msg });
    },
  });

  const remove = useMutation({
    mutationFn: (reviewId: string) => reviewApi.remove(productId, reviewId),
    onSuccess: () => {
      toast.success('Review removed');
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please pick a rating');
      return;
    }
    submit.mutate();
  };

  return (
    <section className="page-container py-16 md:py-20">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-sky">Reviews</p>
          <div className="mt-2 flex items-baseline gap-3">
            <h2 className="text-2xl font-extrabold md:text-3xl">
              {data && data.totalCount > 0
                ? `${data.averageRating.toFixed(1)} out of 5`
                : 'Be the first to review'}
            </h2>
            {data && data.totalCount > 0 && (
              <span className="text-sm text-ink-soft">
                {data.totalCount} {data.totalCount === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>
          {data && data.totalCount > 0 && (
            <StarRating value={data.averageRating} size="lg" className="mt-2" />
          )}
        </div>

        {token && canReview && !writing && (
          <button onClick={() => setWriting(true)} className="btn-glow">
            <PenLine className="h-4 w-4" />
            Write a review
          </button>
        )}

        {!token && (
          <Link to="/login" className="btn-secondary">
            <PenLine className="h-4 w-4" />
            Sign in to review
          </Link>
        )}

        {myReview && !writing && (
          <div className="rounded-2xl border border-mint/30 bg-mint-tint px-4 py-2.5 text-xs font-medium text-mint-dark">
            You've already reviewed this product
          </div>
        )}
      </div>

      {writing && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-4xl border border-line bg-paper p-6 shadow-soft md:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-ink">Your review</h3>
            <button
              type="button"
              onClick={() => setWriting(false)}
              className="rounded-full p-2 text-ink-mute transition-colors hover:bg-slate-tint hover:text-ink"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Your rating *
              </label>
              <StarInput value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Title (optional)
              </label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum it up in a sentence"
                maxLength={120}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Your review
              </label>
              <textarea
                className="input min-h-[120px] rounded-3xl py-3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think? How did it feel, smell, hold up?"
                maxLength={2000}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submit.isPending}
              className="btn-glow-lg"
            >
              {submit.isPending ? 'Posting…' : 'Post review'}
            </button>
            <button
              type="button"
              onClick={() => setWriting(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-tint" />
          ))}
        </div>
      )}

      {data && data.reviews.length === 0 && !writing && (
        <div className="rounded-3xl border border-line bg-slate-tint p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-ink-mute" />
          <p className="mt-4 text-sm font-medium text-ink-soft">
            No reviews yet.
          </p>
          <p className="mt-1 text-xs text-ink-mute">
            Be the first to share your thoughts.
          </p>
        </div>
      )}

      {data && data.reviews.length > 0 && (
        <div className="space-y-4">
          {data.reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              canDelete={user?.id === r.userId}
              onDelete={() => {
                if (confirm('Delete your review?')) remove.mutate(r.id);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewCard({
  review,
  canDelete,
  onDelete,
}: {
  review: Review;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-tint to-mint-tint text-sm font-bold text-sky">
            {review.userName[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{review.userName}</p>
            <div className="mt-1 flex items-center gap-3">
              <StarRating value={review.rating} size="sm" />
              <span className="text-xs text-ink-mute">
                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={onDelete}
            className="rounded-full p-2 text-ink-mute transition-colors hover:bg-clay-tint hover:text-clay"
            aria-label="Delete review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {review.title && (
        <h4 className="mt-4 font-semibold text-ink">{review.title}</h4>
      )}
      {review.comment && (
        <p className={cn('text-sm leading-relaxed text-ink-soft', !review.title && 'mt-4')}>
          {review.comment}
        </p>
      )}
    </div>
  );
}
