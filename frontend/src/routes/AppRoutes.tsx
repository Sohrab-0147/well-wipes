import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { OAuthCallback } from '@/features/auth/OAuthCallback';
import { HomePage } from '@/features/home/HomePage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { ProductDetailPage } from '@/features/products/ProductDetailPage';
import { CartPage } from '@/features/cart/CartPage';
import { CheckoutPage } from '@/features/cart/CheckoutPage';
import { CheckoutSuccessPage } from '@/features/cart/CheckoutSuccessPage';
import { CheckoutCancelPage } from '@/features/cart/CheckoutCancelPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { AdminProductsPage } from '@/features/admin/AdminProductsPage';
import { AdminProductFormPage } from '@/features/admin/AdminProductFormPage';
import { AdminOrdersPage } from '@/features/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/features/admin/AdminOrderDetailPage';
import { AboutPage } from '@/features/misc/AboutPage';
import { AiLandingPage } from '@/features/ai/AiLandingPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages — no layout chrome */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Admin — its own layout, NOT nested inside customer Layout */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<AdminProductFormPage />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
        </Route>
      </Route>

      {/* Customer storefront */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/ai" element={<AiLandingPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>

        {/* Stripe redirects — public, no login required to view */}
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />

        {/* Catch-all inside Layout so 404 keeps the header */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
