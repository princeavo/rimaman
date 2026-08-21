import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Si fourni, affiche une option "Créer …" en bas de liste */
  onCreate?: (inputValue: string) => void;
  createLabel?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner…',
  disabled = false,
  className = '',
  onCreate,
  createLabel = 'Créer',
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState<number>(-1);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const showCreate = onCreate && query.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  const totalItems = filtered.length + (showCreate ? 1 : 0);

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        setHighlighted(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll de l'item highlighted
  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const item = listRef.current.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const select = (opt: ComboboxOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
    setHighlighted(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { setOpen(true); setHighlighted(0); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, totalItems - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlighted >= 0 && highlighted < filtered.length) {
          select(filtered[highlighted]);
        } else if (showCreate && highlighted === filtered.length) {
          onCreate!(query.trim());
          setOpen(false);
          setQuery('');
          setHighlighted(-1);
        }
        break;
      case 'Escape':
        setOpen(false);
        setQuery('');
        setHighlighted(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-sm transition-colors ${
          disabled
            ? 'bg-surface-container border-outline-variant text-on-surface-variant/50 cursor-not-allowed'
            : open
            ? 'border-primary ring-2 ring-primary/20 bg-white'
            : 'border-outline-variant bg-white hover:border-primary/50 cursor-pointer'
        }`}
        onClick={() => { if (!disabled) { setOpen((o) => !o); inputRef.current?.focus(); } }}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          disabled={disabled}
          className="flex-1 bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant min-w-0 cursor-pointer"
          placeholder={open ? 'Rechercher…' : (selected?.label ?? placeholder)}
          value={open ? query : ''}
          onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
          onFocus={() => { if (!disabled) setOpen(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={`${id}-list`}
          aria-activedescendant={highlighted >= 0 ? `${id}-opt-${highlighted}` : undefined}
        />
        {!open && selected && (
          <span className="flex-1 absolute left-3 pointer-events-none text-on-surface">
            {selected.label}
          </span>
        )}
        <Icon
          name={open ? 'expand_less' : 'expand_more'}
          size="sm"
          className="text-on-surface-variant flex-shrink-0 pointer-events-none"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-outline-variant rounded-xl shadow-xl max-h-56 overflow-y-auto py-1"
        >
          {filtered.length === 0 && !showCreate && (
            <li className="px-4 py-3 text-sm text-on-surface-variant text-center">
              Aucun résultat
            </li>
          )}

          {filtered.map((opt, idx) => (
            <li
              key={opt.value}
              id={`${id}-opt-${idx}`}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={(e) => { e.preventDefault(); select(opt); }}
              onMouseEnter={() => setHighlighted(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                highlighted === idx
                  ? 'bg-primary/10 text-primary'
                  : opt.value === value
                  ? 'bg-surface-container font-medium text-on-surface'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {opt.value === value && (
                <Icon name="check" size="sm" className="text-primary flex-shrink-0" />
              )}
              <span className={opt.value === value ? '' : 'ml-5'}>{opt.label}</span>
            </li>
          ))}

          {showCreate && (
            <li
              id={`${id}-opt-${filtered.length}`}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                onCreate!(query.trim());
                setOpen(false);
                setQuery('');
                setHighlighted(-1);
              }}
              onMouseEnter={() => setHighlighted(filtered.length)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer border-t border-outline-variant/50 transition-colors ${
                highlighted === filtered.length
                  ? 'bg-primary/10 text-primary'
                  : 'text-primary hover:bg-primary/5'
              }`}
            >
              <Icon name="add" size="sm" className="flex-shrink-0" />
              {createLabel} «&nbsp;{query.trim()}&nbsp;»
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
