// @ts-expect-error tests crashes if React is not imported
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateAccountForm from '@/components/CreateAccountForm';
import { useCreateAccount, useCurrencies } from '@/api/hooks';

jest.mock('@/api/hooks.ts', () => ({
  useCreateAccount: jest.fn(),
  useCurrencies: jest.fn(),
}));

const mockMutate = jest.fn();
const mockCallback = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CreateAccountForm', () => {
  beforeEach(() => {
    (useCreateAccount as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: null,
      data: null,
      isSuccess: false,
      isPending: false,
    });
    (useCurrencies as jest.Mock).mockReturnValue({
      data: ['USD', 'EUR'],
      isLoading: false,
    });
  });

  test('renders the form with all fields', () => {
    render(<CreateAccountForm />);

    expect(screen.getByLabelText(/Owner name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Balance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  test('validates input fields', async () => {
    render(<CreateAccountForm />);

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(screen.getByText(/Owner Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Currency is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Balance must be a positive number/i)).toBeInTheDocument();
    });
  });

  test('submits form data correctly', async () => {
    render(<CreateAccountForm callback={mockCallback} />);

    fireEvent.input(screen.getByLabelText(/Owner name/i), { target: { value: 'John Doe' } });

    const selectTrigger = screen.getByTestId('currency-select-trigger');
    await userEvent.click(selectTrigger, { pointerState: await userEvent.pointer({ target: selectTrigger }) });

    const selectOption = screen.getByRole('option', { name: 'USD' });
    await waitFor(() => {
      expect(selectOption).toBeEnabled();
    });
    await userEvent.click(selectOption);

    fireEvent.input(screen.getByLabelText(/Balance/i), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        ownerName: 'John Doe',
        currency: 'USD',
        balance: 100,
      });
    });
  });

  test('calls callback on successful account creation', async () => {
    (useCreateAccount as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: null,
      data: null,
      isSuccess: true,
      isPending: false,
    });

    render(<CreateAccountForm callback={mockCallback} />);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  test('displays error message on failure', async () => {
    (useCreateAccount as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      error: { message: 'Network error' },
      data: null,
      isSuccess: false,
      isPending: false,
    });

    render(<CreateAccountForm />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });
});