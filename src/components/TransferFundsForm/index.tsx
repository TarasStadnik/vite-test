import React, {useEffect, useMemo} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {useAccounts, useExchangeRates, useTransactions, useTransferFunds} from '@/api';
import { Account } from '@/types';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input, Button } from '@/components/ui';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';


type TransferFundsFormData = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
};

type Props = {
  fromAccountId?: string;
  toAccountId?: string;
  callback: () => void;
}

const TransferFundsForm: React.FC<Props> = ({ fromAccountId, toAccountId, callback }) => {
  const { data: accounts, isPending: isLoadingAccounts, refetch: refetchAccounts } = useAccounts();
  const { refetch: refetchTransactions } = useTransactions();
  const { data: exchangeRates} = useExchangeRates();
  const { mutate: transferFunds, isPending, isSuccess} = useTransferFunds();

  useEffect(() => {
    if (isSuccess && callback) {
      void refetchAccounts()
      void refetchTransactions()
      callback();
    }
  }, [isSuccess, callback, refetchAccounts, refetchTransactions]);

  const form = useForm<TransferFundsFormData>({
    resolver: zodResolver(
      z.object({
        fromAccountId: z.string().min(1, "From account is required"),
        toAccountId: z.string().min(1, "To account is required"),
        amount: z.number().positive("Amount must be positive"),
      }).refine((data) => data.fromAccountId !== data.toAccountId, {
        message: "From and to accounts cannot be the same",
        path: ["toAccountId"],
      }).refine((data) => {
        const fromAccount = accounts?.find(account => account.id === data.fromAccountId);
        return fromAccount ? data.amount <= fromAccount.balance : true;
      }, {
        message: "Amount exceeds balance of from account",
        path: ["amount"],
      })
    ),
    defaultValues: {
      fromAccountId: fromAccountId ?? '',
      toAccountId: toAccountId ?? '',
      amount: 100
    },
  });

  const toAccount = useMemo(() => accounts?.find(account => account.id === form.getValues().toAccountId), [accounts, form.getValues().toAccountId]);

  const exchangeDetails = useMemo(() => {
    if (!exchangeRates || !form.getValues().amount) {
      return null;
    }

    const fromAccount = accounts?.find(account => account.id === form.getValues().fromAccountId);

    if (!fromAccount || !toAccount) {
      return null;
    }

    const fromCurrency = fromAccount.currency;
    const toCurrency = toAccount.currency;

    const exchangeRate = exchangeRates[fromCurrency]?.[toCurrency];

    if (!exchangeRate) {
      return null;
    }

    return {
      fromCurrency,
      toCurrency,
      exchangeRate,
      fromAmount: form.getValues().amount,
      toAmount: form.getValues().amount * exchangeRate,
    };

  }, [exchangeRates, form.getValues(), accounts, toAccount]);

  const onSubmit = (data: TransferFundsFormData) => {
    transferFunds(data);
  };

  if (isLoadingAccounts) {
    return <div>Loading accounts...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fromAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Account</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account: Account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {`${account.ownerName}, Balance: ${account.balance} ${account.currency}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Account</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.filter((account) => account.id !== form.getValues().fromAccountId)?.map((account: Account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {`${account.ownerName}, Balance: ${account.balance} ${account.currency}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  disabled={isPending}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  placeholder="Enter amount" />
              </FormControl>
              <FormMessage />
              {exchangeDetails && (
                <p className="text-muted-foreground">
                  {toAccount?.ownerName} will receive {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: exchangeDetails.toCurrency || "USD",
                }).format(exchangeDetails.toAmount)}
                </p>
              )}
            </FormItem>
          )}
        />

        <Button className="mt-4 w-full" type="submit" disabled={isPending}>
          {isPending ? 'Transferring...' : 'Transfer'}
        </Button>
      </form>
    </Form>
  );
};

export default TransferFundsForm;
