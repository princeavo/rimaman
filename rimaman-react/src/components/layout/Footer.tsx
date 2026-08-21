import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';
import { NewsletterForm } from '../common/NewsletterForm';

export const Footer: React.FC = () => {
  const { whatsappNumber, contactEmail } = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <footer className="w-full bg-on-surface text-surface">
      <div className="px-12 pt-12 pb-6 max-w-7xl mx-auto border-b border-surface/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-bold text-surface mb-1">Restez informés</p>
            <p className="text-sm text-surface/60">Recettes, conseils nutritionnels et nouveautés RIMAMAN.</p>
          </div>
          <div className="w-full md:w-80">
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-16 max-w-7xl mx-auto">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <img src="/logo.png" alt="RIMAMAN" className="h-20 w-auto mb-6" />
          <p className="text-surface/70 text-sm mb-8 leading-relaxed">
            Le Moulin d'Or s'engage à fournir des produits sains et naturels, issus du meilleur de nos terres béninoises.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface/20 hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container transition-colors duration-300 text-sm font-medium"
          >
            WhatsApp
          </a>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="text-primary-container font-bold mb-6">Navigation</h4>
          <ul className="space-y-4">
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/">Accueil</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/a-propos">À propos</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/nos-farines">Notre Farine</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/recettes">Recettes</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/nutrition">Nutrition</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="text-primary-container font-bold mb-6">Support</h4>
          <ul className="space-y-4">
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/galerie">Galerie</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/ou-acheter">Où acheter</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/blog">Blog</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/b2b">B2B</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/faq">FAQ</Link></li>
            <li><Link className="text-surface/70 hover:text-primary-container transition-all duration-200 block hover:translate-x-1" to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h4 className="text-primary-container font-bold mb-6">Contact</h4>
          <ul className="space-y-3 text-surface/70 text-sm">
            <li>{contactEmail}</li>
            <li>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-container transition-colors"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-surface/10 py-8 px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-surface/40">
          <p>© Moulin d'Or. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link className="hover:text-primary-container transition-colors" to="/mentions-legales">Mentions légales</Link>
            <Link className="hover:text-primary-container transition-colors" to="/cgv">CGV</Link>
            <Link className="hover:text-primary-container transition-colors" to="/politique-de-confidentialite">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
