import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchOrderByNumber } from '../api/orders';

export const OrderConfirmation: React.FC = () => {
  const { orderId: orderNumber } = useParams<{ orderId: string }>();
  const clearCart = useCartStore(state => state.clearCart);
  const whatsappNumber = useSettingsStore((state) => state.settings.whatsappNumber);
  const loadSettings = useSettingsStore((state) => state.load);

  const { data: order, loading, error } = useAsyncData(
    () => fetchOrderByNumber(orderNumber ?? ''),
    [orderNumber],
  );

  useEffect(() => {
    clearCart();
    loadSettings();
  }, [clearCart, loadSettings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Icon name="error" size="xl" className="text-on-surface-variant mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Commande introuvable</h2>
          <p className="text-on-surface-variant mb-6">
            Impossible de retrouver cette commande. Si vous venez de payer, contactez-nous avec votre numéro de commande.
          </p>
          <Link to="/">
            <Button variant="primary">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const estimatedDelivery = new Date(
    new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Commande Confirmée | RIMAMAN</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-surface py-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
              <Icon name="check_circle" className="text-green-600" size="xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline mb-4">
              Commande confirmée
            </h1>
            <p className="text-xl text-on-surface-variant">
              Merci pour votre confiance. Votre commande a été reçue avec succès.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-surface-container">
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Numéro de commande</p>
                <p className="text-2xl font-bold text-primary font-mono">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-on-surface-variant mb-1">Date</p>
                <p className="font-semibold">{orderDate}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-8 space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.weight} &times;{item.quantity}</p>
                  </div>
                  <p className="font-bold">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-outline-variant font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{order.total.toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Status Steps */}
            {order.deliveryMethod === 'delivery' && (
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Suivi de votre commande</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="check" className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Commande reçue</p>
                      <p className="text-sm text-on-surface-variant">Votre commande a été enregistrée</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="local_shipping" className="text-on-surface-variant" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-on-surface-variant">En livraison</p>
                      <p className="text-sm text-on-surface-variant">Livraison estimée : {estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-primary/5 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Icon name="info" className="text-primary" />
                Prochaines étapes
              </h3>
              <ul className="space-y-2 text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <Icon name="check" size="sm" className="text-primary mt-1 flex-shrink-0" />
                  <span>Notre équipe vous contactera par WhatsApp pour confirmer votre commande</span>
                </li>
                {order.deliveryMethod === 'delivery' ? (
                  <li className="flex items-start gap-2">
                    <Icon name="check" size="sm" className="text-primary mt-1 flex-shrink-0" />
                    <span>Livraison à l'adresse indiquée</span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2">
                    <Icon name="check" size="sm" className="text-primary mt-1 flex-shrink-0" />
                    <span>Retrait au point de vente choisi</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h3 className="font-bold text-lg mb-4">Besoin d'aide ?</h3>
            <p className="text-on-surface-variant mb-6">
              Notre équipe est disponible pour répondre à toutes vos questions concernant votre commande.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px]"
              >
                <Button variant="outline" className="w-full">
                  <Icon name="chat" size="sm" />
                  WhatsApp
                </Button>
              </a>
              <Link to="/contact" className="flex-1 min-w-[200px]">
                <Button variant="outline" className="w-full">
                  <Icon name="mail" size="sm" />
                  Email
                </Button>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/nos-farines">
              <Button variant="primary" size="lg">
                Continuer mes achats
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Retour à l'accueil
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};
