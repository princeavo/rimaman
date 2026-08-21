import React from 'react';
import { Icon } from '../common/Icon';
import { StarRating } from './StarRating';
import type { Review } from '../../constants/reviewsData';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="font-bold text-primary">
                {review.author.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface">{review.author}</span>
                {review.verified && (
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Icon name="verified" size="sm" />
                    <span>Vérifié</span>
                  </div>
                )}
              </div>
              <span className="text-sm text-on-surface-variant">
                {formatDate(review.date)}
              </span>
            </div>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h4 className="font-bold text-on-surface mb-2">{review.title}</h4>
        <p className="text-on-surface-variant leading-relaxed">{review.comment}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-outline-variant">
        <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="thumb_up" size="sm" />
          <span>Utile ({review.helpful})</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="flag" size="sm" />
          <span>Signaler</span>
        </button>
      </div>
    </div>
  );
};
