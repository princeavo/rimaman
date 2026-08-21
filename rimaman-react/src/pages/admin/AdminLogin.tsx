import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../../store/adminStore';
import { Icon } from '../../components/common/Icon';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, user, clearError } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <>
      <Helmet>
        <title>Connexion Admin | RIMAMAN</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="RIMAMAN" className="h-20 w-auto mx-auto mb-2" />
            <p className="text-on-surface-variant text-sm">Espace Administration</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-8">
            <h1 className="text-xl font-bold text-on-surface mb-6 text-center">Connexion</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  placeholder="admin@rimaman.bj"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div role="alert" className="flex items-center gap-2 text-error text-sm bg-error/5 border border-error/20 px-4 py-3 rounded-xl">
                  <Icon name="error" size="sm" className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Connexion…
                  </>
                ) : (
                  <>
                    <Icon name="login" size="sm" />
                    Se connecter
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
