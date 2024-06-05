import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateAccount, useCurrencies } from '@/api/hooks';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const createAccountSchema = z.object({
  ownerName: z.string().min(1, { message: "Owner Name is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  balance: z.number().min(1, { message: "Balance must be a positive number" }),
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

type Props = {
  callback?: () => void;
};

const CreateAccountForm: React.FC<Props> = ({ callback }) => {
  const { mutate, error, data, isSuccess, isPending } = useCreateAccount();
  const { data: currencies, isLoading: isLoadingCurrencies } = useCurrencies();

  useEffect(() => {
    if (isSuccess && callback) {
      callback();
    }
  }, [isSuccess, callback]);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      ownerName: '',
      currency: '',
      balance: 0,
    },
  });

  const onSubmit = (data: CreateAccountFormValues) => {
    mutate(data);
  };

  return (
    <div>
      <h2>Create Account</h2>
      <Form {...form} >
        <form role="form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="ownerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="ownerName">Owner name</FormLabel>
                <FormControl>
                  <Input id="ownerName" type="text" {...field} disabled={isPending} placeholder="John doe" />
                </FormControl>
                <FormMessage>{form.formState.errors.ownerName?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="currency">Currency</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}
                          defaultValue={field.value} disabled={isPending || isLoadingCurrencies} >
                    <SelectTrigger id="currency" data-testid='currency-select-trigger'
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies?.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>{form.formState.errors.currency?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="balance">Balance</FormLabel>
                <FormControl>
                  <Input id="balance" type="number"
                         {...field}
                         placeholder="Balance"
                         disabled={isPending}
                         onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.balance?.message}</FormMessage>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>Create</Button>
        </form>
      </Form>

      {error && <div>Error: {error.message}</div>}
      {data && <div>Account created successfully</div>}
    </div>
  );
};

export default CreateAccountForm;
