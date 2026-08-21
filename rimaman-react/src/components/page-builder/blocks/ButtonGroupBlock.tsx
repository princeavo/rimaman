import React from 'react';
import { Button } from '../../common/Button';

interface ButtonItem {
  label: string;
  href: string;
  variant: 'primary' | 'outline' | 'secondary';
}

interface Props {
  data: {
    buttons: ButtonItem[];
  };
}

export const ButtonGroupBlock: React.FC<Props> = ({ data }) => (
  <div className="flex flex-wrap gap-4">
    {data.buttons.map((btn, i) => (
      <a key={i} href={btn.href}>
        <Button variant={btn.variant} size="lg">
          {btn.label}
        </Button>
      </a>
    ))}
  </div>
);
