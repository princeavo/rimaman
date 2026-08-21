import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
        <Icon name={icon} size="xl" className="text-on-surface-variant" />
      </div>
      <h3 className="text-2xl font-bold text-on-surface font-headline mb-3">
        {title}
      </h3>
      <p className="text-on-surface-variant max-w-md mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
