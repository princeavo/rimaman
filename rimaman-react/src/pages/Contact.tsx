import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { ContactMap } from '../components/features/ContactMap';
import { BrandIcon, hasBrandIcon } from '../components/common/BrandIcon';
import { useToastStore } from '../store/toastStore';
import { useSettingsStore } from '../store/settingsStore';
import { trackFormSubmit } from '../utils/analytics';
import { sendContactMessage } from '../api/contact';
import { ApiError } from '../api/client';

export const Contact: React.FC = () => {
  const { contactPhone, contactEmail, companyAddress, mapGoogleUrl, mapLat, mapLng, socialLinks } =
    useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const showToast = useToastStore((state) => state.showToast);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Le sujet est requis';
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendContactMessage(formData);
      showToast('Message envoyé avec succès ! Nous vous répondrons bientôt.', 'success');
      trackFormSubmit('Contact');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Erreur lors de l'envoi. Veuillez réessayer.";
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const inputClass = (field: string) =>
    `w-full bg-surface-container-low border-0 border-b-2 ${
      errors[field] ? 'border-error' : 'border-outline-variant'
    } focus:border-primary focus:ring-0 px-4 py-3 text-on-surface rounded-t-lg transition-colors`;

  const INFO_ITEMS = [
    { icon: 'phone_iphone', label: 'Téléphone & WhatsApp', value: contactPhone },
    { icon: 'mail',         label: 'Email',                value: contactEmail  },
    { icon: 'location_on',  label: 'Adresse',              value: companyAddress },
  ];

  return (
    <>
      <Helmet>
        <title>Contact - Les Farines RIMAMAN du Moulin d'Or</title>
        <meta
          name="description"
          content="Contactez le Moulin d'Or pour toute question sur nos farines bio RIMAMAN."
        />
      </Helmet>

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-8 mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-primary mb-6 tracking-tight">
            Contactez le Moulin d'Or
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Une question sur nos farines bio ou un projet culinaire ? Notre équipe artisanale est à
            votre écoute pour vous accompagner.
          </p>
        </section>

        {/* Grid principal */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Colonne gauche : coordonnées + carte ── */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Coordonnées */}
            <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-headline font-bold text-on-surface">Nos coordonnées</h2>

              {INFO_ITEMS.map(({ icon, label, value }) => (
                <div key={icon} className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
                    <Icon name={icon} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="font-semibold text-on-surface leading-snug">{value}</p>
                  </div>
                </div>
              ))}

              {/* Réseaux sociaux */}
              {socialLinks.length > 0 && (
                <div className="pt-6 border-t border-outline-variant/30">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                    Suivez-nous
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        title={link.platform}
                        className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors group"
                      >
                        {hasBrandIcon(link.icon)
                          ? <BrandIcon name={link.icon} size={18} className="text-on-surface-variant group-hover:text-on-primary transition-colors" />
                          : <Icon name={link.icon} size="sm" className="text-on-surface-variant group-hover:text-on-primary transition-colors" />}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Carte Leaflet */}
            {mapLat && mapLng ? (
              <div className="rounded-2xl overflow-hidden border border-outline-variant" style={{ height: '320px' }}>
                <ContactMap lat={mapLat} lng={mapLng} googleUrl={mapGoogleUrl} />
              </div>
            ) : (
              /* Image de repli si pas encore de carte configurée */
              <div className="relative overflow-hidden rounded-2xl h-64 group">
                <img
                  src="/rimaman.jpeg"
                  alt="Farine RIMAMAN – Qualité Bio"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white font-headline font-bold text-xl mb-1">
                    Qualité 100% Bio
                  </h3>
                  <p className="text-primary-fixed-dim text-sm">
                    Le goût authentique du terroir béninois dans chaque sachet.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div className="lg:col-span-7">
            <div className="bg-surface rounded-2xl p-8 md:p-12 border border-outline-variant">
              <h2 className="text-3xl font-headline font-extrabold text-primary mb-8">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant">Nom complet</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass('name')}
                      placeholder="Jean Dupont"
                      type="text"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && <p id="name-error" className="text-error text-sm">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant">Email</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass('email')}
                      placeholder="jean@exemple.com"
                      type="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && <p id="email-error" className="text-error text-sm">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Sujet</label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass('subject')}
                    placeholder="Demande d'information commerciale"
                    type="text"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                  />
                  {errors.subject && <p id="subject-error" className="text-error text-sm">{errors.subject}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={inputClass('message')}
                    placeholder="Comment pouvons-nous vous aider ?"
                    rows={5}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && <p id="message-error" className="text-error text-sm">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-12 rounded-full"
                >
                  {isSubmitting ? (
                    <><Icon name="hourglass_empty" size="sm" />Envoi en cours…</>
                  ) : (
                    <><Icon name="send" size="sm" />Envoyer le message</>
                  )}
                </Button>
              </form>
            </div>
          </div>

        </section>
      </main>
    </>
  );
};
