import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import axiosMock from 'axios';
import '@testing-library/jest-dom/extend-expect';
import AutoComplete from '../AutoComplete';

afterEach(cleanup);

it('renders input box and button', () => {
  const { queryByTestId, queryByPlaceholderText } = render(<AutoComplete />);

  expect(queryByTestId('add-book__button')).toBeTruthy();
  expect(queryByPlaceholderText('Search')).toBeTruthy();
});

describe('Input value', () => {
  describe('on change', () => {
    it('updates on change', () => {
      const { queryByPlaceholderText } = render(<AutoComplete />);
      const searchInput = queryByPlaceholderText('Search');

      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(searchInput).toHaveValue('test');
    });
  });
});
