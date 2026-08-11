import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GeneratedTwoColumnContentLayout } from '../../examples/content-layouts/components/generated-two-column-content-layout';

describe('generated content layout render proof', () => {
  it('mounts navigation and content slots with layout overrides', () => {
    render(
      <GeneratedTwoColumnContentLayout
        navigation={<div>Navigation slot</div>}
        content={<div>Content slot</div>}
        navigationHeight="fill"
        contentHeight="fill"
        navigationResizable
      />,
    );

    expect(screen.getByText('Navigation slot')).toBeInTheDocument();
    expect(screen.getByText('Content slot')).toBeInTheDocument();
    expect(
      screen.getByText('Content slot').closest('[data-slot="scroll-area"]'),
    ).toBeNull();
  });

  it('keeps the outer content scroll area for fit layouts', () => {
    render(
      <GeneratedTwoColumnContentLayout
        navigation={<div>Fit navigation</div>}
        content={<div>Fit content</div>}
        contentHeight="fit"
      />,
    );

    expect(
      screen.getByText('Fit content').closest('[data-slot="scroll-area"]'),
    ).not.toBeNull();
  });
});
