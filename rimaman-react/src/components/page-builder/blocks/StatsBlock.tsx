import React from 'react';

interface StatItem {
  value: string;
  label: string;
}

interface Props {
  data: { items: StatItem[] };
}

export const StatsBlock: React.FC<Props> = ({ data }) => (
  <div className={`grid grid-cols-2 md:grid-cols-${Math.min(data.items.length, 4)} gap-6`}>
    {data.items.map((item, i) => (
      <div
        key={i}
        className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant text-center"
      >
        <p className="text-3xl md:text-4xl font-bold font-headline text-primary mb-1">
          {item.value}
        </p>
        <p className="text-sm text-on-surface-variant">{item.label}</p>
      </div>
    ))}
  </div>
);
