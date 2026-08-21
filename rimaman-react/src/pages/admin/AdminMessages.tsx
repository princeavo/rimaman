import { toast } from '../../store/toastStore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAllContactMessages, updateContactMessageStatus } from '../../api/contact';
import type { ContactMessage } from '../../api/contact';

const STATUS_LABELS: Record<ContactMessage['status'], string> = {
  new: 'Nouveau',
  read: 'Lu',
  archived: 'Archivé',
};

const STATUS_COLORS: Record<ContactMessage['status'], string> = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  archived: 'bg-surface-container text-on-surface-variant',
};

const FILTERS: Array<{ value: ContactMessage['status'] | 'all'; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'new', label: 'Nouveaux' },
  { value: 'read', label: 'Lus' },
  { value: 'archived', label: 'Archivés' },
];

export const AdminMessages: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: messages, loading, error } = useAsyncData(fetchAllContactMessages, [refreshKey]);
  const [filter, setFilter] = useState<ContactMessage['status'] | 'all'>('new');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const filtered = (messages ?? []).filter((m) => filter === 'all' || m.status === filter);

  const markAs = async (id: string, status: ContactMessage['status']) => {
    setActingId(id);
    try {
      await updateContactMessageStatus(id, status);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Messages | Admin RIMAMAN</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold font-headline text-on-surface mb-6">Messages de contact</h1>

        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger les messages.</p>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-center text-on-surface-variant py-12">Aucun message dans cette catégorie.</p>
            )}
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-2xl border overflow-hidden ${
                  msg.status === 'new' ? 'border-primary/30' : 'border-outline-variant'
                }`}
              >
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
                  onClick={() => {
                    setExpandedId(expandedId === msg.id ? null : msg.id);
                    if (msg.status === 'new') markAs(msg.id, 'read');
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-on-surface">{msg.name}</span>
                      <span className="text-sm text-on-surface-variant">&lt;{msg.email}&gt;</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[msg.status]}`}>
                        {STATUS_LABELS[msg.status]}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface mt-0.5 truncate">{msg.subject}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Icon name={expandedId === msg.id ? 'expand_less' : 'expand_more'} size="sm" className="text-on-surface-variant flex-shrink-0" />
                </button>

                {expandedId === msg.id && (
                  <div className="border-t border-outline-variant px-5 py-4">
                    <p className="text-on-surface leading-relaxed whitespace-pre-wrap text-sm mb-4">
                      {msg.message}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Icon name="reply" size="sm" />
                        Répondre par email
                      </a>
                      {msg.status !== 'archived' && (
                        <button
                          disabled={actingId === msg.id}
                          onClick={() => markAs(msg.id, 'archived')}
                          className="text-xs px-3 py-1.5 bg-surface-container text-on-surface-variant rounded-lg font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
                        >
                          Archiver
                        </button>
                      )}
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
