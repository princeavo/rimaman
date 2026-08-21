import { toast } from '../../store/toastStore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAllOrders, updateOrderStatus } from '../../api/orders';
import type { Order } from '../../types';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  failed: 'Échouée',
  refunded: 'Remboursée',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export const AdminOrders: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: orders, loading, error } = useAsyncData(fetchAllOrders, [refreshKey]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (
    id: string,
    field: 'orderStatus' | 'paymentStatus',
    value: string,
  ) => {
    setUpdating(id);
    try {
      await updateOrderStatus(id, { [field]: value });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Commandes | Admin RIMAMAN</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold font-headline text-on-surface mb-6">Commandes</h1>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger les commandes.</p>
        ) : (
          <div className="space-y-3">
            {(orders ?? []).length === 0 && (
              <p className="text-center text-on-surface-variant py-16">Aucune commande pour l'instant.</p>
            )}
            {(orders ?? []).map((order: Order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
                {/* Header row */}
                <button
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-surface-container-low transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-primary text-sm">{order.orderNumber}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.orderStatus] ?? ''}`}>
                        {ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.paymentStatus] ?? ''}`}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {order.shippingAddress.fullName} &middot;{' '}
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')} &middot;{' '}
                      <strong>{order.total.toLocaleString()} FCFA</strong>
                    </p>
                  </div>
                  <Icon name={expandedId === order.id ? 'expand_less' : 'expand_more'} size="sm" className="text-on-surface-variant flex-shrink-0" />
                </button>

                {/* Expanded detail */}
                {expandedId === order.id && (
                  <div className="border-t border-outline-variant px-6 pb-6 pt-4 space-y-4">
                    {/* Items */}
                    <div>
                      <p className="text-sm font-semibold text-on-surface mb-2">Articles</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3 text-sm">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="flex-1 text-on-surface">{item.name} &times;{item.quantity}</span>
                            <span className="font-semibold">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <p className="text-sm font-semibold text-on-surface mb-1">Livraison</p>
                      <p className="text-sm text-on-surface-variant">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.phone}<br />
                        {order.shippingAddress.address}, {order.shippingAddress.city}
                      </p>
                    </div>

                    {/* Status controls */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-on-surface mb-1">
                          Statut commande
                        </label>
                        <select
                          value={order.orderStatus}
                          disabled={updating === order.id}
                          onChange={(e) => handleStatusChange(order.id, 'orderStatus', e.target.value)}
                          className="text-sm border border-outline-variant rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-primary"
                        >
                          {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-on-surface mb-1">
                          Statut paiement
                        </label>
                        <select
                          value={order.paymentStatus}
                          disabled={updating === order.id}
                          onChange={(e) => handleStatusChange(order.id, 'paymentStatus', e.target.value)}
                          className="text-sm border border-outline-variant rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-primary"
                        >
                          {Object.entries(PAYMENT_STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      {updating === order.id && <LoadingSpinner size="sm" />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
