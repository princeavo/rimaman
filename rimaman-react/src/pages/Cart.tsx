import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { useCartStore } from '../store/cartStore';
import { EmptyState } from '../components/common/EmptyState';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore();

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= 5000 ? 0 : 1000;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Panier | RIMAMAN</title>
        </Helmet>
        <main className="pt-32 pb-24 min-h-screen">
          <div className="max-w-7xl mx-auto px-8">
            <EmptyState
              icon="shopping_cart"
              title="Votre panier est vide"
              description="Découvrez nos délicieuses farines bio et commencez vos achats!"
              actionLabel="Voir nos produits"
              onAction={() => window.location.href = '/nos-farines'}
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Panier (${getTotalItems()}) | RIMAMAN`}</title>
      </Helmet>

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-8">
            Votre Panier
            <span className="text-primary ml-4">({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-low rounded-2xl p-6 flex gap-6 items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
                      {item.name}
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-2">{item.weight}</p>
                    <p className="text-primary font-bold text-xl">
                      {item.price.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-full bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center"
                      aria-label="Diminuer quantité"
                    >
                      <Icon name="remove" size="sm" />
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-full bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center"
                      aria-label="Augmenter quantité"
                    >
                      <Icon name="add" size="sm" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-10 h-10 rounded-full bg-error/10 hover:bg-error hover:text-on-error text-error transition-colors flex items-center justify-center"
                    aria-label="Retirer du panier"
                  >
                    <Icon name="delete" size="sm" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container-low rounded-2xl p-8 sticky top-24">
                <h2 className="font-headline font-bold text-2xl text-on-surface mb-6">
                  Récapitulatif
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Sous-total</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Livraison</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-primary">Gratuite</span>
                      ) : (
                        `${shippingCost.toLocaleString()} FCFA`
                      )}
                    </span>
                  </div>
                  {subtotal < 5000 && (
                    <div className="text-sm text-on-surface-variant bg-primary/10 p-3 rounded-lg">
                      <Icon name="local_shipping" size="sm" className="inline mr-2" />
                      Plus que {(5000 - subtotal).toLocaleString()} FCFA pour la livraison gratuite!
                    </div>
                  )}
                  <div className="border-t border-outline-variant pt-4 flex justify-between text-on-surface text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button variant="primary" size="lg" className="w-full mb-4">
                    <Icon name="shopping_bag" size="sm" className="mr-2" />
                    Passer la commande
                  </Button>
                </Link>

                <Link to="/nos-farines">
                  <Button variant="outline" size="md" className="w-full">
                    Continuer mes achats
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-8 pt-8 border-t border-outline-variant space-y-3">
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <Icon name="verified_user" size="sm" className="text-primary" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <Icon name="local_shipping" size="sm" className="text-primary" />
                    <span>Livraison sur Cotonou et Porto-Novo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
