import { usePageTitle } from '@/lib/usePageTitle';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Lock, ShieldCheck, Tag, X } from 'lucide-react';
import { useCartStore } from './cartStore';
import { orderApi, couponApi, type ValidateCouponResult } from '@/api/orders';
import { TrustBadges } from '@/components/TrustBadges';
import { toast } from '@/lib/toastStore';
import { formatPrice } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';

const initialAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'IN',
};

export function CheckoutPage() {
  usePageTitle('Checkout');
  const { items, totalCents, clear } = useCartStore();
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<ValidateCouponResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page-container py-16">
        <EmptyState
          title="Your cart is empty"
          description="Add a few products before checking out."
          ctaLabel="Browse products"
          ctaHref="/products"
        />
      </div>
    );
  }

  const subtotal = totalCents();
  const currency = items[0]?.currency ?? 'INR';
  const shippingCents = subtotal >= 49900 ? 0 : 4900;
  const discountCents = couponResult?.valid ? couponResult.discountCents : 0;
  const total = Math.max(0, subtotal - discountCents) + shippingCents;

  const setField = (k: keyof typeof initialAddress, v: string) =>
    setAddress((a) => ({ ...a, [k]: v }));

  const validate = () => {
    if (!address.fullName.trim()) return 'Full name is required';
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, '')))
      return 'Enter a valid 10-digit phone number';
    if (!address.line1.trim()) return 'Address line 1 is required';
    if (!address.city.trim()) return 'City is required';
    if (!address.state.trim()) return 'State is required';
    if (!/^\d{6}$/.test(address.pincode)) return 'Enter a valid 6-digit PIN code';
    return null;
  };

  const validateCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponResult(null);
      return;
    }
    setValidating(true);
    try {
      const result = await couponApi.validate(code, subtotal);
      setCouponResult(result);
    } catch {
      setCouponResult({
        valid: false,
        code,
        message: 'Could not validate coupon',
        discountCents: 0,
        finalTotalCents: subtotal,
      });
    } finally {
      setValidating(false);
    }
  };

  const clearCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error('Please review your address', { description: err });
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
        couponCode: couponResult?.valid ? couponResult.code : undefined,
        paymentMethod,
      });

      // Store for the success page to reconcile
      sessionStorage.setItem('ww_pending_order_id', order.id);

      // Cart can be cleared — order is now in the backend
      clear();

      if (paymentMethod === 'COD' || !order.checkoutUrl) {
        // COD: go directly to success page
        navigate('/checkout/success');
      } else {
        // Online: redirect to Stripe
        window.location.href = order.checkoutUrl;
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      toast.error('Order failed', { description: msg });
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container py-12 md:py-16">
      <Link
        to="/cart"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-sky"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <div className="mb-10">
        <p className="eyebrow text-sky">Checkout</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
          Where should we send it?
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="rounded-4xl border border-line bg-paper p-6 shadow-soft md:p-8">
            <h2 className="text-lg font-bold text-ink">Contact</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Full name
                </label>
                <input
                  className="input"
                  value={address.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  placeholder="Sohrab Shaikh"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Phone
                </label>
                <input
                  className="input"
                  value={address.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="98765 43210"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="rounded-4xl border border-line bg-paper p-6 shadow-soft md:p-8">
            <h2 className="text-lg font-bold text-ink">Shipping address</h2>
            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Address line 1
                </label>
                <input
                  className="input"
                  value={address.line1}
                  onChange={(e) => setField('line1', e.target.value)}
                  placeholder="Flat / house no., building"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Address line 2 (optional)
                </label>
                <input
                  className="input"
                  value={address.line2}
                  onChange={(e) => setField('line2', e.target.value)}
                  placeholder="Area, landmark"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    City
                  </label>
                  <input
                    className="input"
                    value={address.city}
                    onChange={(e) => setField('city', e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    State
                  </label>
                  <input
                    className="input"
                    value={address.state}
                    onChange={(e) => setField('state', e.target.value)}
                    placeholder="MH"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    PIN code
                  </label>
                  <input
                    className="input"
                    value={address.pincode}
                    onChange={(e) => setField('pincode', e.target.value)}
                    placeholder="400001"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-mint-tint px-5 py-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-mint-dark" />
            <p className="text-sm text-ink-soft">
              Your details are encrypted and never shared. Payments are handled securely by Stripe.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-4xl border border-line bg-paper p-6 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Order summary</h2>

            {/* Payment method */}
            <div className="mt-6 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Payment method
              </label>

              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                paymentMethod === 'ONLINE'
                  ? 'border-sky bg-sky-tint/40'
                  : 'border-line bg-paper hover:border-line-strong'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-1 h-4 w-4 border-line-strong text-sky focus:ring-sky"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">Pay online</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    UPI, cards, netbanking via Stripe
                  </p>
                </div>
              </label>

              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                paymentMethod === 'COD'
                  ? 'border-sky bg-sky-tint/40'
                  : 'border-line bg-paper hover:border-line-strong'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 h-4 w-4 border-line-strong text-sky focus:ring-sky"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">Cash on delivery</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Pay when your order arrives. No prepayment.
                  </p>
                </div>
              </label>
            </div>

            {/* Coupon input */}
            <div className="mt-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-mute">
                Have a coupon code?
              </label>
              {couponResult?.valid ? (
                <div className="flex items-center justify-between gap-2 rounded-full border border-mint/40 bg-mint-tint px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-mint-dark" />
                    <span className="font-mono text-sm font-semibold text-mint-dark">
                      {couponResult.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearCoupon}
                    className="rounded-full p-1 text-mint-dark transition-colors hover:bg-paper/60"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME10"
                      className="input font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={validating || !couponCode.trim()}
                      className="btn-secondary text-sm whitespace-nowrap disabled:opacity-40"
                    >
                      {validating ? 'Checking…' : 'Apply'}
                    </button>
                  </div>
                  {couponResult && !couponResult.valid && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-clay-dark">
                      <AlertCircle className="h-3 w-3" />
                      {couponResult.message}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 space-y-3 border-b border-line pb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-3 text-sm">
                  <span className="text-ink-soft">
                    {item.name}
                    <span className="ml-1 text-ink-mute">× {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink">
                    {formatPrice(item.unitPriceCents * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-semibold text-ink">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Shipping</span>
                <span className="font-semibold text-ink">
                  {shippingCents === 0 ? (
                    <span className="text-mint-dark">Free</span>
                  ) : (
                    formatPrice(shippingCents, currency)
                  )}
                </span>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-mint-dark">Coupon discount</span>
                  <span className="font-semibold text-mint-dark">
                    − {formatPrice(discountCents, currency)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
              <span className="text-sm font-semibold text-ink-soft">Total</span>
              <span className="text-2xl font-bold text-ink">
                {formatPrice(total, currency)}
              </span>
            </div>

            <div className="mt-6">
              <TrustBadges />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-glow-lg mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              {submitting ? 'Placing order…' : 'Place order & pay'}
            </button>

            <p className="mt-4 text-center text-xs text-ink-mute">
              You'll be redirected to Stripe to complete payment
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
