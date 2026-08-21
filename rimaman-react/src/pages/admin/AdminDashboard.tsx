import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAllOrders } from '../../api/orders';
import { fetchAllContactMessages } from '../../api/contact';
import { fetchAllReviewsForModeration } from '../../api/reviews';
import { fetchProducts } from '../../api/products';

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  href: string;
  highlight?: boolean;
}> = ({ icon, label, value, href, highlight }) => (
  <Link
    to={href}
    className={`flex items-center gap-4 bg-white rounded-2xl p-6 border hover:shadow-sm transition-shadow ${
      highlight ? 'border-primary/30' : 'border-outline-variant'
    }`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        highlight ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
      }`}
    >
      <Icon name={icon} />
    </div>
    <div>
      <p className="text-2xl font-bold font-headline text-on-surface">{value}</p>
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  </Link>
);

export const AdminDashboard: React.FC = () => {
  const { data: orders } = useAsyncData(fetchAllOrders, []);
  const { data: messages } = useAsyncData(fetchAllContactMessages, []);
  const { data: reviews } = useAsyncData(fetchAllReviewsForModeration, []);
  const { data: products } = useAsyncData(fetchProducts, []);

  const pendingOrders = orders?.filter((o) => o.orderStatus === 'pending').length ?? '…';
  const newMessages = messages?.filter((m) => m.status === 'new').length ?? '…';
  const pendingReviews = reviews?.filter((r) => r.status === 'pending').length ?? '…';
  const productCount = products?.length ?? '…';

  const QUICK_LINKS = [
    { href: '/admin/media', icon: 'photo_library', label: 'Ajouter des images', desc: 'Médiathèque' },
    { href: '/admin/commandes', icon: 'shopping_bag', label: 'Voir les commandes', desc: 'Gestion commandes' },
    { href: '/admin/messages', icon: 'mail', label: 'Lire les messages', desc: 'Formulaire de contact' },
    { href: '/admin/avis', icon: 'star', label: 'Modérer les avis', desc: 'Avis en attente' },
    { href: '/admin/pages', icon: 'web', label: 'Éditer les pages', desc: 'Page builder' },
    { href: '/admin/reglages', icon: 'settings', label: 'Réglages du site', desc: 'Infos de contact' },
  ];

  return (
    <>
      <Helmet>
        <title>Tableau de bord | Admin RIMAMAN</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">
          Tableau de bord
        </h1>
        <p className="text-on-surface-variant mb-8">
          Bienvenue dans l'espace d'administration de RIMAMAN.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon="shopping_bag"
            label="Commandes en attente"
            value={pendingOrders}
            href="/admin/commandes"
            highlight={typeof pendingOrders === 'number' && pendingOrders > 0}
          />
          <StatCard
            icon="mail"
            label="Nouveaux messages"
            value={newMessages}
            href="/admin/messages"
            highlight={typeof newMessages === 'number' && newMessages > 0}
          />
          <StatCard
            icon="star"
            label="Avis en attente"
            value={pendingReviews}
            href="/admin/avis"
            highlight={typeof pendingReviews === 'number' && pendingReviews > 0}
          />
          <StatCard
            icon="inventory_2"
            label="Produits actifs"
            value={productCount}
            href="/admin/produits"
          />
        </div>

        <h2 className="text-lg font-bold text-on-surface mb-4">Accès rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="bg-white rounded-2xl p-5 border border-outline-variant hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <Icon name={link.icon} className="text-primary mb-3" />
              <p className="font-semibold text-on-surface text-sm group-hover:text-primary transition-colors">
                {link.label}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
