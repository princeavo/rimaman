import React from 'react';

interface HeadingBlockData {
  text: string;
  level: 1 | 2 | 3;
}

interface Props {
  data: HeadingBlockData;
}

export const HeadingBlock: React.FC<Props> = ({ data }) => {
  const Tag = `h${data.level}` as 'h1' | 'h2' | 'h3';
  const cls =
    data.level === 1
      ? 'text-4xl md:text-5xl font-bold font-headline text-on-surface leading-tight'
      : data.level === 2
      ? 'text-3xl md:text-4xl font-bold font-headline text-on-surface'
      : 'text-2xl font-bold font-headline text-on-surface';
  return <Tag className={cls}>{data.text}</Tag>;
};
