import React, { useState } from 'react';
import { Icon } from './Icon';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
      bg: 'bg-[#25D366]',
      icon: 'chat',
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-[#229ED9]',
      icon: 'send',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2]',
      icon: 'thumb_up',
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap py-8 border-t border-b border-outline-variant">
      <span className="text-sm font-medium text-on-surface-variant flex-shrink-0">Partager :</span>

      {/* Native share — mobile only */}
      {'share' in navigator && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors sm:hidden"
        >
          <Icon name="ios_share" size="sm" />
          Partager
        </button>
      )}

      {channels.map(({ label, href, bg, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${bg} text-white text-sm font-semibold hover:opacity-90 transition-opacity`}
        >
          <Icon name={icon} size="sm" />
          {label}
        </a>
      ))}

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
          copied
            ? 'border-primary bg-primary/8 text-primary'
            : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
        }`}
      >
        <Icon name={copied ? 'check_circle' : 'link'} size="sm" />
        {copied ? 'Lien copié !' : 'Copier le lien'}
      </button>
    </div>
  );
};
