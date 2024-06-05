// @ts-expect-error tests crashes if React is not imported
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionsList from '@/components/TransactionsList';
import { useTransactions } from '@/api/hooks';

jest.mock('@/api/hooks.ts', () => ({
  useTransactions: jest.fn(),
}));

const mockTransactions = [
  {
    status: 'completed',
    date: new Date('2024-01-01T12:00:00Z').toISOString(),
    fromAccountOwnerName: 'John Doe',
    toAccountOwnerName: 'Jane Doe',
    originalAmount: '100.00',
    originalCurrency: 'USD',
    amount: '85.00',
    currency: 'EUR',
  },
  {
    status: 'pending',
    date: new Date('2024-01-02T12:00:00Z').toISOString(),
    fromAccountOwnerName: 'Alice Smith',
    toAccountOwnerName: 'Bob Johnson',
    originalAmount: '200.00',
    originalCurrency: 'EUR',
    amount: '230.00',
    currency: 'USD',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TransactionsList', () => {
  test('renders loading state initially', () => {
    (useTransactions as jest.Mock).mockReturnValue({ data: null, isLoading: true });
    render(<TransactionsList />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('renders transactions data', async () => {
    (useTransactions as jest.Mock).mockReturnValue({ data: mockTransactions, isLoading: false });
    render(<TransactionsList />);

    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  test('renders no results when there are no transactions', async () => {
    (useTransactions as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    render(<TransactionsList />);
    await waitFor(() => {
      expect(screen.getByText('No results.')).toBeInTheDocument();
    });
  });

  test('sorts transactions by date', async () => {
    (useTransactions as jest.Mock).mockReturnValue({data: mockTransactions, isLoading: false});
    render(<TransactionsList/>);

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    const dateHeader = screen.getByText('Date');
    await userEvent.click(dateHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      const firstRow = rows[1];
      expect(firstRow).toHaveTextContent('completed');
      expect(firstRow).toHaveTextContent('1/1/2024');
    });
  })

  test('paginates transactions', async () => {
    const mockLongTransactions = Array.from({ length: 20 }, (_, i) => ({
      status: 'completed',
      date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T12:00:00Z`).toISOString(),
      fromAccountOwnerName: `From ${i}`,
      toAccountOwnerName: `To ${i}`,
      originalAmount: `${i * 10}.00`,
      originalCurrency: 'USD',
      amount: `${i * 8}.00`,
      currency: 'EUR',
    }));

    (useTransactions as jest.Mock).mockReturnValue({ data: mockLongTransactions, isLoading: false });
    render(<TransactionsList />);

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    const previousButton = screen.getByText('Previous');
    await userEvent.click(previousButton);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });
  });
});
