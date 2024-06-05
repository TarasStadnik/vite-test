import {Account} from "@/types";
import React, {useEffect, useState} from "react";
import {useDeleteAccount} from "@/api/hooks";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import TransferFundsForm from "@/components/TransferFundsForm";
import {Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger} from "@/components/ui/menubar";
import {Menu} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

type Props = {
  account: Account
}
const AccountItem: React.FC<Props> = ({account}) => {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

  const {mutate: deleteAccount, isSuccess, isPending} = useDeleteAccount()

  useEffect(() => {
    if (isSuccess) {
      setIsDeleteDialogOpen(false)
    }
  }, [isSuccess]);

  const deleteAccountHandler = () => {
    deleteAccount(account.id)
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: account.currency || "USD",
  }).format(account.balance)

  return (
    <Card className="relative">
      <CardContent className="flex flex-col justify-between aspect-square p-6">
        <div>
          <CardDescription>Available balance</CardDescription>
          <CardTitle className="text-4xl">{formatted}</CardTitle>
        </div>

        <CardDescription className="text-xl mb-12">
          {account.ownerName}
        </CardDescription>

        <Button size="sm" onClick={() => setIsTransferDialogOpen(true)}>Transfer money</Button>

        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div>
              <TransferFundsForm fromAccountId={account.id} callback={() => setIsTransferDialogOpen(false)}/>
            </div>
          </DialogContent>
        </Dialog>

        <Menubar className="border-none absolute top-1 right-1">
          <MenubarMenu>
            <MenubarTrigger>
              <Menu size={16} />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setIsDeleteDialogOpen(true)}>
                Delete
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <AlertDialog  open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccountHandler} disabled={isPending}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  )
}

export default AccountItem