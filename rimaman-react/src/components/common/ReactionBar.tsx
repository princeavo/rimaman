import React, { useEffect, useState } from 'react';
import {
  type ReactionEmoji,
  type ReactionCount,
  fetchArticleReactions,
  fetchRecipeReactions,
  incrementArticleReaction,
  incrementRecipeReaction,
} from '../../api/reactions';

const EMOJIS: { emoji: ReactionEmoji; label: string; icon: string }[] = [
  { emoji: 'HEART', label: 'J\'aime', icon: '❤️' },
  { emoji: 'CLAP',  label: 'Bravo',  icon: '👏' },
  { emoji: 'YUM',   label: 'Délicieux', icon: '😋' },
  { emoji: 'FIRE',  label: 'Incroyable', icon: '🔥' },
];

function storageKey(type: 'article' | 'recipe', targetId: string) {
  return `reactions_${type}_${targetId}`;
}

function getReacted(type: 'article' | 'recipe', targetId: string): ReactionEmoji[] {
  try {
    const raw = localStorage.getItem(storageKey(type, targetId));
    return raw ? (JSON.parse(raw) as ReactionEmoji[]) : [];
  } catch {
    return [];
  }
}

function toggleReacted(type: 'article' | 'recipe', targetId: string, emoji: ReactionEmoji) {
  const current = getReacted(type, targetId);
  const next = current.includes(emoji) ? current.filter((e) => e !== emoji) : [...current, emoji];
  localStorage.setItem(storageKey(type, targetId), JSON.stringify(next));
  return next;
}

interface ReactionBarProps {
  type: 'article' | 'recipe';
  targetId: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ type, targetId }) => {
  const [counts, setCounts] = useState<Record<ReactionEmoji, number>>({
    HEART: 0, CLAP: 0, YUM: 0, FIRE: 0,
  });
  const [reacted, setReacted] = useState<ReactionEmoji[]>([]);

  useEffect(() => {
    setReacted(getReacted(type, targetId));
    const fetch = type === 'article' ? fetchArticleReactions : fetchRecipeReactions;
    fetch(targetId).then((data: ReactionCount[]) => {
      const map = { HEART: 0, CLAP: 0, YUM: 0, FIRE: 0 } as Record<ReactionEmoji, number>;
      data.forEach((r) => { map[r.emoji] = r.count; });
      setCounts(map);
    }).catch(() => {/* silent */});
  }, [type, targetId]);

  const handleClick = async (emoji: ReactionEmoji) => {
    const nextReacted = toggleReacted(type, targetId, emoji);
    setReacted(nextReacted);

    const isAdding = nextReacted.includes(emoji);
    setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, prev[emoji] + (isAdding ? 1 : -1)) }));

    if (isAdding) {
      try {
        const increment = type === 'article' ? incrementArticleReaction : incrementRecipeReaction;
        const result = await increment(targetId, emoji);
        setCounts((prev) => ({ ...prev, [emoji]: result.count }));
      } catch {/* silent */}
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-on-surface-variant font-medium mr-1">Votre réaction :</span>
      {EMOJIS.map(({ emoji, label, icon }) => {
        const active = reacted.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleClick(emoji)}
            title={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all select-none ${
              active
                ? 'border-primary bg-primary/10 text-primary scale-105'
                : 'border-outline-variant text-on-surface-variant hover:border-primary/50 hover:scale-105'
            }`}
          >
            <span className="text-base leading-none">{icon}</span>
            {counts[emoji] > 0 && (
              <span className={active ? 'text-primary' : 'text-on-surface-variant'}>
                {counts[emoji]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
