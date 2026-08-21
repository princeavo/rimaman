import React from 'react';
import type { PageBlock } from '../../api/pages';
import { HeadingBlock } from './blocks/HeadingBlock';
import { RichTextBlock } from './blocks/RichTextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ImageTextBlock } from './blocks/ImageTextBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { ButtonGroupBlock } from './blocks/ButtonGroupBlock';
import { CtaBannerBlock } from './blocks/CtaBannerBlock';
import { StatsBlock } from './blocks/StatsBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ProductGridBlock } from './blocks/ProductGridBlock';
import { RecipeGridBlock } from './blocks/RecipeGridBlock';

interface Props {
  block: PageBlock;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockData = any;

export const BlockRenderer: React.FC<Props> = ({ block }) => {
  const d = block.data as BlockData;

  switch (block.type) {
    case 'heading':
      return <HeadingBlock data={d} />;
    case 'rich_text':
      return <RichTextBlock data={d} />;
    case 'image':
      return <ImageBlock data={d} media={block.media} />;
    case 'image_text':
      return <ImageTextBlock data={d} media={block.media} />;
    case 'button':
      return <ButtonBlock data={d} />;
    case 'button_group':
      return <ButtonGroupBlock data={d} />;
    case 'cta_banner':
      return <CtaBannerBlock data={d} />;
    case 'stats':
      return <StatsBlock data={d} />;
    case 'video':
      return <VideoBlock data={d} media={block.media} />;
    case 'spacer':
      return <SpacerBlock data={d} />;
    case 'product_grid':
      return <ProductGridBlock data={d} />;
    case 'recipe_grid':
      return <RecipeGridBlock data={d} />;
    default:
      return null;
  }
};
