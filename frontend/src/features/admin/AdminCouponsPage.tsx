import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Tag, Trash2, X } from 'lucide-react';
import { adminCouponApi, type Coupon, type CouponType, type CreateCouponInput } from '@/api/orders';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from '@/lib/toastStore';

interface FormState {
  code: string;
  description: string;
  type: CouponType;
  value: string;
  minOrderRupees: string;
  maxUses: string;
  expiresAt: string;
  active: boolean;
}

const empty: FormState = {
  code: '',
  description: '',
  type: 'PERCENT',
  value: '',
  minOrderRupees: '',
  maxUses: '',
  expiresAt: '',
  active: true,
};

function describeValue(c: Coupon) {
  return c.type === 'PERCENT' ? `${c.value}% off` : `${formatPrice(c.value, 'INR')} off`;
}

export function AdminCouponsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: adminCouponApi.list,
  });

  const reset = () => {
    setForm(empty);
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(empty);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description ?? '',
      type: c.type,
      value: String(c.value),
      minOrderRupees: String(c.minOrderCents / 100),
      maxUses: c.maxUses != null ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      active: c.active,
    });
    setEditing(c);
    setShowForm(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload: CreateCouponInput = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        type: form.type,
        value: form.type === 'PERCENT'
          ? Math.round(parseFloat(form.value))
          : Math.round(parseFloat(form.value) * 100),
        minOrderCents: Math.round((parseFloat(form.minOrderRupees) || 0) * 100),
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        active: form.active,
      };

      if (editing) {
        const { code, ...rest } = payload;
        return adminCouponApi.update(editing.id, rest);
      }
      return adminCouponApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Coupon updated' : 'Coupon created');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      reset();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not save coupon';
      toast.error('Save failed', { description: msg });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminCouponApi.remove(id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: () => toast.error('Could not delete coupon'),
  });

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) {
      toast.error('Code and value are required');
      return;
    }
    save.mutate();
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-sky">Marketing</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Coupons</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {data?.length ?? 0} {data?.length === 1 ? 'coupon' : 'coupons'} in total
          </p>
        </div>
        <button onClick={openCreate} className="btn-glow">
          <Plus className="h-4 w-4" />
          New coupon
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-4xl border border-line bg-paper shadow-lift">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-6 py-4">
              <h2 className="text-lg font-bold">
                {editing ? 'Edit coupon' : 'New coupon'}
              </h2>
              <button
                onClick={reset}
                className="rounded-full p-2 text-ink-mute transition-colors hover:bg-slate-tint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Code *
                  </label>
                  <input
                    className="input"
                    value={form.code}
                    onChange={(e) => setField('code', e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                    disabled={!!editing}
                  />
                  {editing && (
                    <p className="mt-1 text-[11px] text-ink-mute">
                      Code can't be changed after creation
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Description
                  </label>
                  <input
                    className="input"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Welcome offer for first-time buyers"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Type
                  </label>
                  <select
                    className="input"
                    value={form.type}
                    onChange={(e) => setField('type', e.target.value as CouponType)}
                  >
                    <option value="PERCENT">Percentage off</option>
                    <option value="FIXED">Fixed amount off</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    {form.type === 'PERCENT' ? 'Percent (1–100) *' : 'Amount in ₹ *'}
                  </label>
                  <input
                    className="input"
                    value={form.value}
                    onChange={(e) => setField('value', e.target.value)}
                    placeholder={form.type === 'PERCENT' ? '10' : '50'}
                    inputMode="decimal"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Min order (₹)
                  </label>
                  <input
                    className="input"
                    value={form.minOrderRupees}
                    onChange={(e) => setField('minOrderRupees', e.target.value)}
                    placeholder="0"
                    inputMode="decimal"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Max uses (blank = unlimited)
                  </label>
                  <input
                    className="input"
                    value={form.maxUses}
                    onChange={(e) => setField('maxUses', e.target.value)}
                    placeholder="100"
                    inputMode="numeric"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Expires at (optional)
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={form.expiresAt}
                    onChange={(e) => setField('expiresAt', e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setField('active', e.target.checked)}
                      className="h-4 w-4 rounded border-line-strong text-sky focus:ring-sky"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-3 border-t border-line pt-5">
                <button type="submit" disabled={save.isPending} className="btn-glow-lg flex-1">
                  {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create coupon'}
                </button>
                <button type="button" onClick={reset} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border border-line bg-paper shadow-soft">
        {isLoading && (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-tint" />
            ))}
          </div>
        )}

        {!isLoading && data && data.length === 0 && (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-tint">
              <Tag className="h-6 w-6 text-sky" />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">No coupons yet</p>
            <p className="mt-1 text-xs text-ink-soft">
              Create your first coupon to offer discounts.
            </p>
            <button onClick={openCreate} className="btn-glow mt-6 inline-flex">
              <Plus className="h-4 w-4" />
              Create coupon
            </button>
          </div>
        )}

        {!isLoading && data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Min order</th>
                  <th className="px-6 py-3 text-center">Used</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-line last:border-b-0 transition-colors hover:bg-slate-tint/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-ink">{c.code}</div>
                      {c.description && (
                        <div className="mt-0.5 max-w-xs truncate text-xs text-ink-mute">
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-ink">{describeValue(c)}</td>
                    <td className="px-6 py-4 text-ink-soft">
                      {c.minOrderCents > 0 ? formatPrice(c.minOrderCents, 'INR') : '—'}
                    </td>
                    <td className="px-6 py-4 text-center text-ink-soft">
                      {c.usedCount}
                      {c.maxUses != null && ` / ${c.maxUses}`}
                    </td>
                    <td className="px-6 py-4 text-xs text-ink-soft">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          c.active
                            ? 'bg-mint-tint text-mint-dark'
                            : 'bg-slate-tint text-ink-mute'
                        )}
                      >
                        {c.active ? 'Active' : 'Off'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-full p-2 text-ink-soft transition-colors hover:bg-sky-tint hover:text-sky"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete coupon ${c.code}?`)) remove.mutate(c.id);
                          }}
                          className="rounded-full p-2 text-ink-soft transition-colors hover:bg-clay-tint hover:text-clay"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
