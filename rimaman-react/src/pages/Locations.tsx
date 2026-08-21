import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { LocationMap } from '../components/features/LocationMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useLocations } from '../hooks/useLocations';

export const Locations: React.FC = () => {
  const { data: locations, loading, error, retry } = useLocations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const count = locations?.length ?? 0;

  return (
    <>
      <Helmet>
        <title>Où Acheter - Les Farines RIMAMAN du Moulin d'Or</title>
        <meta name="description" content="Trouvez RIMAMAN près de chez vous, sur les marchés et boutiques partenaires." />
      </Helmet>

      <header className="pt-28 pb-12 px-8 max-w-7xl mx-auto text-center">
        <span className="inline-block py-1 px-4 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-4">
          Localisation
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-6 font-headline">
          Trouvez RIMAMAN près de chez vous
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          {loading
            ? 'Chargement des points de vente…'
            : count > 0
              ? `Nos farines sont disponibles dans ${count} point${count > 1 ? 's' : ''} de vente. Cliquez sur un lieu pour le localiser sur la carte.`
              : 'Nos farines sont disponibles dans plusieurs marchés et boutiques partenaires.'}
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <Icon name="cloud_off" size="xl" className="text-on-surface-variant" />
          <p className="text-on-surface-variant text-center">
            Impossible de charger les points de vente pour le moment.
          </p>
          <button
            onClick={retry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium hover:bg-surface-container transition-colors"
          >
            <Icon name="refresh" size="sm" />
            Réessayer
          </button>
        </div>
      ) : locations!.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Icon name="location_off" size="xl" className="text-on-surface-variant" />
          <p className="text-on-surface-variant">Aucun point de vente disponible pour le moment.</p>
        </div>
      ) : (
        <section className="px-8 max-w-7xl mx-auto mb-20">
          <LocationMap
            locations={locations ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {(locations ?? []).map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedId(location.id)}
                className={`flex items-center gap-2 font-medium px-5 py-2 rounded-full border transition-colors ${
                  selectedId === location.id
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary border-primary/20'
                }`}
              >
                <Icon name="location_on" size="sm" />
                {location.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="px-8 max-w-7xl mx-auto mb-20">
        <div className="bg-primary/75 rounded-2xl p-10 md:p-16 text-center">
          <div className="max-w-2xl mx-auto">
            <Icon name="handshake" size="xl" className="text-on-primary mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-on-primary font-headline mb-4">
              Vous tenez un commerce ?
            </h2>
            <p className="text-on-primary/80 mb-8">
              Vous souhaitez vendre RIMAMAN dans votre boutique ou sur votre marché ? Contactez-nous pour en discuter.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-on-primary text-primary px-8 py-4 rounded-full font-semibold hover:bg-on-primary/90 transition-colors"
            >
              Nous contacter
              <Icon name="arrow_forward" size="sm" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
