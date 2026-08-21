import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { MobileMenu } from './MobileMenu';
import { useCartStore } from '../../store/cartStore';
import { useSettingsStore } from '../../store/settingsStore';
import { trackWhatsAppClick } from '../../utils/analytics';

const navLinks = [
  { path: '/', label: 'Accueil' },
  { path: '/a-propos', label: 'À propos' },
  { path: '/nos-farines', label: 'Notre Farine' },
  { path: '/recettes', label: 'Recettes' },
  { path: '/nutrition', label: 'Nutrition' },
  { path: '/galerie', label: 'Galerie' },
  { path: '/ou-acheter', label: 'Où acheter' },
  { path: '/blog', label: 'Blog' },
  { path: '/b2b', label: 'B2B' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = useCartStore(state => state.getTotalItems());
  const whatsappNumber = useSettingsStore(state => state.settings.whatsappNumber);
  const loadSettings = useSettingsStore(state => state.load);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-nav bg-surface/80 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-screen-2xl mx-auto">
          <Link to="/" aria-label="Accueil RIMAMAN">
            <img src="/logo.png" alt="RIMAMAN - Les Farines du Moulin d'Or" className="h-12 w-auto" />
          </Link>
          
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-headline font-bold text-sm tracking-wide transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <button aria-label="Rechercher">
                <Icon name="search" className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
              </button>
              <Link to="/panier" aria-label="Panier" className="relative">
                <Icon name="shopping_cart" className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:block"
              onClick={trackWhatsAppClick}
            >
              <Button size="sm">WhatsApp</Button>
            </a>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon name="menu" className="text-on-surface" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};
