import React from 'react';
import { render, screen } from '@testing-library/react';

import ArticleCategory from './index';

jest.mock('@/utils/apis/category', () => ({
  CategoryApi: {
    getArticleList: jest.fn(),
    createArticle: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/components/Category', () => ({ getAllMethod, CreateMethod }: any) => (
  <div>
    <button onClick={() => getAllMethod()}>call getter</button>
    <button onClick={() => CreateMethod({ name: 'Go' })}>call creator</button>
  </div>
), { virtual: true });

describe('ArticleCategory', () => {
  test('wires article category APIs into shared Category component', () => {
    const { CategoryApi } = jest.requireMock('@/utils/apis/category');
    render(<ArticleCategory />);

    screen.getByText('call getter').click();
    screen.getByText('call creator').click();

    expect(CategoryApi.getArticleList).toHaveBeenCalled();
    expect(CategoryApi.createArticle).toHaveBeenCalledWith({ name: 'Go' });
  });
});
