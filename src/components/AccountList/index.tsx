import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";

import { useAccounts } from "@/api/hooks";
import { Account } from "@/types";

import CreateAccountForm from "@/components/CreateAccountForm";
import AccountItem from "@/components/AccountList/AccountItem";

import { Plus } from "lucide-react"

const AccountsList: React.FC = () => {
  const { data } = useAccounts();
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState<boolean>(false)

  return (
    <>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <h2 className="text-xl ml-2 mb-2">Accounts</h2>
        <CarouselPrevious className="top-4 right-10 left-auto" />
        <CarouselNext className="top-4 right-0 left-auto" />
        <CarouselContent className="-ml-1">
          <CarouselItem className="pl-1 basis-[280px]">
            <div className="p-2">
              <Card className="cursor-pointer" onClick={() => setIsCreateAccountDialogOpen(true)}>
                <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                  <Plus size={36}/>
                  <span className="text-xl">Add account</span>
                </CardContent>
              </Card>
            </div>

          </CarouselItem>
          {data?.map((account: Account) => (
            <CarouselItem className="pl-1 basis-[280px]" key={account.id}>
              <div className="p-2">
                <AccountItem account={account} />
              </div>
            </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>

      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div>
            <CreateAccountForm callback={() => setIsCreateAccountDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AccountsList
