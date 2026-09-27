import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { ProductSummary } from '@/api/products';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/features/cart/cartStore';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: ProductSummary }) {
  const add = useCartStore((s) => s.add);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      unitPriceCents: product.priceCents,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="relative">
        <ProductImage src={product.imageUrl} alt={product.name} />

        {product.featured && (
          <div className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky backdrop-blur">
            Featured
          </div>
        )}

        <button
          onClick={handleAdd}
          aria-label="Add to cart"
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink opacity-0 shadow-lift transition-all duration-200 hover:bg-sky hover:text-white hover:shadow-glow group-hover:opacity-100"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        {product.categoryName && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
            {product.categoryName}
          </p>
        )}
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sky">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-bold text-ink">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
    </Link>
  );
}
