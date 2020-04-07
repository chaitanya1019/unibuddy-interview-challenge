import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import axiosMock from 'axios';
import '@testing-library/jest-dom/extend-expect';
import AutoComplete from '../AutoComplete';

afterEach(cleanup);

it('renders input box and button', () => {
  const { queryByTestId } = render(<AutoComplete />);

  expect(queryByTestId('add-book__button')).toBeTruthy();
  expect(queryByTestId('summary-input')).toBeTruthy();
});

describe('Input value', () => {
  describe('on change', () => {
    it('updates on change', () => {
      const { queryByTestId } = render(<AutoComplete />);
      const searchInput = queryByTestId('summary-input');

      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(searchInput).toHaveValue('test');
    });
  });
});
