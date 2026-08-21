import React from 'react';
import { Button } from '../../common/Button';

interface Props {
  data: {
    title: string;
    text?: string;
    buttonLabel: string;
    buttonHref: string;
  };
}

export const CtaBannerBlock: React.FC<Props> = ({ data }) => (
  <div className="bg-primary rounded-2xl p-10 md:p-14 text-center text-on-primary">
    <h2 className="text-2xl md:text-4xl font-bold font-headline mb-4">{data.title}</h2>
    {data.text && (
      <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">{data.text}</p>
    )}
    <a href={data.buttonHref}>
      <Button variant="secondary" size="lg">
        {data.buttonLabel}
      </Button>
    </a>
  </div>
);
