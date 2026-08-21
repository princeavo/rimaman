import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import type { PaymentProvider } from '../../types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: PaymentProvider;
  amount: number;
  isProcessing: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  provider,
  amount,
  isProcessing,
}) => {
  if (!isOpen) return null;

  const providerName = provider === 'fedapay' ? 'FedaPay' : 'KKiaPay';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container-highest hover:bg-surface-container-high transition-colors flex items-center justify-center"
          aria-label="Fermer"
        >
          <Icon name="close" size="sm" />
        </button>

        {/* Content */}
        <div className="text-center">
          {isProcessing ? (
            <>
              {/* Processing State */}
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="hourglass_empty" size="xl" className="text-primary animate-spin" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">
                Traitement en cours...
              </h3>
              <p className="text-on-surface-variant mb-6">
                Veuillez patienter pendant que nous traitons votre paiement via {providerName}.
              </p>
              <div className="bg-primary/5 rounded-xl p-4 text-sm text-on-surface-variant">
                <Icon name="info" size="sm" className="inline mr-2 text-primary" />
                Ne fermez pas cette fenêtre
              </div>
            </>
          ) : (
            <>
              {/* Ready State */}
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="payment" size="xl" className="text-primary" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">
                Paiement sécurisé
              </h3>
              <p className="text-on-surface-variant mb-2">
                Vous allez être redirigé vers {providerName} pour finaliser votre paiement de
              </p>
              <p className="text-4xl font-bold text-primary mb-6">
                {amount.toLocaleString()} FCFA
              </p>

              {/* Payment methods */}
              <div className="bg-surface-container-low rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-on-surface mb-3">
                  Modes de paiement acceptés :
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-xs font-bold">
                      MTN
                    </div>
                    <span className="text-sm">MTN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                    <span className="text-sm">Moov</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="credit_card" size="sm" className="text-primary" />
                    <span className="text-sm">Carte</span>
                  </div>
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant mb-6">
                <Icon name="lock" size="sm" className="text-primary" />
                <span>Paiement 100% sécurisé SSL</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Annuler
                </Button>
                <Button variant="primary" onClick={onClose} className="flex-1">
                  Continuer
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
