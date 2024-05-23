import { v4 as uuidv4 } from 'uuid';
import { Account, TransferFundsInput, TransferFundsResponse, Transaction } from './types';

let accounts: Account[] = [
  { id: uuidv4(), ownerName: "Bank Main Account", currency: 'USD', balance: 1000 },
  { id: uuidv4(), ownerName: "John Doe",  currency: 'EUR', balance: 500 },
  { id: uuidv4(), ownerName: "Alice",     currency: 'JPY', balance: 500 },
  { id: uuidv4(), ownerName: "Bob",       currency: 'CNY', balance: 500 },
];

const transactions: Transaction[] = [];

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];

const exchangeRates: Record<string, Record<string, number>> = {
  USD: {
    USD: 1,
    EUR: 0.85,
    GBP: 0.72,
    JPY: 110.0,
    CNY: 6.45,
  },
  EUR: {
    USD: 1.18,
    EUR: 1,
    GBP: 0.85,
    JPY: 130.0,
    CNY: 7.65,
  },
  GBP: {
    USD: 1.39,
    EUR: 1.18,
    GBP: 1,
    JPY: 150.0,
    CNY: 8.85,
  },
  JPY: {
    USD: 0.0091,
    EUR: 0.0077,
    GBP: 0.0067,
    JPY: 1,
    CNY: 0.059,
  },
  CNY: {
    USD: 0.16,
    EUR: 0.13,
    GBP: 0.11,
    JPY: 17.0,
    CNY: 1,
  },
};



export const getCurrencies = (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currencies);
    }, 500);
  });
}

export const getExchangeRates = (): Promise<Record<string, Record<string, number>>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(exchangeRates);
    }, 500);
  });
}

export const getAccounts = (): Promise<Account[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...accounts]);
    }, 500);
  });
};

export const createAccount = (account: Omit<Account, 'id'>): Promise<Account> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAccount = { ...account, id: uuidv4() };
      accounts.push(newAccount);
      resolve(newAccount);

    }, 500);
  });
};

export const deleteAccount = (id: string): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      accounts = accounts.filter(account => account.id !== id);
      resolve({ success: true });
    }, 500);
  });
};

export const searchAccounts = (name: string): Promise<Account[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (name) {
        const result = accounts.filter(account => account.ownerName.toLowerCase().includes(name.toLowerCase()) );
        resolve(result);
      } else {
        resolve([])
      }
    }, 100);
  });
};

export const transferFunds = (
  { fromAccountId, toAccountId, amount }: TransferFundsInput,
  invalidateTransactions: () => void
): Promise<TransferFundsResponse> => {

  return new Promise((resolve) => {
    setTimeout(() => {
      const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
      const toAccount = accounts.find((acc) => acc.id === toAccountId);

      if (!fromAccount || !toAccount) {
        resolve({ success: false, message: 'Account not found' });
        return;
      }

      if (fromAccount.balance < amount) {
        resolve({ success: false, message: 'Insufficient balance' });
        return;
      }

      const amountInOriginalCurrency = amount;
      const amountInDestinationCurrency = amount * exchangeRates[fromAccount.currency][toAccount.currency];

      const transaction: Transaction = {
        id: uuidv4(),
        fromAccountId,
        fromAccountOwnerName: fromAccount.ownerName,
        toAccountId,
        toAccountOwnerName: toAccount.ownerName,
        originalAmount: amountInOriginalCurrency,
        amount: amountInDestinationCurrency,
        originalCurrency: fromAccount.currency,
        currency: toAccount.currency,
        status: 'success',
        date: new Date().toISOString()
      };

      transactions.push(transaction);
      invalidateTransactions();

      fromAccount.balance -= amountInOriginalCurrency;
      toAccount.balance += amountInDestinationCurrency;

      resolve({ success: true });
    }, 500);
  });
};

export const getTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...transactions]);
    }, 500);
  });
};
