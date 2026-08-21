import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { fetchOrderByNumber } from '../api/orders';
import type { Order } from '../types';

const STATUS_LABELS: Record<Order['orderStatus'], { label: string; icon: string; color: string }> = {
  pending:    { label: 'En attente de confirmation', icon: 'hourglass_empty', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  confirmed:  { label: 'Commande confirmée',         icon: 'check_circle',    color: 'text-blue-600 bg-blue-50 border-blue-200' },
  processing: { label: 'En cours de préparation',   icon: 'inventory',       color: 'text-purple-600 bg-purple-50 border-purple-200' },
  shipped:    { label: 'Expédiée / En livraison',   icon: 'local_shipping',  color: 'text-orange-600 bg-orange-50 border-orange-200' },
  delivered:  { label: 'Livrée',                    icon: 'task_alt',        color: 'text-green-600 bg-green-50 border-green-200' },
  cancelled:  { label: 'Annulée',                   icon: 'cancel',          color: 'text-red-600 bg-red-50 border-red-200' },
};

const STEPS: Order['orderStatus'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const OrderTracking: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = orderNumber.trim().toUpperCase();
    if (!num) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const result = await fetchOrderByNumber(num);
      setOrder(result);
    } catch {
      setError('Commande introuvable. Vérifiez le numéro et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = order
    ? STEPS.indexOf(order.orderStatus as Order['orderStatus'])
    : -1;

  return (
    <>
      <Helmet>
        <title>Suivi de commande | RIMAMAN</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="pt-28 pb-24 max-w-2xl mx-auto px-6">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Icon name="local_shipping" size="sm" />
            Suivi de commande
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-3">
            Où en est ma commande ?
          </h1>
          <p className="text-on-surface-variant">
            Saisissez votre numéro de commande reçu par email ou SMS.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Ex : RM-ABCD12-EF3456"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-outline-variant focus:border-primary focus:outline-none text-on-surface placeholder:text-on-surface-variant font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading || !orderNumber.trim()}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Icon name="search" size="sm" />}
            Rechercher
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-error/5 border border-error/20 text-error mb-8">
            <Icon name="error" size="sm" className="flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Status badge */}
            {order.orderStatus !== 'cancelled' ? (
              <div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${STATUS_LABELS[order.orderStatus].color}`}>
                  <Icon name={STATUS_LABELS[order.orderStatus].icon} size="sm" />
                  {STATUS_LABELS[order.orderStatus].label}
                </div>

                {/* Progress bar */}
                <div className="mt-6 relative">
                  <div className="flex justify-between mb-2">
                    {STEPS.map((s, i) => (
                      <div
                        key={s}
                        className={`flex flex-col items-center gap-1 ${i <= currentStatusIndex ? 'text-primary' : 'text-on-surface-variant/40'}`}
                      >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          i < currentStatusIndex ? 'bg-primary border-primary' :
                          i === currentStatusIndex ? 'bg-primary/10 border-primary' :
                          'bg-surface-container border-outline-variant'
                        }`}>
                          <Icon name={i < currentStatusIndex ? 'check' : STATUS_LABELS[s].icon} size="sm"
                            className={i <= currentStatusIndex ? 'text-primary' : 'text-on-surface-variant/40'} />
                        </div>
                        <span className="text-[10px] font-medium hidden sm:block text-center leading-tight max-w-[60px]">
                          {STATUS_LABELS[s].label.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-outline-variant -z-10">
                    <div
                      className="h-full bg-primary transition-[width]"
                      style={{ width: `${Math.max(0, currentStatusIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${STATUS_LABELS.cancelled.color}`}>
                <Icon name="cancel" size="sm" />
                {STATUS_LABELS.cancelled.label}
              </div>
            )}

            {/* Order details */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-1">Numéro de commande</p>
                  <p className="font-mono font-bold text-on-surface">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-1">Date</p>
                  <p className="text-sm text-on-surface">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-4">
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-3">Articles commandés</p>
                <ul className="space-y-2">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-on-surface">{item.name} × {item.quantity}</span>
                      <span className="text-on-surface-variant">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-outline-variant pt-3 flex justify-between font-bold text-on-surface">
                <span>Total</span>
                <span className="text-primary">{order.total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};
