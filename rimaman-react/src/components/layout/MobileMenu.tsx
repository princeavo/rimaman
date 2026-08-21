import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useSettingsStore } from '../../store/settingsStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const whatsappNumber = useSettingsStore((state) => state.settings.whatsappNumber);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <img src="/logo.png" alt="RIMAMAN" className="h-12 w-auto" />
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
            aria-label="Fermer le menu"
          >
            <Icon name="close" className="text-on-surface" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-6">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={onClose}
                  className={`block px-4 py-3 rounded-xl font-headline font-bold text-base transition-all ${
                    isActive(link.path)
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-outline-variant">
          <div className="flex items-center gap-4 mb-4">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors"
              aria-label="Rechercher"
            >
              <Icon name="search" className="text-on-surface" />
              <span className="font-medium text-sm">Rechercher</span>
            </button>
            <button
              className="w-12 h-12 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors"
              aria-label="Panier"
            >
              <Icon name="shopping_cart" className="text-on-surface" />
            </button>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-primary text-on-primary px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
          >
            Contactez-nous sur WhatsApp
          </a>
        </div>
      </div>
    </>
  );
};
