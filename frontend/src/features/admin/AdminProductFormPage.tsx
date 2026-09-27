import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import {
  adminProductApi,
  productApi,
  type CreateProductInput,
} from '@/api/products';
import { toast } from '@/lib/toastStore';

interface FormState {
  sku: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  priceRupees: string;
  stockQuantity: string;
  imageUrl: string;
  ply: string;
  sheets: string;
  scent: string;
  active: boolean;
  featured: boolean;
}

const empty: FormState = {
  sku: '',
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  priceRupees: '',
  stockQuantity: '0',
  imageUrl: '',
  ply: '',
  sheets: '',
  scent: '',
  active: true,
  featured: false,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(empty);
  const [slugTouched, setSlugTouched] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.categories,
  });

  const productQuery = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => adminProductApi.get(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      setForm({
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription ?? '',
        description: p.description ?? '',
        categoryId: p.categoryId ?? '',
        priceRupees: (p.priceCents / 100).toString(),
        stockQuantity: p.stockQuantity.toString(),
        imageUrl: p.imageUrl ?? '',
        ply: String((p.attributes?.ply as string) ?? ''),
        sheets: String((p.attributes?.sheets as string) ?? ''),
        scent: String((p.attributes?.scent as string) ?? ''),
        active: p.active,
        featured: p.featured,
      });
      setSlugTouched(true);
    }
  }, [productQuery.data]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleNameChange = (v: string) => {
    setForm((f) => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }));
  };

  const save = useMutation({
    mutationFn: async () => {
      const priceCents = Math.round(parseFloat(form.priceRupees) * 100);
      const attrs: Record<string, unknown> = {};
      if (form.ply) attrs.ply = Number(form.ply);
      if (form.sheets) attrs.sheets = Number(form.sheets);
      if (form.scent) attrs.scent = form.scent;

      const payload: CreateProductInput = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        description: form.description.trim() || undefined,
        categoryId: form.categoryId || null,
        priceCents,
        currency: 'INR',
        stockQuantity: parseInt(form.stockQuantity, 10) || 0,
        imageUrl: form.imageUrl.trim() || undefined,
        attributes: attrs,
        active: form.active,
        featured: form.featured,
      };

      if (isEdit) {
        return adminProductApi.update(id!, payload);
      }
      return adminProductApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated' : 'Product created');
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Save failed. Check the fields.';
      toast.error('Could not save', { description: msg });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name || !form.slug || !form.priceRupees) {
      toast.error('Missing required fields', {
        description: 'SKU, name, slug, and price are required.',
      });
      return;
    }
    save.mutate();
  };

  if (isEdit && productQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-10 w-40 animate-pulse rounded-full bg-slate-tint" />
        <div className="h-96 animate-pulse rounded-3xl bg-slate-tint" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-sky"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="mb-8">
        <p className="eyebrow text-sky">{isEdit ? 'Edit' : 'New'}</p>
        <h1 className="mt-2 text-3xl font-extrabold">
          {isEdit ? 'Edit product' : 'Add a product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-line bg-paper p-6 shadow-soft md:p-8">
          <h2 className="text-lg font-bold">Basics</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Product name *
              </label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Well-Wipes Ultra Soft Facial Tissue"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                SKU *
              </label>
              <input
                className="input"
                value={form.sku}
                onChange={(e) => setField('sku', e.target.value)}
                placeholder="WW-FT-001"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Slug *
              </label>
              <input
                className="input"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField('slug', e.target.value);
                }}
                placeholder="well-wipes-ultra-soft-facial-tissue"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Short description
              </label>
              <input
                className="input"
                value={form.shortDescription}
                onChange={(e) => setField('shortDescription', e.target.value)}
                placeholder="2-ply ultra soft facial tissue, 100 sheets"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Description
              </label>
              <textarea
                className="input min-h-[100px] rounded-3xl py-3"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Full product description…"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-paper p-6 shadow-soft md:p-8">
          <h2 className="text-lg font-bold">Pricing & inventory</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Price (₹) *
              </label>
              <input
                className="input"
                value={form.priceRupees}
                onChange={(e) => setField('priceRupees', e.target.value)}
                placeholder="199.00"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Stock
              </label>
              <input
                className="input"
                value={form.stockQuantity}
                onChange={(e) => setField('stockQuantity', e.target.value)}
                placeholder="100"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Category
              </label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setField('categoryId', e.target.value)}
              >
                <option value="">— None —</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-paper p-6 shadow-soft md:p-8">
          <h2 className="text-lg font-bold">Attributes</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Optional details used in filters and search.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">Ply</label>
              <input className="input" value={form.ply} onChange={(e) => setField('ply', e.target.value)} placeholder="2" inputMode="numeric" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">Sheets</label>
              <input className="input" value={form.sheets} onChange={(e) => setField('sheets', e.target.value)} placeholder="100" inputMode="numeric" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">Scent</label>
              <input className="input" value={form.scent} onChange={(e) => setField('scent', e.target.value)} placeholder="unscented" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-paper p-6 shadow-soft md:p-8">
          <h2 className="text-lg font-bold">Media & visibility</h2>
          <div className="mt-6 grid gap-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Image URL
              </label>
              <input
                className="input"
                value={form.imageUrl}
                onChange={(e) => setField('imageUrl', e.target.value)}
                placeholder="https://images.pexels.com/photos/…"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setField('active', e.target.checked)}
                  className="h-4 w-4 rounded border-line-strong text-sky focus:ring-sky"
                />
                Active (visible in store)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField('featured', e.target.checked)}
                  className="h-4 w-4 rounded border-line-strong text-sky focus:ring-sky"
                />
                Featured on homepage
              </label>
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={save.isPending}
            className="btn-glow-lg"
          >
            <Save className="h-4 w-4" />
            {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <Link to="/admin/products" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
