import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsStore } from '../store/settingsStore';

export const PolitiqueConfidentialite: React.FC = () => {
  const contactEmail = useSettingsStore((state) => state.settings.contactEmail);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <>
      <Helmet>
        <title>Politique de confidentialité | RIMAMAN</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="max-w-3xl mx-auto px-8 pt-32 pb-16">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">
          Politique de confidentialité
        </h1>

        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Données collectées</h2>
            <p>
              Lorsque vous passez commande ou nous contactez via ce site, nous collectons les informations que
              vous fournissez volontairement : nom, email, téléphone, adresse de livraison.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Utilisation des données</h2>
            <p>
              Ces données sont utilisées uniquement pour traiter votre commande, répondre à vos questions et
              vous contacter au sujet de votre commande. Elles ne sont pas revendues à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Paiement</h2>
            <p>
              Les paiements en ligne sont traités par nos partenaires FedaPay et KKiaPay. Nous ne stockons
              jamais vos informations bancaires sur nos serveurs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Vos droits</h2>
            <p>
              Vous pouvez demander à tout moment l'accès, la correction ou la suppression de vos données
              personnelles en nous contactant à {contactEmail}.
            </p>
          </section>
        </div>

        <p className="text-sm text-on-surface-variant/70 mt-12 pt-8 border-t border-outline-variant">
          Ce document est un modèle générique. Il doit être complété et validé avant publication officielle.
        </p>
      </main>
    </>
  );
};
