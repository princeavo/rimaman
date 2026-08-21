import React from 'react';
import { StarRating } from './StarRating';
import { getRatingDistribution, getAverageRating } from '../../constants/reviewsData';

interface ReviewStatsProps {
  productId: string;
  totalReviews: number;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({ productId, totalReviews }) => {
  const averageRating = getAverageRating(productId);
  const distribution = getRatingDistribution(productId);

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="bg-surface rounded-2xl p-8 shadow-lg">
      <h3 className="text-2xl font-headline font-bold text-on-surface mb-6">
        Avis Clients
      </h3>

      {/* Average Rating */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-outline-variant">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="md" />
          <p className="text-sm text-on-surface-variant mt-2">
            {totalReviews} avis
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as keyof typeof distribution];
            const percentage = getPercentage(count);

            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-on-surface w-8">
                  {stars}
                </span>
                <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-on-surface-variant w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-primary/5 rounded-xl p-4 text-center">
        <p className="text-sm text-on-surface">
          <span className="font-bold text-primary text-lg">
            {Math.round((distribution[5] + distribution[4]) / totalReviews * 100)}%
          </span>{' '}
          des clients recommandent ce produit
        </p>
      </div>
    </div>
  );
};
