import React from 'react';

interface Props {
  data: { height: number };
}

export const SpacerBlock: React.FC<Props> = ({ data }) => (
  <div style={{ height: `${data.height}px` }} aria-hidden="true" />
);
