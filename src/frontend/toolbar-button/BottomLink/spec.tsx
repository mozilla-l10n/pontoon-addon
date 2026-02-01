import React from 'react';
import { render, screen } from '@testing-library/react';

import { BottomLink } from '.';

describe('BottomLink', () => {
  it('renders text', () => {
    render(<BottomLink>TEXT</BottomLink>);

    expect(screen.getByRole('link')).toHaveTextContent('TEXT');
  });

  it('calls onClick handler', async () => {
    const onClick = jest.fn();
    render(<BottomLink onClick={onClick} />);

    (await screen.findByRole('link')).click();

    expect(onClick).toHaveBeenCalled();
  });
});
