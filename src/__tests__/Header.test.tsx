// @ts-expect-error tests crashes if React is not imported
import React from 'react';
import {render, screen, fireEvent, waitFor, within} from '@testing-library/react';
import Header from '@/components/Header';
import {useAccounts, useExchangeRates, useSearchAccounts, useTransactions, useTransferFunds} from '@/api';

jest.mock('@/assets/react.svg', () => 'mocked-svg');

jest.mock('@/api', () => ({
  useSearchAccounts: jest.fn(),
  useAccounts: jest.fn(),
  useTransactions: jest.fn(),
  useExchangeRates: jest.fn(),
  useTransferFunds: jest.fn(),
}));


beforeEach(() => {
  jest.clearAllMocks();
});

describe('Header', () => {
  beforeEach(() => {
    (useSearchAccounts as jest.Mock).mockImplementation((searchText) => {
      if (searchText.includes('John')) {
        return {
          data: [
            { id: 1, ownerName: 'John Doe', balance: 1000, currency: 'USD' },
          ],
        };
      }
      if (searchText.includes('Jane')) {
        return {
          data: [
            { id: 2, ownerName: 'Jane Doe', balance: 2000, currency: 'EUR' },
          ],
        };
      }
      return { data: [] };
    });

    (useTransactions as jest.Mock).mockReturnValue({ data: null, isLoading: true });
    (useExchangeRates as jest.Mock).mockReturnValue({
      data: { USD: { EUR: 0.85 }, EUR: { USD: 1.15 } },
    });
    (useAccounts as jest.Mock).mockReturnValue({
      data: [
        { id: 1, ownerName: 'John Doe', balance: 1000, currency: 'USD' },
        { id: 2, ownerName: 'Jane Doe', balance: 2000, currency: 'EUR' },
      ],
    });
    (useTransferFunds as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
    });
  });

  test('renders the header with logo and search input', () => {
    render(<Header />);

    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  test('displays search results on input', async () => {
    render(<Header />);

    fireEvent.input(screen.getByPlaceholderText('Search...'), { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe - $1,000.00')).toBeInTheDocument();
    });
  });

  test('opens transfer dialog on account selection', async () => {
    render(<Header />);

    fireEvent.input(screen.getByPlaceholderText('Search...'), { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe - $1,000.00')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('John Doe - $1,000.00'));

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog-1');

      expect(within(dialog).getByTestId('transfer-button')).toBeInTheDocument();
    });
  });


  test('clears search text when dialog is closed', async () => {
    render(<Header />);

    fireEvent.input(screen.getByPlaceholderText('Search...'), { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe - $1,000.00')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('John Doe - $1,000.00'));

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog-1');

      expect(within(dialog).getByTestId('close-button')).toBeInTheDocument();

      fireEvent.click(within(dialog).getByTestId('close-button'));
    });


    await waitFor(() => {
      expect(screen.queryByText('John Doe - $1,000.00')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search...')).toHaveValue('');
    });
  });
});