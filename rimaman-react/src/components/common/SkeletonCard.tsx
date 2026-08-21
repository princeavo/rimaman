import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-surface-container-low rounded-[2rem] p-8">
      <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-surface-container-highest skeleton" />
      <div className="h-6 bg-surface-container-highest rounded w-3/4 mb-4 skeleton" />
      <div className="h-4 bg-surface-container-highest rounded w-full mb-2 skeleton" />
      <div className="h-4 bg-surface-container-highest rounded w-5/6 mb-6 skeleton" />
      <div className="flex items-center justify-between">
        <div className="h-8 bg-surface-container-highest rounded w-24 skeleton" />
        <div className="w-12 h-12 bg-surface-container-highest rounded-full skeleton" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
