// @ts-expect-error tests crashes if React is not imported
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransferFundsForm from '@/components/TransferFundsForm';
import { useAccounts, useExchangeRates, useTransactions, useTransferFunds } from '@/api/hooks';


jest.mock('@/api/hooks.ts', () => ({
  useAccounts: jest.fn(),
  useExchangeRates: jest.fn(),
  useTransactions: jest.fn(),
  useTransferFunds: jest.fn(),
}));

const mockMutate = jest.fn();
const mockCallback = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TransferFundsForm', () => {
  beforeEach(() => {
    (useAccounts as jest.Mock).mockReturnValue({
      data: [
        { id: '1', ownerName: 'John Doe', balance: 200, currency: 'USD' },
        { id: '2', ownerName: 'Jane Doe', balance: 150, currency: 'EUR' },
      ],
      isPending: false,
      refetch: jest.fn(),
    });
    (useExchangeRates as jest.Mock).mockReturnValue({
      data: { USD: { EUR: 0.85 }, EUR: { USD: 1.15 } },
    });
    (useTransactions as jest.Mock).mockReturnValue({
      refetch: jest.fn(),
    });
    (useTransferFunds as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    });
  });

  test('renders the form with all fields', () => {
    render(<TransferFundsForm callback={mockCallback} />);

    expect(screen.getByLabelText(/From Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/To Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transfer/i })).toBeInTheDocument();
  });

  test('validates input fields', async () => {
    render(<TransferFundsForm callback={mockCallback} />);

    fireEvent.click(screen.getByRole('button', { name: /Transfer/i }));

    await waitFor(() => {
      expect(screen.getByText(/From account is required/i)).toBeInTheDocument();
      expect(screen.getByText(/To account is required/i)).toBeInTheDocument();
    });
  });

  test('submits form data correctly', async () => {
    render(<TransferFundsForm callback={mockCallback} />);

    fireEvent.input(screen.getByLabelText(/Amount/i), { target: { value: '50' } });

    const fromAccountSelectTrigger = screen.getByTestId('from-account-select-trigger');
    await userEvent.click(fromAccountSelectTrigger);
    const fromAccountOption = screen.getByRole('option', { name: 'John Doe, Balance: 200 USD' });
    await userEvent.click(fromAccountOption);

    const toAccountSelectTrigger = screen.getByTestId('to-account-select-trigger');
    await userEvent.click(toAccountSelectTrigger);
    const toAccountOption = screen.getByRole('option', { name: 'Jane Doe, Balance: 150 EUR' });

    await userEvent.click(toAccountOption);

    fireEvent.click(screen.getByRole('button', { name: /Transfer/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        fromAccountId: '1',
        toAccountId: '2',
        amount: 50,
      });
    });
  });

  test('calls callback on successful transfer', async () => {
    (useTransferFunds as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: true,
    });

    render(<TransferFundsForm callback={mockCallback} />);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  test('displays error message on amount exceeding balance', async () => {
    render(<TransferFundsForm callback={mockCallback} />);

    fireEvent.input(screen.getByLabelText(/Amount/i), { target: { value: '300' } });

    const fromAccountSelectTrigger = screen.getByTestId('from-account-select-trigger');
    await userEvent.click(fromAccountSelectTrigger);
    const fromAccountOption = screen.getByRole('option', { name: 'John Doe, Balance: 200 USD' });
    await userEvent.click(fromAccountOption);

    const toAccountSelectTrigger = screen.getByTestId('to-account-select-trigger');
    await userEvent.click(toAccountSelectTrigger);
    const toAccountOption = screen.getByRole('option', { name: 'Jane Doe, Balance: 150 EUR' });
    await userEvent.click(toAccountOption);

    fireEvent.click(screen.getByRole('button', { name: /Transfer/i }));

    await waitFor(() => {
      expect(screen.getByText(/Amount exceeds balance of from account/i)).toBeInTheDocument();
    });
  });

  test('displays exchange rate details', async () => {
    render(<TransferFundsForm callback={mockCallback} />);

    fireEvent.input(screen.getByLabelText(/Amount/i), { target: { value: '100' } });

    const fromAccountSelectTrigger = screen.getByTestId('from-account-select-trigger');
    await userEvent.click(fromAccountSelectTrigger);
    const fromAccountOption = screen.getByRole('option', { name: 'John Doe, Balance: 200 USD' });
    await userEvent.click(fromAccountOption);

    const toAccountSelectTrigger = screen.getByTestId('to-account-select-trigger');
    await userEvent.click(toAccountSelectTrigger);
    const toAccountOption = screen.getByRole('option', { name: 'Jane Doe, Balance: 150 EUR' });
    await userEvent.click(toAccountOption);

    await waitFor(() => {
      expect(screen.getByText(/Jane Doe will receive €85.00/i)).toBeInTheDocument();
    });
  });
});
