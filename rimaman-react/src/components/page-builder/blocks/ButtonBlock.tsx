import React from 'react';
import { Button } from '../../common/Button';

interface Props {
  data: {
    label: string;
    href: string;
    variant: 'primary' | 'outline' | 'secondary';
  };
}

export const ButtonBlock: React.FC<Props> = ({ data }) => (
  <a href={data.href}>
    <Button variant={data.variant} size="lg">
      {data.label}
    </Button>
  </a>
);
