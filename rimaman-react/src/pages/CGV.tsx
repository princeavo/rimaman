import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsStore } from '../store/settingsStore';

export const CGV: React.FC = () => {
  const { contactEmail, contactPhone } = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <>
      <Helmet>
        <title>Conditions Générales de Vente | RIMAMAN</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="max-w-3xl mx-auto px-8 pt-32 pb-16">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">
          Conditions générales de vente
        </h1>

        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">1. Objet</h2>
            <p>
              Les présentes conditions régissent les ventes de produits RIMAMAN réalisées via ce site,
              que ce soit avec livraison ou retrait en point de vente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">2. Produits et prix</h2>
            <p>
              Les prix affichés sur le site sont en Francs CFA (FCFA), toutes taxes comprises le cas échéant.
              Le Moulin d'Or se réserve le droit de modifier ses prix à tout moment, les commandes déjà validées
              restant facturées au prix en vigueur au moment de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">3. Commande</h2>
            <p>
              Toute commande passée sur le site implique l'acceptation des présentes conditions générales de vente.
              Une confirmation est envoyée par email après validation de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">4. Paiement</h2>
            <p>
              Le paiement peut être effectué par Mobile Money (MTN, Moov), carte bancaire via nos partenaires
              de paiement en ligne (FedaPay, KKiaPay), ou en espèces à la livraison selon disponibilité.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">5. Livraison</h2>
            <p>
              La livraison est disponible sur Cotonou et Porto-Novo. Un retrait gratuit est possible sur l'un de
              nos points de vente. Les délais indiqués lors de la commande sont donnés à titre indicatif.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">6. Réclamations</h2>
            <p>
              En cas de problème avec votre commande (produit manquant, endommagé, etc.), contactez-nous au plus
              vite par WhatsApp, email ({contactEmail}) ou téléphone ({contactPhone}) : nous étudierons
              chaque situation au cas par cas.
            </p>
          </section>
        </div>

        <p className="text-sm text-on-surface-variant/70 mt-12 pt-8 border-t border-outline-variant">
          Ce document est un modèle générique. Il doit être complété et validé (notamment la politique de
          retour/remboursement réelle) avant publication officielle.
        </p>
      </main>
    </>
  );
};
