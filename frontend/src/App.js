import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import CartNotification from './components/Common/CartNotification';
import ScrollToTop from './components/Common/ScrollToTop';

// Public pages
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import WishlistPage from './pages/WishlistPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Protected public pages (require login)
import PrivateRoute from './components/Common/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderReviewPage from './pages/OrderReviewPage'; // <-- ADD THIS IMPORT

// Guest review page (token-based)
import GuestOrderReviewPage from './pages/GuestOrderReviewPage';

// Admin pages
import AdminRoute from './components/Common/AdminRoute';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminCategoriesPage from './pages/Admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminCustomersPage from './pages/Admin/AdminCustomersPage';
import AdminReviewsPage from './pages/Admin/AdminReviewsPage';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';
import AdminInventoryPage from './pages/Admin/AdminInventoryPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';
import AdminProfilePage from './pages/Admin/AdminProfilePage';

// Layout for public pages (includes header & footer)
const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutUsPage /></PublicLayout>} />
          <Route path="/wishlist" element={<PublicLayout><WishlistPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
          <Route path="/resend-verification" element={<PublicLayout><ResendVerificationPage /></PublicLayout>} />
          <Route path="/verify-email" element={<PublicLayout><EmailVerificationPage /></PublicLayout>} />
          <Route path="/shop" element={<PublicLayout><ShopPage /></PublicLayout>} />
          <Route path="/product/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
          <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
          <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
          <Route path="/order-success/:id" element={<PublicLayout><OrderSuccessPage /></PublicLayout>} />

          {/* Guest order review – token-based (the main link for guests) */}
          <Route path="/guest-order-review/:token" element={<PublicLayout><GuestOrderReviewPage /></PublicLayout>} />

          {/* Fallback guest order (legacy) – keep if needed */}
          <Route path="/guest-review/:token" element={<PublicLayout><GuestOrderReviewPage /></PublicLayout>} />

          {/* Protected user routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <PublicLayout><ProfilePage /></PublicLayout>
              </PrivateRoute>
            }
          />

          {/* Order detail pages – direct and guest token */}
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/guest-order/:id/:token" element={<OrderDetailPage />} />

          {/* Review pages for logged-in users (orderId based) */}
          <Route path="/order/:orderId/review" element={<OrderReviewPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviewsPage /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><AdminInventoryPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />
        </Routes>
        <CartNotification />
      </div>
    </BrowserRouter>
  );
}

export default App;