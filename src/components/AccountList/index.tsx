import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateAccountForm from "@/components/CreateAccountForm";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";

import { Plus } from "lucide-react"

import { useAccounts } from "@/api";
import { Account } from "@/types.ts";
import { Card } from "@/components/ui";
import { CardContent } from "@/components/ui/card.tsx";

import AccountItem from "@/components/AccountList/AccountItem";

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
