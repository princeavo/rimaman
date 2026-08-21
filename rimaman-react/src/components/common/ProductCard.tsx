import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { Icon } from './Icon';
import { Button } from './Button';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import { trackAddToCart } from '../../utils/analytics';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

/** Estimation de secours quand Product.servings n'est pas renseigné en DB. */
function estimateServings(weight: string): number | null {
  const lower = weight.toLowerCase().trim();
  const n = parseFloat(lower);
  if (isNaN(n)) return null;
  const kg = lower.includes('kg') ? n : n / 1000;
  return Math.round(kg * 6);
}

function getServings(product: Product): number | null {
  return product.servings ?? estimateServings(product.weight);
}

/** Lien vers la page détail : slug si disponible, UUID en fallback. */
function productPath(product: Product): string {
  return `/nos-farines/${product.slug ?? product.id}`;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);
  const servings = getServings(product);
  const pricePerPerson = servings ? Math.round(product.price / servings) : null;

  const handleAddToCart = () => {
    addItem(product);
    showToast(`${product.name} ajouté au panier`, 'success');
    trackAddToCart(product);
  };

  if (featured) {
    return (
      <div className="flex flex-col lg:flex-row bg-surface rounded-2xl overflow-hidden border border-outline-variant max-w-3xl w-full">
        <Link to={productPath(product)} className="lg:w-1/2 relative block">
          <img
            className="w-full h-full object-cover"
            alt={product.name}
            src={product.image}
            loading="lazy"
          />
          {product.isBestseller && (
            <div className="absolute top-4 left-4 bg-secondary text-on-secondary text-xs font-bold px-3 py-1 rounded-full uppercase">
              Bestseller
            </div>
          )}
        </Link>
        <div className="lg:w-1/2 p-10 flex flex-col justify-center">
          <Link to={productPath(product)} className="group">
            <h3 className="text-2xl font-bold text-on-surface font-headline mb-4 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-on-surface-variant mb-6 leading-relaxed">{product.description}</p>
          {servings && (
            <div className="flex items-center gap-2 mb-6">
              <Icon name="group" className="text-secondary" />
              <span className="text-on-surface-variant text-sm font-medium">
                {product.weight} rassasie au moins{' '}
                <strong className="text-primary">{servings} personnes</strong>
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="text-2xl font-bold text-on-surface">
                {product.price.toLocaleString()} FCFA
              </span>
              {pricePerPerson && (
                <p className="text-xs text-on-surface-variant mt-0.5">
                  soit ~{pricePerPerson} FCFA / pers.
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              icon="add_shopping_cart"
              onClick={handleAddToCart}
              aria-label={`Ajouter ${product.name} au panier`}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-surface-container-low rounded-2xl border border-outline-variant hover-lift overflow-hidden flex flex-col">
      <Link to={productPath(product)} className="block flex-1">
        <div className="relative h-48 overflow-hidden">
          <img
            alt={product.name}
            className="w-full h-full object-cover"
            src={product.image}
            loading="lazy"
          />
          <span className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
            Format {product.weight}
          </span>
          {product.isBestseller && (
            <span className="absolute top-4 left-4 bg-secondary text-on-secondary text-xs font-bold px-3 py-1 rounded-full uppercase">
              Bestseller
            </span>
          )}
        </div>
        <div className="p-6 pb-4">
          <h4 className="font-headline text-xl font-bold mb-2 text-on-surface">{product.name}</h4>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>
          {servings && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Icon name="group" size="sm" className="text-secondary" />
              <span>
                Rassasie ~<strong className="text-primary">{servings} personnes</strong>
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-outline-variant mt-auto">
        <div>
          <span className="text-xl font-bold text-on-surface">
            {product.price.toLocaleString()} FCFA
          </span>
          {pricePerPerson && (
            <p className="text-xs text-on-surface-variant">~{pricePerPerson} FCFA / pers.</p>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-primary text-on-primary w-11 h-11 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <Icon name="add_shopping_cart" size="sm" />
        </button>
      </div>
    </article>
  );
};
