import React from 'react';
import { render, screen } from '@testing-library/react';

import { PanelListItem } from '.';

describe('PanelListItem', () => {
  it('has class to style in Firefox', async () => {
    render(<PanelListItem onClick={jest.fn()} />);

    expect(await screen.findByRole('listitem')).toHaveClass('panel-list-item');
  });

  it('renders children', () => {
    render(<PanelListItem onClick={jest.fn()}>Text</PanelListItem>);

    expect(screen.getByRole('listitem')).toHaveTextContent('Text');
  });

  it('calls the onClick handler', async () => {
    const onClick = jest.fn();
    render(<PanelListItem onClick={onClick}>Text</PanelListItem>);

    (await screen.findByText('Text')).click();

    expect(onClick).toHaveBeenCalled();
  });
});
