import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page introuvable | RIMAMAN</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-[70vh] flex items-center justify-center px-8 py-24">
        <div className="text-center max-w-md">
          <Icon name="search_off" size="xl" className="text-on-surface-variant mb-6" />
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-3">
            Page introuvable
          </h1>
          <p className="text-on-surface-variant mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/">
              <Button variant="primary" size="lg">
                Retour à l'accueil
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};
