import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useAdminStore } from '../../store/adminStore';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', icon: 'dashboard', label: 'Tableau de bord' },
  { href: '/admin/media', icon: 'photo_library', label: 'Médiathèque' },
{ href: '/admin/produits', icon: 'inventory_2', label: 'Produits' },
  { href: '/admin/categories-produit', icon: 'category', label: 'Catégories produit' },
  { href: '/admin/recettes', icon: 'restaurant', label: 'Recettes' },
  { href: '/admin/blog', icon: 'article', label: 'Blog' },
  { href: '/admin/faq', icon: 'help', label: 'FAQ' },
  { href: '/admin/galerie', icon: 'collections', label: 'Galerie' },
  { href: '/admin/points-de-vente', icon: 'location_on', label: 'Points de vente' },
  { href: '/admin/commandes', icon: 'shopping_bag', label: 'Commandes' },
  { href: '/admin/avis', icon: 'star', label: 'Avis clients' },
  { href: '/admin/commentaires', icon: 'chat_bubble', label: 'Commentaires' },
  { href: '/admin/questions', icon: 'quiz', label: 'Questions recettes' },
  { href: '/admin/messages', icon: 'mail', label: 'Messages' },
  { href: '/admin/reglages', icon: 'settings', label: 'Réglages' },
];

interface SidebarProps {
  userEmail: string | undefined;
  onLogout: () => void;
  onNavClick: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ userEmail, onLogout, onNavClick }) => (
  <nav className="flex flex-col h-full bg-white border-r border-outline-variant">
    {/* Logo */}
    <div className="px-6 py-5 border-b border-outline-variant">
      <a href="/" className="flex items-center gap-2" target="_blank" rel="noopener noreferrer">
        <img src="/logo.png" alt="RIMAMAN" className="h-9 w-auto" />
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Admin</span>
      </a>
    </div>

    {/* Nav links */}
    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === '/admin'}
          onClick={onNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`
          }
        >
          <Icon name={item.icon} size="sm" />
          {item.label}
        </NavLink>
      ))}
    </div>

    {/* User footer */}
    <div className="px-4 py-4 border-t border-outline-variant">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="person" size="sm" className="text-primary" />
        </div>
        <p className="text-sm text-on-surface font-medium truncate flex-1">{userEmail}</p>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-error hover:bg-error/10 transition-colors"
      >
        <Icon name="logout" size="sm" />
        Déconnexion
      </button>
    </div>
  </nav>
);

interface Props {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<Props> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-surface-container-low overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0">
        <AdminSidebar userEmail={user?.email} onLogout={handleLogout} onNavClick={() => {}} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-60 flex-shrink-0">
            <AdminSidebar
              userEmail={user?.email}
              onLogout={handleLogout}
              onNavClick={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-outline-variant px-6 h-14 flex items-center gap-4 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" size="sm" />
          </button>
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="open_in_new" size="sm" />
            Voir le site
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
