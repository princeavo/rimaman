import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ToastContainer } from './components/common/Toast';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { useToastStore } from './store/toastStore';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { AdminLayout } from './components/admin/AdminLayout';
import { RequireAdmin } from './components/admin/RequireAdmin';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Preloader } from './components/common/Preloader';

// Lazy load pages for better performance
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Locations = lazy(() => import('./pages/Locations').then(m => ({ default: m.Locations })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const Gallery = lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));
const Recipes = lazy(() => import('./pages/Recipes').then(m => ({ default: m.Recipes })));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail').then(m => ({ default: m.RecipeDetail })));
const Nutrition = lazy(() => import('./pages/Nutrition').then(m => ({ default: m.Nutrition })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(m => ({ default: m.BlogPost })));
const B2B = lazy(() => import('./pages/B2B').then(m => ({ default: m.B2B })));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales').then(m => ({ default: m.MentionsLegales })));
const CGV = lazy(() => import('./pages/CGV').then(m => ({ default: m.CGV })));
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite').then(m => ({ default: m.PolitiqueConfidentialite })));
const OrderTracking = lazy(() => import('./pages/OrderTracking').then(m => ({ default: m.OrderTracking })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Admin pages (lazy)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia').then(m => ({ default: m.AdminMedia })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminRecipes = lazy(() => import('./pages/admin/AdminRecipes').then(m => ({ default: m.AdminRecipes })));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog').then(m => ({ default: m.AdminBlog })));
const AdminFaq = lazy(() => import('./pages/admin/AdminFaq').then(m => ({ default: m.AdminFaq })));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery').then(m => ({ default: m.AdminGallery })));
const AdminLocations = lazy(() => import('./pages/admin/AdminLocations').then(m => ({ default: m.AdminLocations })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages').then(m => ({ default: m.AdminMessages })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminComments = lazy(() => import('./pages/admin/AdminComments').then(m => ({ default: m.AdminComments })));
const AdminQuestions = lazy(() => import('./pages/admin/AdminQuestions').then(m => ({ default: m.AdminQuestions })));

function PublicApp() {

  return (
    <>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/nos-farines" element={<Products />} />
            <Route path="/nos-farines/:id" element={<ProductDetail />} />
            <Route path="/ou-acheter" element={<Locations />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/galerie" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/commande/:orderId" element={<OrderConfirmation />} />
            <Route path="/recettes" element={<Recipes />} />
            <Route path="/recettes/:slug" element={<RecipeDetail />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/b2b" element={<B2B />} />
            <Route path="/professionnels" element={<B2B />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/suivi-commande" element={<OrderTracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}


function AppContent() {
  const { toasts, removeToast } = useToastStore();
  return (
    <>
    <Routes>
      {/* Admin section — no public Layout wrapper */}
      <Route path="/admin/connexion" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="produits" element={<AdminProducts />} />
                  <Route path="categories-produit" element={<AdminCategories />} />
                  <Route path="recettes" element={<AdminRecipes />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="faq" element={<AdminFaq />} />
                  <Route path="galerie" element={<AdminGallery />} />
                  <Route path="points-de-vente" element={<AdminLocations />} />
                  <Route path="commandes" element={<AdminOrders />} />
                  <Route path="avis" element={<AdminReviews />} />
                  <Route path="commentaires" element={<AdminComments />} />
                  <Route path="questions" element={<AdminQuestions />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="reglages" element={<AdminSettings />} />
                </Routes>
              </Suspense>
            </AdminLayout>
          </RequireAdmin>
        }
      />

      {/* Public section — inside the shared Layout */}
      <Route
        path="*"
        element={<PublicApp />}
      />
    </Routes>
    <ToastContainer toasts={toasts} onRemove={removeToast} />
    <ConfirmDialog />
    </>
  );
}

function App() {
  return (
    <>
      <Preloader />
      <ErrorBoundary>
        <HelmetProvider>
          <Router>
            <AppContent />
          </Router>
        </HelmetProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
