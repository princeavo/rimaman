import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsStore } from '../store/settingsStore';

export const MentionsLegales: React.FC = () => {
  const { contactEmail, contactPhone, companyAddress } = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <>
      <Helmet>
        <title>Mentions légales | RIMAMAN</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="max-w-3xl mx-auto px-8 pt-32 pb-16">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">Mentions légales</h1>

        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Éditeur du site</h2>
            <p>
              Le site RIMAMAN est édité par Le Moulin d'Or.
              <br />
              <span className="italic">
                Forme juridique, numéro RCCM/IFU et raison sociale complète à compléter par l'entreprise.
              </span>
            </p>
            <p className="mt-2">
              Adresse : {companyAddress}
              <br />
              Téléphone : {contactPhone}
              <br />
              Email : {contactEmail}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Hébergement</h2>
            <p>
              <span className="italic">Nom et adresse de l'hébergeur du site à compléter.</span>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur ce site (textes, images, logo) est la propriété du Moulin d'Or,
              sauf mention contraire. Toute reproduction sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface mb-2">Contact</h2>
            <p>
              Pour toute question relative au site, contactez-nous à l'adresse {contactEmail} ou au {contactPhone}.
            </p>
          </section>
        </div>

        <p className="text-sm text-on-surface-variant/70 mt-12 pt-8 border-t border-outline-variant">
          Ce document est un modèle générique. Il doit être complété et validé avec les informations légales
          exactes de l'entreprise avant publication officielle.
        </p>
      </main>
    </>
  );
};
