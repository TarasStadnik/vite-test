// src/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

import {
  getAccounts,
  createAccount,
  deleteAccount,
  searchAccounts,
  transferFunds,
  getTransactions,
  getCurrencies,
  getExchangeRates
} from './mockBackend';
import { Account, TransferFundsInput, TransferFundsResponse, Transaction } from './types';


export const useCurrencies = () => {
  return useQuery<string[], Error>({
    queryKey: ['currencies'],
    queryFn: getCurrencies
  });
}

export const useExchangeRates = () => {
  return useQuery<Record<string, Record<string, number>>, Error>({
    queryKey: ['exchangeRates'],
    queryFn: getExchangeRates
  });
}


export const useAccounts = () => {
  return useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: getAccounts
  });
};

export const useTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: getTransactions
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, Omit<Account, 'id'>>({
    mutationFn: createAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
};

export const useSearchAccounts = (name: string) => {
  return useQuery<Account[], Error>({
    queryKey: ['accounts', name],
    queryFn: () => searchAccounts(name),
    enabled: !!name
  });
};

export const useTransferFunds = () => {
  const queryClient = useQueryClient();

  const invalidateTransactions = () => {
    void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    void queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  return useMutation<TransferFundsResponse, Error, TransferFundsInput>({
    mutationFn: (data) => transferFunds(data, invalidateTransactions),
    onSuccess: () => {
      queryClient.setQueryData<Account[]>(['accounts'], oldAccounts => {
        if (!oldAccounts) return [];

        return oldAccounts.map(account => {

          return {...account, id: uuidv4()};
        });
      });

      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.refetchQueries({ queryKey: ['accounts'] })
    },
    onSettled: () => {
      invalidateTransactions();
    }
  });
};


