import React from 'react';
import { render, screen } from '@testing-library/react';

import LinkCategory from './index';

jest.mock('@/utils/apis/category', () => ({
  CategoryApi: {
    getLinkList: jest.fn(),
    createLink: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/components/Category', () => ({ getAllMethod, CreateMethod }: any) => (
  <div>
    <button onClick={() => getAllMethod()}>call getter</button>
    <button onClick={() => CreateMethod({ name: 'Docs' })}>call creator</button>
  </div>
), { virtual: true });

describe('LinkCategory', () => {
  test('wires link category APIs into shared Category component', () => {
    const { CategoryApi } = jest.requireMock('@/utils/apis/category');
    render(<LinkCategory />);

    screen.getByText('call getter').click();
    screen.getByText('call creator').click();

    expect(CategoryApi.getLinkList).toHaveBeenCalled();
    expect(CategoryApi.createLink).toHaveBeenCalledWith({ name: 'Docs' });
  });
});
