import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AccountsList from '@/components/AccountList';
import { useAccounts, useDeleteAccount, useCreateAccount, useCurrencies } from '@/api/hooks';

jest.mock('@/api/hooks.ts', () => ({
  useAccounts: jest.fn(),
  useDeleteAccount: jest.fn(),
  useCreateAccount: jest.fn(),
  useCurrencies: jest.fn(),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AccountsList', () => {
  beforeEach(() => {
    (useAccounts as jest.Mock).mockReturnValue({
      data: [
        { id: '1', ownerName: 'John Doe', currency: 'USD', balance: 1000 },
        { id: '2', ownerName: 'Jane Smith', currency: 'EUR', balance: 2000 },
      ],
    });

    (useDeleteAccount as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isSuccess: false,
      isPending: false,
    });

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders the list of accounts correctly', async () => {

    render(<AccountsList />, { wrapper });

    // Check if the accounts are rendered
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  });

  it('opens the CreateAccountForm dialog when the add account card is clicked', async () => {
    (useCurrencies as jest.Mock).mockReturnValue({
      data: ['USD', 'EUR', 'GBP'],
      isLoading: false,
    });

    (useCreateAccount as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
      data: null,
      isSuccess: false,
      isPending: false,
    });

    render(<AccountsList />, { wrapper });

    // Click the add account card
    fireEvent.click(screen.getByText(/Add account/i));

    // Check if the dialog is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });
});
