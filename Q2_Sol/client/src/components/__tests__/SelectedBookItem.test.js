import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SelectedBookItem from '../SelectedBookItem';

it('SelectedBookItem should render passed props as content body', () => {
  const book = {
    id: 0,
    author: 'John',
    title: 'Hello world',
    summary: 'First book',
  };

  const { getByTestId } = render(<SelectedBookItem book={book} />);

  expect(getByTestId('bookItem-title-0').textContent).toBe('Hello world');
  expect(getByTestId('bookItem-author-0').textContent).toBe('John');
  expect(getByTestId('bookItem-summary-0').textContent).toBe('First book');
});
