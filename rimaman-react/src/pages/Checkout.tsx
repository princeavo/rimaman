import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { PaymentModal } from '../components/common/PaymentModal';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { getPaymentService } from '../services/payment.service';
import { createOrder } from '../api/orders';
import { validatePromoCode } from '../api/promoCodes';
import type { PromoValidation } from '../api/promoCodes';
import { ApiError } from '../api/client';
import type { ShippingAddress } from '../types';
import type { PaymentProvider } from '../types/payment';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const showToast = useToastStore(state => state.showToast);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'moov' | 'card' | 'cash'>('mtn');
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('fedapay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Cotonou',
    country: 'Bénin',
    additionalInfo: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [promoInput, setPromoInput] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = getTotalPrice();
  const shippingCost = deliveryMethod === 'delivery' ? (subtotal >= 5000 ? 0 : 1000) : 0;
  const discount = promoValidation?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/panier');
    return null;
  }

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^[0-9]{8,}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Email invalide';
    }
    if (deliveryMethod === 'delivery' && !shippingAddress.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    if (deliveryMethod === 'delivery' && !shippingAddress.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      showToast('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }
    setStep((prev) => Math.min(3, prev + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3);
  };

  const handlePromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoValidation(null);
    try {
      const result = await validatePromoCode(code, subtotal + shippingCost);
      setPromoValidation(result);
    } catch {
      setPromoError('Code promo invalide ou expiré.');
    } finally {
      setPromoLoading(false);
    }
  };

  const buildOrderPayload = () => ({
    items: items.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      weight: item.weight,
      image: item.image,
    })),
    subtotal,
    shippingCost,
    discount,
    total,
    shippingAddress,
    deliveryMethod,
    paymentMethod,
    ...(promoValidation ? { promoCode: promoValidation.code } : {}),
  });

  const handleSubmit = async () => {
    // Cash on delivery - no online payment needed
    if (paymentMethod === 'cash') {
      setIsProcessing(true);
      try {
        const order = await createOrder(buildOrderPayload());

        clearCart();
        showToast('Commande enregistrée! Paiement à la livraison.', 'success');
        navigate(`/commande/${order.orderNumber}`);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Erreur lors de l\'enregistrement. Veuillez réessayer.';
        showToast(message, 'error');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Online payment (MTN, Moov, Card)
    setIsProcessing(true);
    setShowPaymentModal(true);

    try {
      const paymentService = getPaymentService();
      paymentService.setProvider(paymentProvider);

      // Check if payment provider is configured
      if (!paymentService.isConfigured()) {
        throw new Error(`${paymentService.getProviderName()} n'est pas configuré. Veuillez contacter l'administrateur.`);
      }

      const orderNumberHint = `RM${Date.now()}`;

      // Prepare payment request
      const paymentRequest = {
        amount: total,
        currency: 'XOF',
        description: `Commande RIMAMAN ${orderNumberHint}`,
        customer: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
        },
        orderId: orderNumberHint,
        metadata: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryMethod,
          shippingAddress: deliveryMethod === 'delivery' ? shippingAddress : null,
        },
      };

      // Process payment
      const response = await paymentService.processPayment(paymentRequest);

      setShowPaymentModal(false);

      if (response.success) {
        // La commande n'est enregistrée qu'une fois le paiement confirmé.
        const order = await createOrder(buildOrderPayload());

        clearCart();
        showToast('Paiement effectué avec succès!', 'success');
        navigate(`/commande/${order.orderNumber}?transaction=${response.transactionId}`);
      } else {
        showToast(response.error || 'Paiement échoué. Veuillez réessayer.', 'error');
      }
    } catch (error) {
      setShowPaymentModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du paiement';
      showToast(errorMessage, 'error');
      console.error('Payment Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Paiement | RIMAMAN</title>
      </Helmet>

      <main className="pt-32 pb-24 bg-surface-container-low min-h-screen">
        <div className="max-w-7xl mx-auto px-8">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        step >= s
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {step > s ? <Icon name="check" /> : s}
                    </div>
                    <span
                      className={`hidden md:block font-semibold ${
                        step >= s ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {s === 1 && 'Livraison'}
                      {s === 2 && 'Paiement'}
                      {s === 3 && 'Confirmation'}
                    </span>
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 rounded ${
                        step > s ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="bg-surface rounded-2xl p-8">
                  <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">
                    Informations de livraison
                  </h2>

                  {/* Delivery Method */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-on-surface-variant mb-4">
                      Mode de livraison
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          deliveryMethod === 'delivery'
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <Icon name="local_shipping" className="text-primary mb-2" />
                        <div className="font-bold text-on-surface">Livraison à domicile</div>
                        <div className="text-sm text-on-surface-variant">24-48h</div>
                      </button>
                      <button
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          deliveryMethod === 'pickup'
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <Icon name="store" className="text-primary mb-2" />
                        <div className="font-bold text-on-surface">Retrait en point de vente</div>
                        <div className="text-sm text-on-surface-variant">Gratuit</div>
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 ${
                          errors.fullName ? 'border-error' : 'border-transparent'
                        } focus:border-primary focus:ring-0`}
                        placeholder="Jean Dupont"
                      />
                      {errors.fullName && (
                        <p className="text-error text-sm mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 ${
                            errors.phone ? 'border-error' : 'border-transparent'
                          } focus:border-primary focus:ring-0`}
                          placeholder="+229 XX XX XX XX"
                        />
                        {errors.phone && (
                          <p className="text-error text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={shippingAddress.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 ${
                            errors.email ? 'border-error' : 'border-transparent'
                          } focus:border-primary focus:ring-0`}
                          placeholder="jean@exemple.com"
                        />
                        {errors.email && (
                          <p className="text-error text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {deliveryMethod === 'delivery' && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-on-surface-variant mb-2">
                            Adresse de livraison *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 ${
                              errors.address ? 'border-error' : 'border-transparent'
                            } focus:border-primary focus:ring-0`}
                            placeholder="123 Rue de la République"
                          />
                          {errors.address && (
                            <p className="text-error text-sm mt-1">{errors.address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-2">
                              Ville *
                            </label>
                            <select
                              value={shippingAddress.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary focus:ring-0"
                            >
                              <option>Cotonou</option>
                              <option>Porto-Novo</option>
                              <option>Autre</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-2">
                              Pays
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.country}
                              disabled
                              className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border-2 border-transparent text-on-surface-variant"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-on-surface-variant mb-2">
                            Informations complémentaires (optionnel)
                          </label>
                          <textarea
                            value={shippingAddress.additionalInfo}
                            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary focus:ring-0"
                            rows={3}
                            placeholder="Instructions de livraison, code d'accès, etc."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/panier')}
                      className="flex-1"
                    >
                      Retour au panier
                    </Button>
                    <Button variant="primary" size="lg" onClick={handleNext} className="flex-1">
                      Continuer
                      <Icon name="arrow_forward" size="sm" className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-surface rounded-2xl p-8">
                  <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">
                    Mode de paiement
                  </h2>

                  {/* Payment Provider Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-on-surface-variant mb-4">
                      Plateforme de paiement
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setPaymentProvider('fedapay')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          paymentProvider === 'fedapay'
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <div className="font-bold text-on-surface text-lg mb-1">FedaPay</div>
                        <div className="text-sm text-on-surface-variant">
                          Plateforme de paiement sécurisée
                        </div>
                        {paymentProvider === 'fedapay' && (
                          <Icon name="check_circle" className="text-primary mt-2" />
                        )}
                      </button>
                      <button
                        onClick={() => setPaymentProvider('kkiapay')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          paymentProvider === 'kkiapay'
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <div className="font-bold text-on-surface text-lg mb-1">KKiaPay</div>
                        <div className="text-sm text-on-surface-variant">
                          Solution de paiement mobile
                        </div>
                        {paymentProvider === 'kkiapay' && (
                          <Icon name="check_circle" className="text-primary mt-2" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {/* MTN Mobile Money */}
                    <button
                      onClick={() => setPaymentMethod('mtn')}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        paymentMethod === 'mtn'
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black">
                        MTN
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-on-surface">MTN Mobile Money</div>
                        <div className="text-sm text-on-surface-variant">Sans frais</div>
                      </div>
                      {paymentMethod === 'mtn' && (
                        <Icon name="check_circle" className="text-primary" />
                      )}
                    </button>

                    {/* Moov Money */}
                    <button
                      onClick={() => setPaymentMethod('moov')}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        paymentMethod === 'moov'
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                        M
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-on-surface">Moov Money</div>
                        <div className="text-sm text-on-surface-variant">Sans frais</div>
                      </div>
                      {paymentMethod === 'moov' && (
                        <Icon name="check_circle" className="text-primary" />
                      )}
                    </button>

                    {/* Card */}
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      <Icon name="credit_card" size="lg" className="text-primary" />
                      <div className="flex-1">
                        <div className="font-bold text-on-surface">Carte bancaire</div>
                        <div className="text-sm text-on-surface-variant">Visa, Mastercard (frais 2%)</div>
                      </div>
                      {paymentMethod === 'card' && (
                        <Icon name="check_circle" className="text-primary" />
                      )}
                    </button>

                    {/* Cash on Delivery */}
                    {deliveryMethod === 'delivery' && (
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          paymentMethod === 'cash'
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <Icon name="payments" size="lg" className="text-primary" />
                        <div className="flex-1">
                          <div className="font-bold text-on-surface">Paiement à la livraison</div>
                          <div className="text-sm text-on-surface-variant">Espèces uniquement</div>
                        </div>
                        {paymentMethod === 'cash' && (
                          <Icon name="check_circle" className="text-primary" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Promo code */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-on-surface-variant mb-3">
                      Code promo (optionnel)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); setPromoValidation(null); }}
                        placeholder="Ex : RIMAMAN10"
                        className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                        disabled={!!promoValidation}
                      />
                      {promoValidation ? (
                        <button
                          type="button"
                          onClick={() => { setPromoValidation(null); setPromoInput(''); setPromoError(''); }}
                          className="px-4 py-3 rounded-xl border-2 border-error/40 text-error text-sm font-semibold hover:bg-error/5 transition-colors"
                        >
                          Retirer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePromo}
                          disabled={promoLoading || !promoInput.trim()}
                          className="px-4 py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {promoLoading ? '...' : 'Vérifier'}
                        </button>
                      )}
                    </div>
                    {promoValidation && (
                      <p className="mt-2 text-sm text-primary font-semibold flex items-center gap-1.5">
                        <Icon name="check_circle" size="sm" />
                        Code appliqué — {promoValidation.discountType === 'PERCENT'
                          ? `${promoValidation.discountValue}% de réduction`
                          : `−${promoValidation.discountAmount.toLocaleString()} FCFA`}
                      </p>
                    )}
                    {promoError && (
                      <p className="mt-2 text-sm text-error flex items-center gap-1.5">
                        <Icon name="error" size="sm" />
                        {promoError}
                      </p>
                    )}
                  </div>

                  <div className="bg-primary/10 p-4 rounded-xl flex items-start gap-3 mb-8">
                    <Icon name="lock" size="sm" className="text-primary flex-shrink-0 mt-1" />
                    <div className="text-sm text-on-surface">
                      <strong>Paiement 100% sécurisé</strong> - Vos données sont protégées par cryptage SSL. Nous ne stockons jamais vos informations bancaires.
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
                      <Icon name="arrow_back" size="sm" className="mr-2" />
                      Retour
                    </Button>
                    <Button variant="primary" size="lg" onClick={handleNext} className="flex-1">
                      Continuer
                      <Icon name="arrow_forward" size="sm" className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="bg-surface rounded-2xl p-8">
                  <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">
                    Confirmation de commande
                  </h2>

                  {/* Shipping Info */}
                  <div className="mb-8">
                    <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                      <Icon name="local_shipping" size="sm" className="text-primary" />
                      Livraison
                    </h3>
                    <div className="bg-surface-container-low p-4 rounded-xl text-sm">
                      <p className="font-semibold">{shippingAddress.fullName}</p>
                      <p>{shippingAddress.phone}</p>
                      <p>{shippingAddress.email}</p>
                      {deliveryMethod === 'delivery' && (
                        <>
                          <p className="mt-2">{shippingAddress.address}</p>
                          <p>{shippingAddress.city}, {shippingAddress.country}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-8">
                    <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                      <Icon name="payment" size="sm" className="text-primary" />
                      Paiement
                    </h3>
                    <div className="bg-surface-container-low p-4 rounded-xl text-sm">
                      {paymentMethod === 'mtn' && 'MTN Mobile Money'}
                      {paymentMethod === 'moov' && 'Moov Money'}
                      {paymentMethod === 'card' && 'Carte bancaire'}
                      {paymentMethod === 'cash' && 'Paiement à la livraison'}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-8">
                    <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                      <Icon name="shopping_bag" size="sm" className="text-primary" />
                      Articles ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-on-surface-variant">{item.weight}</p>
                          </div>
                          <p className="text-sm">×{item.quantity}</p>
                          <p className="font-bold">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
                      <Icon name="arrow_back" size="sm" className="mr-2" />
                      Retour
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Icon name="hourglass_empty" size="sm" className="mr-2 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <Icon name="check_circle" size="sm" className="mr-2" />
                          Confirmer et payer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-2xl p-6 sticky top-24">
                <h3 className="font-headline font-bold text-xl text-on-surface mb-6">
                  Récapitulatif
                </h3>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">
                        {item.name} ×{item.quantity}
                      </span>
                      <span className="font-semibold">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-outline-variant pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Sous-total</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Livraison</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-primary">Gratuite</span>
                      ) : (
                        `${shippingCost.toLocaleString()} FCFA`
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary">Code promo ({promoValidation!.code})</span>
                      <span className="font-semibold text-primary">−{discount.toLocaleString()} FCFA</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-outline-variant pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{total.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          if (!isProcessing) {
            setShowPaymentModal(false);
          }
        }}
        provider={paymentProvider}
        amount={total}
        isProcessing={isProcessing}
      />
    </>
  );
};
