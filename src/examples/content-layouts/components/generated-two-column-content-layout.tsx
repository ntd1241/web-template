/**
 * Scaffolded by layout-builder from `src/examples/content-layouts/layout/content-layout.fixture.ts`. Run `npm run gen:layout` — do NOT hand-write this file.
 * You own this file now — provide navigation/content slots and override the layout config as needed.
 * To change the defaults, edit the spec and re-gen to a scratch path first.
 */
import type { ReactNode } from 'react';
import type {
  LayoutAreaHeight,
  LayoutAreaSize,
} from '@/builders/layout/layout-area-size-options';
import { ContentLayout } from '@/components/layouts/content-layout';

export const GeneratedTwoColumnContentLayoutDefaults = {
  navigationSize: 'md',
  navigationMinSize: 'sm',
  navigationMaxSize: 'xl',
  navigationHeight: 'fit',
  contentHeight: 'fit',
  navigationResizable: false,
} as const;

export interface GeneratedTwoColumnContentLayoutProps {
  navigation: ReactNode;
  content: ReactNode;
  navigationSize?: LayoutAreaSize;
  navigationMinSize?: LayoutAreaSize;
  navigationMaxSize?: LayoutAreaSize;
  navigationHeight?: LayoutAreaHeight;
  contentHeight?: LayoutAreaHeight;
  navigationResizable?: boolean;
  className?: string;
}

export function GeneratedTwoColumnContentLayout({
  navigation,
  content,
  navigationSize = GeneratedTwoColumnContentLayoutDefaults.navigationSize,
  navigationMinSize = GeneratedTwoColumnContentLayoutDefaults.navigationMinSize,
  navigationMaxSize = GeneratedTwoColumnContentLayoutDefaults.navigationMaxSize,
  navigationHeight = GeneratedTwoColumnContentLayoutDefaults.navigationHeight,
  contentHeight = GeneratedTwoColumnContentLayoutDefaults.contentHeight,
  navigationResizable = GeneratedTwoColumnContentLayoutDefaults.navigationResizable,
  className,
}: GeneratedTwoColumnContentLayoutProps) {
  return (
    <ContentLayout
      navigation={navigation}
      content={content}
      navigationSize={navigationSize}
      navigationMinSize={navigationMinSize}
      navigationMaxSize={navigationMaxSize}
      navigationHeight={navigationHeight}
      contentHeight={contentHeight}
      navigationResizable={navigationResizable}
      className={className}
    />
  );
}
